import { Listener, UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { LibraryPeersState } from "./types";
import { cache } from "./usePeersState2";
import { useLog } from "../pages/room/UseLog";

const selectTrack = (peerId: string, trackId: string): ((snapshot: LibraryPeersState | null) => object) => {
  return (snapshot: LibraryPeersState | null): object => {
    if (!snapshot?.remote) return [];
    const newTracks: object = snapshot?.remote[peerId]?.tracks[trackId]?.metadata

    return newTracks;
  };
};

export const useTrackMetadata2 = (
  clientWrapper: UseMembraneClientType | null,
  peerId: string,
  trackId: string
): object => {
  const fn: (snapshot: LibraryPeersState | null) => object = useMemo(
    () => cache(selectTrack(peerId, trackId)),
    [trackId, peerId]
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

  const fullState: object = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  useLog(fullState, "trackMetadata");

  return fullState;
};
