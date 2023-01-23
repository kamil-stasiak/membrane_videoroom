import { PeerMetadata, TrackMetadata, usePeersState, UsePeersStateResult } from "../pages/room/hooks/usePeerState";
import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect } from "react";
import { Peer, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { isTrackEncoding } from "../pages/types";
import { parseMetadata } from "../pages/room/RoomPage";

export const useFullState = (
  clientWrapper: UseMembraneClientType | null,
  peerMetadata: PeerMetadata
): UsePeersStateResult => {
  const { state, api } = usePeersState();

  useEffect(() => {
    if (!clientWrapper) return;

    const callbacks: Partial<Callbacks> = {
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
      onTrackReady: (ctx) => {
        if (!ctx?.peer || !ctx?.track || !ctx?.stream) return;
        const metadata: TrackMetadata = parseMetadata(ctx);
        api.addTrack(ctx.peer.id, ctx.trackId, ctx.track, ctx.stream, metadata);
      },
      onTrackAdded: (ctx) => {
        if (!ctx?.peer) return;
        const metadata: TrackMetadata = parseMetadata(ctx);
        // In onTrackAdded method we know, that peer has just added a new track, but right now, the server is still processing it.
        // We register this empty track (with mediaStreamTrack and mediaStream set to undefined) to show the loading indicator.
        api.addTrack(ctx.peer.id, ctx.trackId, undefined, undefined, metadata);
      },
      onTrackRemoved: (ctx) => {
        const peerId = ctx?.peer?.id;
        if (!peerId) return;
        api.removeTrack(peerId, ctx.trackId);
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
      onTrackEncodingChanged: (peerId: string, trackId: string, encoding: string) => {
        if (!isTrackEncoding(encoding)) return;
        api.setEncoding(peerId, trackId, encoding);
      },
      onTrackUpdated: (ctx: TrackContext) => {
        api.setMetadata(ctx.peer.id, ctx.trackId, ctx.metadata);
      },
    };

    clientWrapper.messageEmitter.on("onJoinSuccess", callbacks.onJoinSuccess);
    clientWrapper.messageEmitter.on("onTrackReady", callbacks.onTrackReady);
    clientWrapper.messageEmitter.on("onTrackAdded", callbacks.onTrackAdded);
    clientWrapper.messageEmitter.on("onTrackRemoved", callbacks.onTrackRemoved);
    clientWrapper.messageEmitter.on("onTrackUpdated", callbacks.onTrackUpdated);
    clientWrapper.messageEmitter.on("onPeerJoined", callbacks.onPeerJoined);
    clientWrapper.messageEmitter.on("onPeerLeft", callbacks.onPeerLeft);
    clientWrapper.messageEmitter.on("onTrackEncodingChanged", callbacks.onTrackEncodingChanged);

    return () => {
      clientWrapper.messageEmitter.off("onJoinSuccess", callbacks.onJoinSuccess);
      clientWrapper.messageEmitter.off("onTrackReady", callbacks.onTrackReady);
      clientWrapper.messageEmitter.off("onTrackAdded", callbacks.onTrackAdded);
      clientWrapper.messageEmitter.off("onTrackRemoved", callbacks.onTrackRemoved);
      clientWrapper.messageEmitter.off("onTrackUpdated", callbacks.onTrackUpdated);
      clientWrapper.messageEmitter.off("onPeerJoined", callbacks.onPeerJoined);
      clientWrapper.messageEmitter.off("onPeerLeft", callbacks.onPeerLeft);
      clientWrapper.messageEmitter.off("onTrackEncodingChanged", callbacks.onTrackEncodingChanged);
    };
  }, [clientWrapper]);

  return { state, api };
};
