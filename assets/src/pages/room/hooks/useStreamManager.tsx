import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMedia, UseMediaResult } from "./useMedia";
import { PrivateApi } from "../../../library/usePeerState";
import { TrackType } from "../../../library/types";
import { PublicApi } from "../../../library/library";

export type Streams = {
  remote: MembraneStreaming;
  local: UseMediaResult;
};

export const useStreamManager = (
  type: TrackType,
  mode: StreamingMode,
  isConnected: boolean,
  simulcast: boolean,
  webrtc: PublicApi | undefined,
  config: MediaStreamConfig | DisplayMediaStreamConfig,
  peersApi: PrivateApi,
  autostartStreaming?: boolean
): Streams => {
  const local = useMedia(config, autostartStreaming);
  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, remote.trackId, peersApi);
  useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata);

  return { local, remote };
};
