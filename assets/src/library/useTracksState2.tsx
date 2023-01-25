import { ApiTrack, TrackMetadata } from "../pages/room/hooks/usePeerState";
import { Listener, UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { TrackContext, TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import { LibraryPeersState, LibraryRemotePeer } from "./types";
import { useFullState2 } from "../pages/room/UseFullState2";
import isEqual from "lodash.isequal";
import { useLog } from "../pages/room/UseLog";
import { cache } from "./usePeersState2";

export type UseTracksState = Record<string, ApiTrack>;

export type Track3 = {
  stream: MediaStream | null;
  trackId: string;
  encoding: TrackEncoding | null;
  track: MediaStreamTrack | null;
};

const selectPeersIds = (snapshot: LibraryPeersState | null, peerId: string): Array<Track3> => {
  if (!snapshot?.remote) return [];
  const newTracks: Array<Track3> = Object.values(snapshot?.remote[peerId]?.tracks || {}).map((track) => ({
    trackId: track.trackId,
    encoding: track.encoding,
    stream: track.stream,
    track: track.track,
  }));

  return newTracks;
};

export const selectPeersIds2 = (peerId: string): (snapshot: (LibraryPeersState | null)) => (Array<Track3>) => {
  return (snapshot: LibraryPeersState | null): Array<Track3> => {
    if (!snapshot?.remote) return [];
    const newTracks: Array<Track3> = Object.values(snapshot?.remote[peerId]?.tracks || {}).map((track) => ({
      trackId: track.trackId,
      encoding: track.encoding,
      stream: track.stream,
      track: track.track,
    }));

    return newTracks;
  }
};


export const cache3 = <T,>(
  callbackFunction: (snapshot: LibraryPeersState | null, peerId: string) => T
): ((snapshot: LibraryPeersState | null, peerId: string) => T) => {
  console.log("%c Create cache", "color: orange");
  let cache: any = undefined;

  return (innerSnapshot, peerId: string) => {
    const result = callbackFunction(innerSnapshot, peerId);

    if (isEqual(cache, result)) {
      console.log("%c Return cache", "color: green");
      return cache;
    }
    console.log("%c Return new", "color: red");

    cache = result;

    return cache;
  };
};

export const useTracksState2 = (clientWrapper: UseMembraneClientType | null, peerId: string): Array<Track3> => {
  const callbackFunction: (snapshot: (LibraryPeersState | null)) => Array<Track3> = selectPeersIds2(peerId);
  const fn: (snapshot: LibraryPeersState | null) => Array<Track3> = useMemo(
    () => cache(callbackFunction),
    [peerId]
  );

  const subscribe: (onStoreChange: () => void) => () => void = useCallback(
    (listener: Listener) => {
      const sub: ((onStoreChange: () => void) => () => void) | undefined = clientWrapper?.store?.subscribe;

      // return () => {};
      // todo refactor add guard statement
      if (!sub) {
        return () => {};
      } else {
        return sub(listener);
      }
    },
    [clientWrapper]
  );

  const getSnapshotWithSelector = useCallback(() => {
    return fn(clientWrapper?.store?.getSnapshot() || null);
  }, [clientWrapper, fn]);

  const fullState: Track3[] = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  useLog(fullState, "useTracksState2");

  return fullState;
};
