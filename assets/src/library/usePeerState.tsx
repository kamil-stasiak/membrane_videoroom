import { useCallback, useMemo, useState } from "react";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import type {
  ApiTrack,
  LocalPeer,
  NewPeer,
  PeerMetadata,
  PeersMap, PeersState, PrivateApi,
  RemotePeer,
  TrackMetadata, TrackType,
  UsePeersStateResult
} from "./library.types";

const copyTrack = (peer: RemotePeer, trackId: string) => peer.tracks.find((track) => track.trackId === trackId);

const copyOtherTracks = (peer: RemotePeer, trackId: string) => peer.tracks.filter((track) => track.trackId !== trackId);

export const usePeersState = (): UsePeersStateResult => {
  const [remotePeers, setRemotePeers] = useState<PeersMap>({});
  // todo maybe remove '| undefined'
  const [localPeerState, setLocalPeerState] = useState<LocalPeer | undefined>();

  const setLocalPeer = useCallback((id: string, metadata?: PeerMetadata) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const stateCopy = prevState ?? { tracks: {} };
      return { ...stateCopy, id: id, metadata: metadata };
    });
  }, []);

  const setLocalStream = useCallback((type: TrackType, enabled: boolean, stream?: MediaStream) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], enabled, stream };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setLocalTrackMetadata = useCallback((type: TrackType, metadata: any) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], metadata };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  const setLocalTrackId = useCallback((type: TrackType, trackId: string | null) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], trackId };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  const addPeers = useCallback((peerIds: NewPeer[]) => {
    setRemotePeers((prevState: PeersMap) => {
      const newPeers: PeersMap = Object.fromEntries(
        peerIds.map((peer) => [
          peer.id,
          {
            id: peer.id,
            tracks: [],
            displayName: peer.displayName,
            emoji: peer.emoji,
            source: peer.source,
          },
        ])
      );
      return { ...prevState, ...newPeers };
    });
  }, []);

  const removePeer = useCallback((peerId: string) => {
    setRemotePeers((prev) => {
      const newState = { ...prev };
      delete newState[peerId];
      return newState;
    });
  }, []);

  const addTrack = useCallback(
    (
      peerId: string,
      trackId: string,
      mediaStreamTrack?: MediaStreamTrack,
      mediaStream?: MediaStream,
      metadata?: TrackMetadata
    ) => {
      setRemotePeers((prev: PeersMap) => {
        const peerCopy: RemotePeer = { ...prev[peerId] };
        const oldTracks: ApiTrack[] = copyOtherTracks(peerCopy, trackId);

        const newTrack = {
          mediaStreamTrack: mediaStreamTrack,
          mediaStream: mediaStream,
          metadata: metadata,
          trackId: trackId,
        };

        const newTracks: ApiTrack[] = [...oldTracks, newTrack];
        return { ...prev, [peerId]: { ...peerCopy, tracks: newTracks } };
      });
    },
    []
  );

  const setEncoding = useCallback((peerId: string, trackId: string, encoding: TrackEncoding) => {
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: ApiTrack | undefined = copyTrack(peerCopy, trackId);
      if (!trackCopy) return prev;

      trackCopy.encoding = encoding;

      const otherTracks: ApiTrack[] = copyOtherTracks(peerCopy, trackId);

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setMetadata = useCallback((peerId: string, trackId: string, metadata: any) => {
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: ApiTrack | undefined = copyTrack(peerCopy, trackId);
      if (!trackCopy) return prev;

      trackCopy.metadata = metadata;

      const otherTracks: ApiTrack[] = copyOtherTracks(peerCopy, trackId);

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  const removeTrack = useCallback((peerId: string, trackId: string) => {
    setRemotePeers((prev) => {
      const newState: PeersMap = { ...prev };
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const newPeer: RemotePeer = {
        ...peerCopy,
        tracks: copyOtherTracks(peerCopy, trackId),
      };
      delete newState[peerId];
      return { ...newState, [peerId]: newPeer };
    });
  }, []);

  const api: PrivateApi = useMemo(
    () => ({
      addPeers,
      removePeer,
      addTrack,
      removeTrack,
      setEncoding,
      setLocalPeer,
      setLocalStream,
      setLocalTrackId,
      setMetadata,
      setLocalTrackMetadata,
    }),
    [
      addPeers,
      removePeer,
      addTrack,
      removeTrack,
      setEncoding,
      setLocalPeer,
      setLocalStream,
      setLocalTrackId,
      setMetadata,
      setLocalTrackMetadata,
    ]
  );

  const state: PeersState = useMemo(() => {
    const remoteUsersArray: RemotePeer[] = Object.values(remotePeers);

    return {
      local: localPeerState,
      remote: remoteUsersArray,
    };
  }, [localPeerState, remotePeers]);

  return { state, api };
};
