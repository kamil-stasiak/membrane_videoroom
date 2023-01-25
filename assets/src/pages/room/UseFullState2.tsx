import { Listener, UseMembraneClientType } from "./hooks/useMembraneClient";
import { useCallback, useSyncExternalStore } from "react";
import { useLog } from "./UseLog";
import { LibraryPeersState } from "../../library/types";

export const useFullState2 = (clientWrapper: UseMembraneClientType | null) => {
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

  const getSnapshot = useCallback(() => {
    return clientWrapper?.store.getSnapshot();
  }, [clientWrapper]);

  const a: LibraryPeersState | undefined = useSyncExternalStore(subscribe, getSnapshot);
  // useLog(a, "fullState");
  return a;
};
