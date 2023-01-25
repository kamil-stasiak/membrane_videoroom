import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Channel, Socket } from "phoenix";
import { PeerMetadata } from "./usePeerState";
import { SetErrorMessage } from "../RoomPage";
import { Callbacks, TrackEncoding } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { LibraryLocalPeer, LibraryPeersState, LibraryRemotePeer, LibraryTrackReady } from "../../../library/types";

export type ConnectionStatus = "before-connection" | "connected" | "connecting" | "error";

type Store = {
  getSnapshot: () => LibraryPeersState;
  setStore: (setter: (prevState: LibraryPeersState) => LibraryPeersState) => void;
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
  let store: LibraryPeersState = { local: { id: null, tracks: {}, metadata: null }, remote: {} };

  setInterval(() => {
    console.log({ name: "Store", store });
  }, 3000);

  const getSnapshot = (): LibraryPeersState => {
    return store;
  };

  const subscribe: (onStoreChange: () => void) => () => void = (callback: Listener) => {
    listeners = [...listeners, callback];

    return () => {
      listeners = listeners.filter((e) => e !== callback);
    };
  };

  const setStore = (setter: (prevState: LibraryPeersState) => LibraryPeersState) => {
    store = setter(store);

    listeners.forEach((listener) => {
      listener();
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
          console.log({ name: "onJoinSuccess", peerId, peersInRoom });

          setState({
            webrtc,
            messageEmitter,
            signaling,
            signalingStatus: "connected",
            webrtcConnectionStatus: "connected",
            store,
          });
          store.setStore(() => {
            const remote: Record<string, LibraryRemotePeer> = Object.fromEntries(
              new Map(
                peersInRoom.map((peer) => [
                  peer.id,
                  {
                    id: peer.id,
                    metadata: peer.metadata,
                    tracks: {},
                  },
                ])
              )
            );

            // todo add your own metadata
            const local: LibraryLocalPeer = { id: peerId, metadata: {}, tracks: {} };

            return { local, remote };
          });
          messageEmitter.emit("onJoinSuccess", peerId, peersInRoom);
        },
        onRemoved: (reason) => {
          console.log({ name: "onRemoved", reason });

          messageEmitter.emit("onRemoved", reason);
          // todo handle
        },
        onPeerJoined: (peer) => {
          console.log({ name: "onPeerJoined", peer });

          store.setStore((prevState: LibraryPeersState) => {
            const remote: Record<string, LibraryRemotePeer> = {
              ...prevState.remote,
              [peer.id]: { id: peer.id, metadata: peer.metadata, tracks: {} },
            };

            return { ...prevState, remote };
          });
          messageEmitter.emit("onPeerJoined", peer);
        },
        onPeerLeft: (peer) => {
          console.log({ name: "onPeerLeft", peer });

          store.setStore((prevState: LibraryPeersState) => {
            const remote: Record<string, LibraryRemotePeer> = {
              ...prevState.remote,
            };

            delete remote[peer.id];

            return { ...prevState, remote };
          });
          messageEmitter.emit("onPeerLeft", peer);
        },
        onPeerUpdated: (peer: Peer) => {
          console.log({ name: "onPeerUpdated", peer });

          messageEmitter.emit("onPeerUpdated", peer);
        },
        onTrackReady: (ctx) => {
          console.log({ name: "onTrackReady", ctx });

          store.setStore((prevState: LibraryPeersState) => {
            if (!ctx.stream) return prevState;
            if (!ctx.peer) return prevState;
            if (!ctx.trackId) return prevState;

            const remote: Record<string, LibraryRemotePeer> = {
              ...prevState.remote,
            };

            remote[ctx.peer.id].tracks[ctx.trackId] = {
              trackId: ctx.trackId,
              metadata: ctx.metadata,
              stream: ctx.stream,
              encoding: null,
              track: ctx.track,
            };

            return { ...prevState, remote: remote };
          });
          messageEmitter.emit("onTrackReady", ctx);
        },
        onTrackAdded: (ctx) => {
          console.log({ name: "onTrackAdded", ctx });

          store.setStore((prevState: LibraryPeersState) => {
            if (!ctx.peer) return prevState;
            if (!ctx.trackId) return prevState;

            const remote: Record<string, LibraryRemotePeer> = {
              ...prevState.remote,
            };

            // todo fix this mutation
            remote[ctx.peer.id].tracks[ctx.trackId] = {
              trackId: ctx.trackId,
              metadata: ctx.metadata,
              encoding: null,
              stream: ctx.stream,
              track: ctx.track,
            };

            return { ...prevState, remote: remote };
          });
          messageEmitter.emit("onTrackReady", ctx);
        },
        onTrackRemoved: (ctx) => {
          console.log({ name: "onTrackRemoved", ctx });

          store.setStore((prevState: LibraryPeersState) => {
            if (!ctx.peer) return prevState;
            if (!ctx.trackId) return prevState;

            const remote: Record<string, LibraryRemotePeer> = {
              ...prevState.remote,
            };

            delete remote[ctx.peer.id].tracks[ctx.trackId];

            return { ...prevState, remote: remote };
          });
          messageEmitter.emit("onTrackRemoved", ctx);
        },
        onTrackEncodingChanged: (peerId: string, trackId: string, encoding: TrackEncoding) => {
          console.log({ name: "onTrackEncodingChanged", peerId, trackId, encoding });

          store.setStore((prevState: LibraryPeersState) => {
            const remote: Record<string, LibraryRemotePeer> = {
              ...prevState.remote,
            };

            const peer = remote[peerId];

            const track = { ...peer.tracks[trackId], encoding };

            return {
              ...prevState,
              remote: { ...prevState.remote, [peerId]: { ...peer, tracks: { ...peer.tracks, [trackId]: track } } },
            };
          });
          messageEmitter.emit("onTrackEncodingChanged", peerId, trackId, encoding);
        },
        onTrackUpdated: (ctx: TrackContext) => {
          console.log({ name: "onTrackUpdated", ctx });

          store.setStore((prevState: LibraryPeersState) => {
            const remote: Record<string, LibraryRemotePeer> = {
              ...prevState.remote,
            };

            const peer = remote[ctx.peer.id];

            const track: LibraryTrackReady = {
              ...peer.tracks[ctx.trackId],
              stream: ctx.stream,
              metadata: ctx.metadata,
            };

            return {
              ...prevState,
              remote: {
                ...prevState.remote,
                [ctx.peer.id]: { ...peer, tracks: { ...peer.tracks, [ctx.trackId]: track } },
              },
            };
          });

          messageEmitter.emit("onTrackUpdated", ctx);
        },
        onTracksPriorityChanged: (enabledTracks: TrackContext[], disabledTracks: TrackContext[]) => {
          console.log({ name: "onTracksPriorityChanged", enabledTracks, disabledTracks });

          messageEmitter.emit("onTracksPriorityChanged", enabledTracks, disabledTracks);
        },
        onJoinError: (metadata) => {
          console.log({ name: "onJoinError", metadata });

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
