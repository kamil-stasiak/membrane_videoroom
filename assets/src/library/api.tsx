import { SimulcastConfig, TrackBandwidthLimit } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";

export type MembraneApi<TrackMetadataGeneric> = {
  addTrack: (
    track: MediaStreamTrack,
    stream: MediaStream,
    trackMetadata?: TrackMetadataGeneric,
    simulcastConfig?: SimulcastConfig,
    maxBandwidth?: TrackBandwidthLimit
  ) => string;
  replaceTrack: (trackId: string, newTrack: MediaStreamTrack, newTrackMetadata?: TrackMetadataGeneric) => Promise<boolean>;
  removeTrack: (trackId: string) => void;
  updateTrackMetadata: (trackId: string, trackMetadata: TrackMetadataGeneric) => void;
};
