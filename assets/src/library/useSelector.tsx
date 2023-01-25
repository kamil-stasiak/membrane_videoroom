import { Listener, UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { LibraryPeersState } from "./types";
import { cache } from "./usePeersState2";
import { useLog } from "../pages/room/UseLog";

export const useSelector = (
  clientWrapper: UseMembraneClientType | null,
  selector: (snapshot: (LibraryPeersState | null)) => Array<string>
): Array<string> => {
  const fn: (snapshot: LibraryPeersState | null) => Array<string> =
    useMemo(() => cache(selector), [selector]);

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

  const fullState: Array<string> = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  useLog(fullState, "useSelector");

  return fullState;
};
