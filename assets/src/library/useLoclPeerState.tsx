import { useCallback, useMemo, useState } from "react";
import { TrackType } from "../pages/types";
import { TrackMetadata, Tracks } from "../pages/room/hooks/usePeerState";

export type SetLocalPeer<GenericPeerMetadata> = (id: string, metadata?: GenericPeerMetadata) => void;
export type SetLocalStream = (type: TrackType, enabled: boolean, stream: MediaStream | undefined) => void;
export type SetLocalTrackId = (type: TrackType, trackId: string | null) => void;
export type SetLocalTrackMetadata = (type: TrackType, metadata: TrackMetadata | null) => void;

export type LocalPeerApi<GenericPeerMetadata> = {
  setLocalPeer: SetLocalPeer<GenericPeerMetadata>;
  setLocalStream: SetLocalStream;
  setLocalTrackId: SetLocalTrackId;
  setLocalTrackMetadata: SetLocalTrackMetadata;
};

export type LocalPeerState<GenericPeerMetadata> = {
  id?: string;
  metadata: GenericPeerMetadata | null;
  tracks: Tracks;
};

export type UseLocalPeersState<GenericPeerMetadata> = LocalPeerState<GenericPeerMetadata> & LocalPeerApi<GenericPeerMetadata>;

export const useLocalPeerState = <GenericPeerMetadata,>(): UseLocalPeersState<GenericPeerMetadata> => {
  const [state, setState] = useState<LocalPeerState<GenericPeerMetadata>>({ tracks: {}, metadata: null });

  const setLocalPeer = useCallback((id: string, metadata: GenericPeerMetadata | null) => {
    setState((prevState: LocalPeerState<GenericPeerMetadata>) => {
      return { ...prevState, id: id, metadata: metadata };
    });
  }, []);

  const setLocalStream = useCallback((type: TrackType, enabled: boolean, stream?: MediaStream) => {
    setState((prevState: LocalPeerState<GenericPeerMetadata>) => {
      const newTrack = { ...prevState.tracks[type], enabled, stream };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  const setLocalTrackMetadata = useCallback((type: TrackType, metadata: GenericPeerMetadata) => {
    setState((prevState: LocalPeerState<GenericPeerMetadata>) => {
      const newTrack = { ...prevState.tracks[type], metadata };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  const setLocalTrackId = useCallback((type: TrackType, trackId: string | null) => {
    setState((prevState: LocalPeerState<GenericPeerMetadata>) => {
      const newTrack = { ...prevState.tracks[type], trackId };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  // todo FIX ME NOW!!
  const result: UseLocalPeersState<GenericPeerMetadata> = useMemo(() => {
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
