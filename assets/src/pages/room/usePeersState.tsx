import { PeerMetadata, usePeersState, UsePeersStateResult } from "./hooks/usePeerState";
import { UseMembraneClientType } from "./hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect, useMemo } from "react";
import { Peer } from "@membraneframework/membrane-webrtc-js";

export const usePeersStateNew = (
  clientWrapper: UseMembraneClientType | null,
  peerMetadata: PeerMetadata
): UsePeersStateResult => {
  const { state, api } = usePeersState();

  const callbacks: Partial<Callbacks> = useMemo(
    () => ({
      onJoinSuccess: (peerId, peersInRoom: Peer[]) => {
        api.setLocalPeer(peerId, peerMetadata);
        api.addPeers(
          peersInRoom.map((peer) => ({
            id: peer.id,
            displayName: peer.metadata.displayName,
            emoji: peer.metadata.emoji,
            source: "remote",
          }))
        );
      },
      onPeerJoined: (peer) => {
        api.addPeers([
          {
            id: peer.id,
            displayName: peer.metadata.displayName,
            emoji: peer.metadata.emoji,
            source: "remote",
          },
        ]);
      },
      onPeerLeft: (peer) => {
        api.removePeer(peer.id);
      },
    }),
    [api, peerMetadata]
  );

  useEffect(() => {
    if (!clientWrapper) return;

    clientWrapper.messageEmitter.on("onJoinSuccess", callbacks.onJoinSuccess);
    clientWrapper.messageEmitter.on("onPeerJoined", callbacks.onPeerJoined);
    clientWrapper.messageEmitter.on("onPeerLeft", callbacks.onPeerLeft);

    return () => {
      clientWrapper.messageEmitter.off("onJoinSuccess", callbacks.onJoinSuccess);
      clientWrapper.messageEmitter.off("onPeerJoined", callbacks.onPeerJoined);
      clientWrapper.messageEmitter.off("onPeerLeft", callbacks.onPeerLeft);
    };
  }, [callbacks, clientWrapper]);
  return { state, api };
};
