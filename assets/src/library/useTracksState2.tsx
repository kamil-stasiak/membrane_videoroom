import { ApiTrack, TrackMetadata } from "../pages/room/hooks/usePeerState";
import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect, useState } from "react";
import { TrackContext, TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import { LibraryPeersState } from "./types";
import { useFullState2 } from "../pages/room/UseFullState2";
import isEqual from "lodash.isequal";
import { useLog } from "../pages/room/UseLog";

export type UseTracksState = Record<string, ApiTrack>;

export type Track3 = {
  stream: MediaStream | null;
  trackId: string;
  encoding: TrackEncoding | null;
  track: MediaStreamTrack | null;
};

export const useTracksState2 = (clientWrapper: UseMembraneClientType | null, peerId: string): Array<Track3> => {
  const fullState: LibraryPeersState | undefined = useFullState2(clientWrapper);
  const [state, setState] = useState<Array<Track3>>([]);

  useEffect(() => {
    if (!fullState) return;

    const newTracks: Array<Track3> = Object.values(fullState.remote[peerId].tracks).map((track) => ({
      trackId: track.trackId,
      encoding: track.encoding,
      stream: track.stream,
    }));

    setState((prevState) => {
      if (isEqual(prevState, newTracks)) {
        return prevState;
      }
      return newTracks;
    });
  }, [fullState, peerId]);

  useLog(state, "useTracksState2");

  return state;
};
