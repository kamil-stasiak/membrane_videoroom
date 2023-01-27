import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type TrackId = string;
export type PeerId = string;
export type Tracks<Metadata> = Record<TrackId, LibraryTrack<Metadata>>;

export type LibrarySimulcastConfig = {
  enabled: boolean;
  activeEncodings: TrackEncoding[];
};

export type LibraryTrack<TrackMetadataGeneric> = {
  stream: MediaStream | null;
  trackId: TrackId;
  metadata: TrackMetadataGeneric | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  simulcastConfig: LibrarySimulcastConfig | null;
  track: MediaStreamTrack | null;
};

export type LibraryLocalPeer<PeerMetadataGeneric, TrackMetadataGeneric> = {
  id: PeerId | null;
  metadata: PeerMetadataGeneric | null;
  tracks: Partial<Record<TrackId, LibraryTrack<TrackMetadataGeneric>>>;
};

export type LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric> = {
  id: PeerId;
  metadata: PeerMetadataGeneric | null;
  tracks: Record<TrackId, LibraryTrack<TrackMetadataGeneric>>;
};

export type LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> = {
  local: LibraryLocalPeer<PeerMetadataGeneric, TrackMetadataGeneric>;
  remote: Record<PeerId, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>>;
};

// --- selectors
export type Selector<PeerM, TrackM, Result> = (snapshot: LibraryPeersState<PeerM, TrackM> | null) => Result;
export type Subscribe = (onStoreChange: () => void) => () => void;

export type LibraryTrackMinimal = {
  stream: MediaStream | null;
  trackId: TrackId;
  track: MediaStreamTrack | null;
  simulcastConfig: LibrarySimulcastConfig | null;
};
