import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMedia, UseMediaResult } from "./useMedia";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";
import { useEffect, useMemo, useState } from "react";
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

  const local = useMedia(config, deviceId);

  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);
  useEffect(() => {
    if (lastDeviceId === null && deviceId !== null) {
      // console.log("Device id change from null to something interesting");
      local.start();
      // first run
    } else if (lastDeviceId !== deviceId && deviceId !== null) {
      // console.log("Device id change from one to another!");
      local.stop().then(() => {
        // console.log("Stopped...");
        local.startWithId(deviceId).then(() => {
          // console.log("New started...");
        });
      });
    }
    setLastDeviceId(deviceId);
    // console.log({ name: "DeviceId", deviceId, lastDeviceId });
  }, [deviceId, lastDeviceId, local]);

  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, remote.tracksId, peersApi);
  useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata);

  return { local, remote };
};
