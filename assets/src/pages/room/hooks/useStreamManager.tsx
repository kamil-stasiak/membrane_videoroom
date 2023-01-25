import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMedia, UseMediaResult } from "./useMedia";
import { TrackType } from "../../types";
import { UseLocalPeersState } from "../../../library/useLoclPeerState";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { UseMembraneClientType } from "./useMembraneClient";
import { PeerMetadata } from "./usePeerState";

export type Streams = {
  remote: MembraneStreaming;
  local: UseMediaResult;
};

export const useStreamManager = (
  type: TrackType,
  mode: StreamingMode,
  isConnected: boolean,
  simulcast: boolean,
  clientWrapper: UseMembraneClientType | null,
  config: MediaStreamConfig | DisplayMediaStreamConfig,
  peersApi: UseLocalPeersState<PeerMetadata>,
  autostartStreaming?: boolean
): Streams => {
  const local = useMedia(config, autostartStreaming);
  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, clientWrapper?.webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi.setLocalStream, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, peersApi.setLocalTrackId, remote.trackId);
  useSetLocalTrackMetadata(type, peersApi.setLocalTrackMetadata, remote.trackMetadata);


  return { local, remote };
};
