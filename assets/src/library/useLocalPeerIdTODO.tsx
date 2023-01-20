import { PeerMetadata } from "../pages/room/hooks/usePeerState";
import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect } from "react";
import { SetLocalPeer } from "./useLoclPeerState";

export const useLocalPeerIdTODO = (
  clientWrapper: UseMembraneClientType | null,
  peerMetadata: PeerMetadata,
  setLocalPeer: SetLocalPeer<PeerMetadata>
) => {
  useEffect(() => {
    if (!clientWrapper) return;

    const callbacks: Partial<Callbacks> = {
      onJoinSuccess: (peerId) => {
        setLocalPeer(peerId, peerMetadata);
      },
    };

    clientWrapper.messageEmitter.on("onJoinSuccess", callbacks.onJoinSuccess);

    return () => {
      clientWrapper.messageEmitter.off("onJoinSuccess", callbacks.onJoinSuccess);
    };
  }, [clientWrapper, peerMetadata, setLocalPeer]);
};
