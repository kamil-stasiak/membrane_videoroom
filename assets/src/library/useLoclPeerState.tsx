import { useCallback, useMemo, useState } from "react";
import { TrackType } from "../pages/types";
import { PeerMetadata, Tracks } from "../pages/room/hooks/usePeerState";

export type LocalPeerState = {
  id?: string;
  metadata?: PeerMetadata;
  tracks: Tracks;
};

export type SetLocalPeer = (id: string, metadata?: PeerMetadata) => void;
export type SetLocalStream = (type: TrackType, enabled: boolean, stream: MediaStream | undefined) => void;
export type SetLocalTrackId = (type: TrackType, trackId: string | null) => void;
export type SetLocalTrackMetadata = (type: TrackType, metadata?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

export type LocalPeerApi = {
  setLocalPeer: SetLocalPeer;
  setLocalStream: SetLocalStream;
  setLocalTrackId: SetLocalTrackId;
  setLocalTrackMetadata: SetLocalTrackMetadata;
};

export type UseLocalPeersState = LocalPeerState & LocalPeerApi;

const defaultState: LocalPeerState = { tracks: {} };

export const useLocalPeerState = (): UseLocalPeersState => {
  const [state, setState] = useState<LocalPeerState>(defaultState);

  const setLocalPeer = useCallback((id: string, metadata?: PeerMetadata) => {
    setState((prevState: LocalPeerState) => {
      return { ...prevState, id: id, metadata: metadata };
    });
  }, []);

  const setLocalStream = useCallback((type: TrackType, enabled: boolean, stream?: MediaStream) => {
    setState((prevState: LocalPeerState) => {
      const newTrack = { ...prevState.tracks[type], enabled, stream };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setLocalTrackMetadata = useCallback((type: TrackType, metadata: any) => {
    setState((prevState: LocalPeerState) => {
      const newTrack = { ...prevState.tracks[type], metadata };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  const setLocalTrackId = useCallback((type: TrackType, trackId: string | null) => {
    setState((prevState: LocalPeerState) => {
      const newTrack = { ...prevState.tracks[type], trackId };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  const result: UseLocalPeersState = useMemo(() => {
    return {
      setLocalStream,
      setLocalTrackId,
      setLocalPeer,
      setLocalTrackMetadata,
      ...state,
    };
  }, [setLocalPeer, setLocalStream, setLocalTrackId, setLocalTrackMetadata, state]);

  return result;
};
