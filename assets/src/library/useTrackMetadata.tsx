import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect, useState } from "react";
import { Peer, TrackContext } from "@membraneframework/membrane-webrtc-js";

export const useTrackMetadata = (clientWrapper: UseMembraneClientType | null, trackId: string): object => {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    if (!clientWrapper) return;

    const callbacks: Partial<Callbacks> = {
      onPeerJoined: (peer: Peer) => {
        // todo?
      },
      onPeerLeft: (peer) => {
        if (!trackId.startsWith(peer.id)) return;

        setState(null);
      },
      onTrackAdded: (ctx) => {
        if (trackId !== ctx.trackId) return;

        setState(ctx.metadata);
      },
      onTrackReady: (ctx) => {
        if (trackId !== ctx.trackId) return;

        setState((prevState: any) => {
          if (!prevState) return ctx.metadata;

          return { ...prevState, ...(ctx.metadata || {}) };
        });
      },
      onTrackUpdated: (ctx: TrackContext) => {
        if (trackId !== ctx.trackId) return;

        setState((prevState: any) => {
          if (!prevState) return ctx.metadata;

          return { ...prevState, ...(ctx.metadata || {}) };
        });
      },
      onTrackRemoved: (ctx) => {
        if (trackId !== ctx.trackId) return;

        setState(null);
      },
    };

    clientWrapper.messageEmitter.on("onPeerJoined", callbacks.onPeerJoined);
    clientWrapper.messageEmitter.on("onPeerLeft", callbacks.onPeerLeft);
    clientWrapper.messageEmitter.on("onTrackAdded", callbacks.onTrackAdded);
    clientWrapper.messageEmitter.on("onTrackReady", callbacks.onTrackReady);
    clientWrapper.messageEmitter.on("onTrackUpdated", callbacks.onTrackUpdated);
    clientWrapper.messageEmitter.on("onTrackRemoved", callbacks.onTrackRemoved);

    return () => {
      clientWrapper.messageEmitter.off("onPeerJoined", callbacks.onPeerJoined);
      clientWrapper.messageEmitter.off("onPeerLeft", callbacks.onPeerLeft);
      clientWrapper.messageEmitter.off("onTrackAdded", callbacks.onTrackAdded);
      clientWrapper.messageEmitter.off("onTrackReady", callbacks.onTrackReady);
      clientWrapper.messageEmitter.off("onTrackUpdated", callbacks.onTrackUpdated);
      clientWrapper.messageEmitter.off("onTrackRemoved", callbacks.onTrackRemoved);
    };
  }, [clientWrapper, trackId]);

  return state;
};
