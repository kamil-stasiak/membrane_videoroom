import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMedia, UseMediaResult } from "./useMedia";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";
import { useMemo } from "react";
import { AUDIO_TRACK_CONSTRAINTS, SCREENSHARING_MEDIA_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "../consts";

export type Streams = {
  remote: MembraneStreaming;
  local: UseMediaResult;
};

export class DisplayConstraints {
  constructor(public constraints: DisplayMediaStreamConstraints) {
    this.constraints = constraints;
  }
}

export const useStreamManager = (
  type: TrackType,
  deviceId: string | null,
  mode: StreamingMode,
  isConnected: boolean,
  simulcast: boolean,
  webrtc: MembraneWebRTC | undefined,
  peersApi: PeersApi,
  autostartStreaming?: boolean
): Streams => {
  // todo refactor me
  const config: MediaStreamConfig | DisplayMediaStreamConfig = useMemo(() => {
    if (type === "screensharing")
      return new DisplayMediaStreamConfig({
        video: {
          ...SCREENSHARING_MEDIA_CONSTRAINTS,
          deviceId: deviceId ?? undefined,
        },
      });
    if (type === "camera")
      return new MediaStreamConfig({
        video: {
          ...VIDEO_TRACK_CONSTRAINTS,
          deviceId: deviceId ?? undefined,
        },
      });
    if (type === "audio")
      return new MediaStreamConfig({
        audio: {
          ...AUDIO_TRACK_CONSTRAINTS,
          deviceId: deviceId ?? undefined,
        },
      });

    throw "string";
  }, [type, deviceId]);

  const local = useMedia(config, deviceId, autostartStreaming);
  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, remote.tracksId, peersApi);
  useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata);

  return { local, remote };
};
