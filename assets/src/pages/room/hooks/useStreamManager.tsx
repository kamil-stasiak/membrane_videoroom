import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { useMedia, MediaDevice } from "./useMedia";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";
import { useEffect, useState } from "react";
import { VIDEO_TRACK_CONSTRAINTS } from "../consts";

export type Streams = {
  remote: MembraneStreaming;
  local: MediaDevice;
};

function useMediaStreamSourceManager(deviceId: string | null, startOnMount: boolean, mediaDevice: MediaDevice) {
  const { start, replace, stream } = mediaDevice;
  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (lastDeviceId === null && deviceId !== null && startOnMount) {
      start(deviceId);
    } else if (lastDeviceId !== deviceId && deviceId !== null && stream) {
      replace(deviceId);
    }
    setLastDeviceId(deviceId);
  }, [startOnMount, deviceId, lastDeviceId, mediaDevice, stream, start, replace]);
}

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
  const local = useMedia(mediaManagerType, VIDEO_TRACK_CONSTRAINTS, navigatorMediaType);

  useMediaStreamSourceManager(deviceId, autostartStreaming, local);

  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, remote.tracksId, peersApi);
  useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata);

  return { local, remote };
};
