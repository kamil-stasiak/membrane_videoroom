import { Listener, UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LibraryPeersState, LibraryRemotePeer } from "./types";
import { useFullState2 } from "../pages/room/UseFullState2";
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

const emptyArray = [];

const cache = (callbackFunction: () => string[]): (() => string[]) => {
  console.log("Outer cache function");
  let cache: any = undefined;

  return () => {
    const result = callbackFunction();

    if (isEqual(cache, result)) {
      console.log("Return cache");
      return cache;
    }
    console.log("Return new");

    cache = result;

    return cache;
  };
};

// const cachedFunction: () => string[] = cache(() => {
//   console.log("Inner cached function");
//   return ["A", "B"];
// });

export const useLibraryPeersState2 = (clientWrapper: UseMembraneClientType | null): Array<string> => {
  // const fullState: LibraryPeersState | undefined = useFullState2(clientWrapper);

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

  // const prevValue = useRef<string[]>([]);

  // const getSnapshot: () => string[] = useCallback(() => {
  //   let prevValue: string[] = [];
  //   console.log("calling outer!");
  //   const outer = () => {
  //     const remotePeers: Record<string, LibraryRemotePeer> | undefined =
  //       clientWrapper?.store?.getSnapshot()?.remote || {};
  //     const currentIds: string[] = Object.keys(remotePeers);
  //
  //     if (isEqual(currentIds, prevValue)) {
  //       console.log("Prev value");
  //       return prevValue;
  //     }
  //     console.log("New value");
  //     prevValue = currentIds;
  //     return prevValue;
  //   };
  //   return outer();
  // }, [clientWrapper]);
  //

  const selector: () => string[] = useCallback(
    cache(() => {
      console.log("Inner cached function");
      const remotePeers: Record<string, LibraryRemotePeer> = clientWrapper?.store?.getSnapshot()?.remote || {};
      const currentIds: string[] = Object.keys(remotePeers);
      return currentIds;
    }),
    [clientWrapper]
  );

  const getSnapshotWithSelector = useCallback(() => selector(), [selector]);

  const fullState: string[] = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  // const [state, setState] = useState<Array<string>>([]);
  //
  // useEffect(() => {
  //   if (!fullState) return;
  //
  //   const remoteIds: string[] = Object.keys(fullState.remote);
  //
  //   setState((prevState) => {
  //     if (isEqual(prevState, remoteIds)) {
  //       console.log({name: "equal:", prevState, remoteIds})
  //       return prevState;
  //     }
  //     console.log({name: "not equal:", prevState, remoteIds})
  //
  //     return remoteIds;
  //   });
  // }, [fullState]);

  useLog(fullState, "useLibraryPeersState2");

  return fullState;
};
