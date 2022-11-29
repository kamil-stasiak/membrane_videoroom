import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { useMediaDevice, UseMediaResult } from "./useMedia";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";
import { useEffect, useState } from "react";
import { VIDEO_TRACK_CONSTRAINTS } from "../consts";

export type Streams = {
  remote: MembraneStreaming;
  local: UseMediaResult;
};

export const useStreamManager = (
  type: TrackType,
  deviceId: string | null,
  mode: StreamingMode,
  isConnected: boolean,
  simulcast: boolean,
  webrtc: MembraneWebRTC | undefined,
  peersApi: PeersApi,
  autostartStreaming: boolean,
  mediaManagerType: "video" | "audio",
  trackConstraints: MediaTrackConstraints,
  navigatorMediaType: "user" | "display"
): Streams => {
  const local = useMediaDevice(mediaManagerType, VIDEO_TRACK_CONSTRAINTS, navigatorMediaType);

  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);
  useEffect(() => {
    console.log({ deviceId, lastDeviceId });

    if (lastDeviceId === null && deviceId !== null) {
      local.start(deviceId);
    } else if (lastDeviceId !== deviceId && deviceId !== null) {
      local.replace(deviceId);
    }
    setLastDeviceId(deviceId);
  }, [deviceId, lastDeviceId, local]);

  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, remote.tracksId, peersApi);
  useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata);

  return { local, remote };
};
