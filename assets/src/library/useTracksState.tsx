import { ApiTrack } from "../pages/room/hooks/usePeerState";
import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect, useState } from "react";
import { TrackContext } from "@membraneframework/membrane-webrtc-js";

export type UseTracksState = Record<string, ApiTrack>;

export const useTracksState = (clientWrapper: UseMembraneClientType | null, peerId: string): UseTracksState | null => {
  const [state, setState] = useState<UseTracksState | null>(null);

  useEffect(() => {
    if (!clientWrapper) return;

    const callbacks: Partial<Callbacks> = {
      onTrackReady: (ctx) => {
        if (!ctx?.peer || !ctx?.track || !ctx?.stream) return;

        const newTrack: ApiTrack = {
          mediaStreamTrack: ctx.track,
          mediaStream: ctx.stream,
          trackId: ctx.trackId,
        };

        setState((prevState) => {
          return { ...prevState, [ctx.trackId]: newTrack };
        });
      },
      onTrackAdded: (ctx) => {
        if (!ctx?.peer) return;

        const newTrack: ApiTrack = {
          trackId: ctx.trackId,
        };

        setState((prevState) => {
          return { ...prevState, [ctx.trackId]: newTrack };
        });
      },
      onTrackRemoved: (ctx) => {
        const peerId = ctx?.peer?.id;
        if (!peerId) return;

        setState((prevState) => {
          const newState = { ...prevState };
          delete newState[ctx.trackId];
          return newState;
        });
      },
      onTrackUpdated: (ctx: TrackContext) => {
        // api.setMetadata(ctx.peer.id, ctx.trackId, ctx.metadata);
      },
    };

    clientWrapper.messageEmitter.on("onTrackReady", callbacks.onTrackReady);
    clientWrapper.messageEmitter.on("onTrackAdded", callbacks.onTrackAdded);
    clientWrapper.messageEmitter.on("onTrackRemoved", callbacks.onTrackRemoved);
    clientWrapper.messageEmitter.on("onTrackUpdated", callbacks.onTrackUpdated);

    return () => {
      clientWrapper.messageEmitter.off("onTrackReady", callbacks.onTrackReady);
      clientWrapper.messageEmitter.off("onTrackAdded", callbacks.onTrackAdded);
      clientWrapper.messageEmitter.off("onTrackRemoved", callbacks.onTrackRemoved);
      clientWrapper.messageEmitter.off("onTrackUpdated", callbacks.onTrackUpdated);
    };
  }, [clientWrapper]);

  return state;
};
