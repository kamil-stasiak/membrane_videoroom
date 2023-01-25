import { Listener, UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useLog } from "../helpers/UseLog";
import { cache } from "./cache";
import { Selector, Subscribe } from "./types";

export const useSelector = <Result,>(
  clientWrapper: UseMembraneClientType | null,
  selector: Selector<Result>
): Result => {
  const cachedSelector: Selector<Result> = useMemo(() => cache(selector), [selector]);

  const subscribe: Subscribe = useCallback(
    (listener: Listener) => {
      const sub: Subscribe | undefined = clientWrapper?.store?.subscribe;

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
    return cachedSelector(clientWrapper?.store?.getSnapshot() || null);
  }, [clientWrapper, cachedSelector]);

  const result: Result = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  useLog(result, "useSelector");

  return result;
};
