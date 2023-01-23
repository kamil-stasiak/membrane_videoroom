import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Channel, Socket } from "phoenix";
import { PeerMetadata } from "./usePeerState";
import { SetErrorMessage } from "../RoomPage";
import { Callbacks, TrackEncoding } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";

export type ConnectionStatus = "before-connection" | "connected" | "connecting" | "error";

export type UseMembraneClientType = {
  webrtc: MembraneWebRTC;
  messageEmitter: TypedEmitter<Partial<Callbacks>>;
  signaling: Channel;
  webrtcConnectionStatus: ConnectionStatus;
  signalingStatus: ConnectionStatus;
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
          });
          messageEmitter.emit("onJoinSuccess", peerId, peersInRoom);
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
        onPeerJoined: (peer) => {
          messageEmitter.emit("onPeerJoined", peer);
        },
        onPeerLeft: (peer) => {
          messageEmitter.emit("onPeerLeft", peer);
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
        onRemoved: (reason) => {
          messageEmitter.emit("onRemoved", reason);
        },
        onPeerUpdated: (peer: Peer) => {
          messageEmitter.emit("onPeerUpdated", peer);
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
