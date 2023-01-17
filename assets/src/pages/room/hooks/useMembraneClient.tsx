import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Socket } from "phoenix";
import { PeerMetadata } from "./usePeerState";
import { SetErrorMessage } from "../RoomPage";
import { Callbacks, TrackEncoding } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter/rxjs";

type UseSetupResult = {
  webrtc?: MembraneWebRTC;
};

export type UseMembraneClientType = {
  webrtc: MembraneWebRTC;
  messageEmitter: TypedEmitter<Partial<Callbacks>>;
};

// todo extract callbacks
export const useMembraneClient = (
  roomId: string,
  peerMetadata: PeerMetadata,
  isSimulcastOn: boolean,
  setErrorMessage: SetErrorMessage
): UseMembraneClientType | null => {
  const [webrtc, setWebrtc] = useState<UseMembraneClientType | null>(null);

  useEffect(() => {
    const messageEmitter: TypedEmitter<Partial<Callbacks>> = new EventEmitter() as TypedEmitter<Partial<Callbacks>>;

    const socket = new Socket("/socket");
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    const webrtcChannel = socket.channel(`room:${roomId}`, {
      isSimulcastOn: isSimulcastOn,
    });

    webrtcChannel.onError((reason) => {
      console.error("WebrtcChannel error occurred");
      console.error(reason);
      setErrorMessage("WebrtcChannel error occurred");
    });
    webrtcChannel.onClose(() => {
      return;
    });

    const webrtc = new MembraneWebRTC({
      callbacks: {
        onSendMediaEvent: (mediaEvent: SerializedMediaEvent) => {
          webrtcChannel.push("mediaEvent", { data: mediaEvent });
          messageEmitter.emit("onSendMediaEvent", mediaEvent);
        },
        onConnectionError: (message) => {
          messageEmitter.emit("onConnectionError", message);
        },
        // todo [Peer] -> Peer[] ???
        onJoinSuccess: (peerId, peersInRoom: [Peer]) => {
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

    webrtcChannel.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel.on("simulcastConfig", () => {
      return;
    });

    webrtcChannel
      .join()
      .receive("ok", () => {
        webrtc.join(peerMetadata);
        setWebrtc({ webrtc, messageEmitter });
      })
      .receive("error", (response) => {
        setErrorMessage("Connecting error");
        console.error("Received error status");
        console.error(response);
      });

    const cleanUp = () => {
      webrtc.leave();
      webrtcChannel.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
      setWebrtc(null);
    };

    return () => {
      cleanUp();
    };
  }, [isSimulcastOn, peerMetadata, roomId, setErrorMessage]);

  return webrtc;
};
