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

const cache: (
  callbackFunction: (snapshot: LibraryPeersState | null) => string[]
) => (snapshot: LibraryPeersState | null) => string[] = (
  callbackFunction: (snapshot: LibraryPeersState | null) => string[]
): ((snapshot: LibraryPeersState | null) => string[]) => {
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

  const getSnapshotWithSelector = useCallback(
    () => cachedSelectPeersIds(clientWrapper?.store?.getSnapshot() || null),
    [clientWrapper]
  );

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
