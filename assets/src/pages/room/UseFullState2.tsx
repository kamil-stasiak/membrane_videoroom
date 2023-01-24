import { Listener, UseMembraneClientType } from "./hooks/useMembraneClient";
import { useCallback, useSyncExternalStore } from "react";
import { useLog } from "./UseLog";

export const useFullState2 = (clientWrapper: UseMembraneClientType | null) => {
  const subscribe: (onStoreChange: () => void) => () => void = useCallback(
    (listener: Listener) => {
      const sub: ((onStoreChange: () => void) => () => void) | undefined = clientWrapper?.store?.subscribe;

      // todo refactor add guard statement
      if (!sub) {
        console.log("Empty subscribe");
        return () => {
          console.log("Empty unsubscribe");
        };
      } else {
        return sub(listener);
      }
    },
    [clientWrapper]
  );

  const getSnapshot = useCallback(() => {
    return clientWrapper?.store.getSnapshot();
  }, [clientWrapper]);

  const a = useSyncExternalStore(subscribe, getSnapshot);
  useLog(a, "useSyncExternalStore");
  return a
};
