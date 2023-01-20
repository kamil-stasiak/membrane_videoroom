import { useCallback, useMemo, useState } from "react";
import { TrackType } from "../pages/types";
import { Tracks } from "../pages/room/hooks/usePeerState";

export type SetLocalPeer<Metadata> = (id: string, metadata?: Metadata) => void;
export type SetLocalStream = (type: TrackType, enabled: boolean, stream: MediaStream | undefined) => void;
export type SetLocalTrackId = (type: TrackType, trackId: string | null) => void;
export type SetLocalTrackMetadata = (type: TrackType, metadata?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

export type LocalPeerApi<Metadata> = {
  setLocalPeer: SetLocalPeer<Metadata>;
  setLocalStream: SetLocalStream;
  setLocalTrackId: SetLocalTrackId;
  setLocalTrackMetadata: SetLocalTrackMetadata;
};

export type LocalPeerState<Metadata> = {
  id?: string;
  metadata?: Metadata;
  tracks: Tracks;
};

export type UseLocalPeersState<Metadata> = LocalPeerState<Metadata> & LocalPeerApi<Metadata>;

export const useLocalPeerState = <Metadata,>(): UseLocalPeersState<Metadata> => {
  const [state, setState] = useState<LocalPeerState<Metadata>>({ tracks: {} });

  const setLocalPeer = useCallback((id: string, metadata?: Metadata) => {
    setState((prevState: LocalPeerState<Metadata>) => {
      return { ...prevState, id: id, metadata: metadata };
    });
  }, []);

  const setLocalStream = useCallback((type: TrackType, enabled: boolean, stream?: MediaStream) => {
    setState((prevState: LocalPeerState<Metadata>) => {
      const newTrack = { ...prevState.tracks[type], enabled, stream };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setLocalTrackMetadata = useCallback((type: TrackType, metadata: any) => {
    setState((prevState: LocalPeerState<Metadata>) => {
      const newTrack = { ...prevState.tracks[type], metadata };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  const setLocalTrackId = useCallback((type: TrackType, trackId: string | null) => {
    setState((prevState: LocalPeerState<Metadata>) => {
      const newTrack = { ...prevState.tracks[type], trackId };

      return { ...prevState, tracks: { ...prevState.tracks, [type]: newTrack } };
    });
  }, []);

  const result: UseLocalPeersState<Metadata> = useMemo(() => {
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
