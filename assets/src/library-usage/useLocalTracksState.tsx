import { useCallback, useState } from "react";
import type { TracksMap, TrackType } from "../library/library.types";

export type PrivateTrack = {
  stream?: MediaStream;
  trackId?: string;
  enabled: boolean;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type UseLocalTracksState = {
  tracks: TracksMap;
  addTrack: (type: TrackType, track: PrivateTrack) => void;
  removeTrack: (type: TrackType) => void;
};

export const useLocalTracksState = (): UseLocalTracksState => {
  const [tracks, setTracks] = useState<TracksMap>({});

  const addTrack = useCallback((type: TrackType, track: PrivateTrack) => {
    setTracks((prevState: TracksMap): TracksMap => ({ ...prevState, [type]: track }));
  }, []);

  const removeTrack = useCallback((type: TrackType) => {
    setTracks((prevState: TracksMap): TracksMap => {
      const newState = { ...prevState };
      delete newState[type];
      return newState;
    });
  }, []);

  return { addTrack, removeTrack, tracks: tracks };
};
