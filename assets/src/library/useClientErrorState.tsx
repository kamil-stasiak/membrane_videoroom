import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect, useMemo } from "react";

// TODO remove
export const useClientErrorState = <GenericPeerMetadata, GenericTrackMetadata>(
  clientWrapper: UseMembraneClientType<GenericPeerMetadata, GenericTrackMetadata> | null,
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
