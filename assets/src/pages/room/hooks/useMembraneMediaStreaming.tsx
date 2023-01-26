import { useCallback, useEffect, useMemo, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { TrackType } from "../../types";
import { selectBandwidthLimit } from "../bandwidth";
import { UseMembraneClientType } from "./useMembraneClient";

export type MembraneStreaming = {
  trackId: string | null;
  removeTracks: () => void;
  addTracks: (stream: MediaStream) => void;
  setActive: (status: boolean) => void;
  updateTrackMetadata: (metadata: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  trackMetadata: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type StreamingMode = "manual" | "automatic";

type TrackIds = {
  localId: string;
  remoteId: string;
};

export const useMembraneMediaStreaming = (
  mode: StreamingMode,
  type: TrackType,
  isConnected: boolean,
  simulcast: boolean,
  webrtc: MembraneWebRTC | null,
  stream: MediaStream | null,
  clientWrapper: UseMembraneClientType | null,
): MembraneStreaming => {
  const [trackIds, setTrackIds] = useState<TrackIds | null>(null);
  const [webrtcState, setWebrtcState] = useState<MembraneWebRTC | null>(webrtc || null);
  const [trackMetadata, setTrackMetadata] = useState<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  const defaultTrackMetadata = useMemo(() => ({ active: true, type }), [type]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      console.log({ name: "Adding track", webrtc, clientWrapper })
      if (!webrtc) return;

      if(!clientWrapper?.api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const track: MediaStreamTrack | undefined = tracks[0];
      if (!track) throw "Stream has no tracks!";

      const remoteTrackId = clientWrapper.api.addTrack(
        track,
        stream,
        defaultTrackMetadata,
        type === "camera" && simulcast ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined,
        selectBandwidthLimit(type, simulcast)
      );

      setTrackIds({ localId: track.id, remoteId: remoteTrackId });
      setTrackMetadata(defaultTrackMetadata);
    },
    [clientWrapper, defaultTrackMetadata, simulcast, type, webrtc]
  );

  const replaceTrack = useCallback(
    (stream: MediaStream) => {
      if (!webrtc || !trackIds) return;
      if(!clientWrapper?.api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const track: MediaStreamTrack | undefined = tracks[0];
      if (!track) throw "Stream has no tracks!";

      clientWrapper?.api?.replaceTrack(trackIds?.remoteId, track)
    },
    [clientWrapper, trackIds, type, webrtc]
  );

  const removeTracks = useCallback(() => {
    if(!clientWrapper?.api) return;
    setTrackIds(null);
    setTrackMetadata(undefined);

    if (!webrtc || !trackIds) return;

    clientWrapper?.api?.removeTrack(trackIds.remoteId);
  }, [clientWrapper?.api, webrtc, trackIds]);

  useEffect(() => {
    if (!webrtc || !isConnected || mode !== "automatic") {
      return;
    }

    const tracks = type === "audio" ? stream?.getAudioTracks() : stream?.getVideoTracks();
    const localTrackId: string | undefined = (tracks || [])[0]?.id;

    if (stream && !trackIds) {
      addTracks(stream);
    } else if (stream && trackIds && trackIds.localId !== localTrackId) {
      replaceTrack(stream);
    } else if (!stream && trackIds) {
      removeTracks();
    }
  }, [webrtc, stream, isConnected, addTracks, mode, removeTracks, trackIds, replaceTrack, type]);

  useEffect(() => {
    setWebrtcState(webrtc || null);
  }, [webrtc, type]);

  const updateTrackMetadata = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (metadata: any) => {
      if (!trackIds) return;
      webrtcState?.updateTrackMetadata(trackIds.remoteId, metadata);
      setTrackMetadata(metadata);
    },
    [webrtcState, trackIds]
  );

  const setActive = useCallback(
    (status: boolean) => updateTrackMetadata({ ...trackMetadata, active: status }),
    [trackMetadata, updateTrackMetadata]
  );

  return {
    trackId: trackIds?.remoteId || null,
    removeTracks,
    addTracks,
    setActive,
    updateTrackMetadata,
    trackMetadata,
  };
};
