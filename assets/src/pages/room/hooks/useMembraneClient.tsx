import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Channel, Socket } from "phoenix";
import { PeerMetadata, PeersState } from "./usePeerState";
import { SetErrorMessage } from "../RoomPage";
import { Callbacks, TrackEncoding } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";

export type ConnectionStatus = "before-connection" | "connected" | "connecting" | "error";

type Store = {
  getSnapshot: () => PeersState;
  setStore: (setter: (prevState: PeersState) => PeersState) => void;
  // subscribe: (listener: Listener) => void;
  subscribe: (onStoreChange: () => void) => () => void;
};

export type Listener = () => void;

export type UseMembraneClientType = {
  webrtc: MembraneWebRTC;
  messageEmitter: TypedEmitter<Partial<Callbacks>>;
  signaling: Channel;
  webrtcConnectionStatus: ConnectionStatus;
  signalingStatus: ConnectionStatus;
  store: Store;
};

// zustand przekazuje state and prev state gdy wywołuje listenera dzięki czemu może mu być łatwiej porównywać stany nowy i stary
// listeners.forEach((listener) => listener(state, previousState))

const createStore = (): Store => {
  let listeners: Listener[] = [];
  let store: PeersState = { local: { tracks: {} }, remote: [] };

  const getSnapshot = (): PeersState => {
    return store;
  };

  const subscribe: (onStoreChange: () => void) => () => void = (callback: Listener) => {
    console.log("Subscribed!");
    listeners = [...listeners, callback];

    return () => {
      listeners = listeners.filter((e) => e !== callback);
    };
  };

  const setStore = (setter: (prevState: PeersState) => PeersState) => {
    store = setter(store);

    listeners.forEach((listener) => {
      listener();
      console.log("Invoking forEach!");
    });
  };

  return { getSnapshot, subscribe, setStore };
};

// todo extract callbacks
export const useMembraneClient = (
  roomId: string,
  peerMetadata: PeerMetadata,
  isSimulcastOn: boolean,
  setErrorMessage: SetErrorMessage
): UseMembraneClientType | null => {
  const [state, setState] = useState<UseMembraneClientType | null>(null);

  useEffect(() => {
    const messageEmitter: TypedEmitter<Partial<Callbacks>> = new EventEmitter() as TypedEmitter<Partial<Callbacks>>;
    const store = createStore();

    const socket = new Socket("/socket");
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    const signaling: Channel = socket.channel(`room:${roomId}`, {
      isSimulcastOn: isSimulcastOn,
    });

    signaling.onError((reason) => {
      console.error("WebrtcChannel error occurred");
      console.error(reason);
      setErrorMessage("WebrtcChannel error occurred");
    });
    signaling.onClose(() => {
      return;
    });

    const webrtc = new MembraneWebRTC({
      callbacks: {
        onSendMediaEvent: (mediaEvent: SerializedMediaEvent) => {
          signaling.push("mediaEvent", { data: mediaEvent });
          messageEmitter.emit("onSendMediaEvent", mediaEvent);
        },
        onConnectionError: (message) => {
          setState({
            webrtc,
            messageEmitter,
            signaling,
            signalingStatus: "connected",
            webrtcConnectionStatus: "error",
            store,
          });
          messageEmitter.emit("onConnectionError", message);
        },
        // todo [Peer] -> Peer[] ???
        onJoinSuccess: (peerId, peersInRoom: [Peer]) => {
          setState({
            webrtc,
            messageEmitter,
            signaling,
            signalingStatus: "connected",
            webrtcConnectionStatus: "connected",
            store,
          });
          store.setStore(() => {
            return {
              local: { id: peerId, tracks: {} },
              remote: peersInRoom.map((peer) => ({ id: peer.id, tracks: [], source: "remote" })),
            };
          });
          messageEmitter.emit("onJoinSuccess", peerId, peersInRoom);
        },
        onRemoved: (reason) => {
          messageEmitter.emit("onRemoved", reason);
          // todo handle
        },
        onPeerJoined: (peer) => {
          messageEmitter.emit("onPeerJoined", peer);
        },
        onPeerLeft: (peer) => {
          messageEmitter.emit("onPeerLeft", peer);
        },
        onPeerUpdated: (peer: Peer) => {
          messageEmitter.emit("onPeerUpdated", peer);
        },
        onTrackReady: (ctx) => {
          messageEmitter.emit("onTrackReady", ctx);
        },
        onTrackAdded: (ctx) => {
          messageEmitter.emit("onTrackAdded", ctx);
        },
        onTrackRemoved: (ctx) => {
          messageEmitter.emit("onTrackRemoved", ctx);
        },
        onTrackEncodingChanged: (peerId: string, trackId: string, encoding: TrackEncoding) => {
          messageEmitter.emit("onTrackEncodingChanged", peerId, trackId, encoding);
        },
        onTrackUpdated: (ctx: TrackContext) => {
          messageEmitter.emit("onTrackUpdated", ctx);
        },
        onTracksPriorityChanged: (enabledTracks: TrackContext[], disabledTracks: TrackContext[]) => {
          messageEmitter.emit("onTracksPriorityChanged", enabledTracks, disabledTracks);
        },
        onJoinError: (metadata) => {
          messageEmitter.emit("onJoinError", metadata);
        },
      },
    });

    signaling.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    signaling.on("simulcastConfig", () => {
      return;
    });

    setState({
      webrtc,
      messageEmitter,
      signaling,
      signalingStatus: "connecting",
      webrtcConnectionStatus: "before-connection",
      store,
    });

    signaling
      .join()
      .receive("ok", () => {
        webrtc.join(peerMetadata);
        setState({
          webrtc,
          messageEmitter,
          signaling,
          signalingStatus: "connected",
          webrtcConnectionStatus: "connecting",
          store,
        });
      })
      .receive("error", (response) => {
        setErrorMessage("Connecting error");
        console.error("Received error status");
        console.error(response);

        setState({
          webrtc,
          messageEmitter,
          signaling,
          signalingStatus: "error",
          webrtcConnectionStatus: "before-connection",
          store,
        });
      });

    const cleanUp = () => {
      webrtc.leave();
      signaling.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
      setState(null);
    };

    return () => {
      cleanUp();
    };
  }, [isSimulcastOn, peerMetadata, roomId, setErrorMessage]);

  return state;
};
