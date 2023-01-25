import { Listener, UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { useCallback, useSyncExternalStore } from "react";
import { LibraryPeersState, LibraryRemotePeer } from "./types";
import isEqual from "lodash.isequal";
import { useLog } from "../pages/room/UseLog";

const groupBy = <IN,>(arr: Array<IN>, criteria: (it: IN) => string): Record<string, Array<IN>> =>
  arr.reduce((acc, currentValue) => {
    if (!acc[criteria(currentValue)]) {
      acc[criteria(currentValue)] = [];
    }
    acc[criteria(currentValue)].push(currentValue);
    return acc;
  }, {} as Record<string, Array<IN>>);

const emptyArray: string[] = [];

export const cache = <T,>(
  callbackFunction: (snapshot: LibraryPeersState | null) => T
): ((snapshot: LibraryPeersState | null) => T) => {
  console.log("%c Create cache", "color: orange");
  let cache: any = undefined;

  return (innerSnapshot) => {
    const result = callbackFunction(innerSnapshot);

    if (isEqual(cache, result)) {
      console.log("%c Return cache", "color: green");
      return cache;
    }
    console.log("%c Return new", "color: red");

    cache = result;

    return cache;
  };
};

// const cachedFunction: () => string[] = cache(() => {
//   console.log("Inner cached function");
//   return ["A", "B"];
// });

const selectPeersIds = (snapshot: LibraryPeersState | null): string[] => {
  const remotePeers: Record<string, LibraryRemotePeer> = snapshot?.remote || {};
  return Object.keys(remotePeers);
};

const cachedSelectPeersIds: (snapshot: LibraryPeersState | null) => string[] = cache(selectPeersIds);

export const useLibraryPeersState2 = (clientWrapper: UseMembraneClientType | null): Array<string> => {
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

  const getSnapshotWithSelector = useCallback(
    () => cachedSelectPeersIds(clientWrapper?.store?.getSnapshot() || null),
    [clientWrapper]
  );

  const fullState: string[] = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  useLog(fullState, "useLibraryPeersState2");

  return fullState;
};
