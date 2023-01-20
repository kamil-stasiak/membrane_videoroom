import { usePeersState } from "../pages/room/hooks/usePeerState";
import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect, useMemo } from "react";

export const useClientErrorState = (
  clientWrapper: UseMembraneClientType | null,
  setErrorMessage: (value: string) => void
) => {
  const callbacks: Partial<Callbacks> = useMemo(
    () => ({
      onConnectionError: (message) => {
        console.error("onConnectionError occurred");
        console.error(message);
        setErrorMessage(message);
      },
    }),
    [setErrorMessage]
  );

  useEffect(() => {
    if (!clientWrapper) return;

    clientWrapper.messageEmitter.on("onConnectionError", callbacks.onConnectionError);

    return () => {
      clientWrapper.messageEmitter.off("onConnectionError", callbacks.onConnectionError);
    };
  }, [callbacks, clientWrapper]);
};
