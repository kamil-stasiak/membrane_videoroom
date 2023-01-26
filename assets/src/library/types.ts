import { PeerMetadata } from "../pages/room/hooks/usePeerState";
import { TrackType } from "../pages/types";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import { SimulcastConfig } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";



export type TrackId = string;
export type PeerId = string;
export type Tracks = Record<TrackId, LibraryTrack>;

export type LibrarySimulcastConfig = {
  enabled: boolean;
  activeEncodings: TrackEncoding[];
}

export type LibraryTrack = {
  stream: MediaStream | null;
  trackId: TrackId;
  metadata: any | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  // encoding: TrackEncoding | null;
  simulcastConfig: LibrarySimulcastConfig | null;
  track: MediaStreamTrack | null;
};

export type LibraryLocalPeer = {
  id: PeerId | null;
  // todo make PeerMetadata generic
  metadata: PeerMetadata | null;
  // todo rethink key - for now it is track type but it is not generic
  tracks: Partial<Record<TrackId, LibraryTrack>>;
};

export type LibraryRemotePeer = {
  id: PeerId;
  // todo make PeerMetadata generic
  metadata: PeerMetadata | null;
  tracks: Record<TrackId, LibraryTrack>;
};

export type LibraryPeersState = {
  local: LibraryLocalPeer;
  remote: Record<PeerId, LibraryRemotePeer>;
};

// --- selectors
export type Selector<Result> = (snapshot: LibraryPeersState | null) => Result;
export type Subscribe = (onStoreChange: () => void) => () => void;

export type LibraryTrackMinimal = {
  stream: MediaStream | null;
  trackId: TrackId;
  track: MediaStreamTrack | null;
  simulcastConfig: LibrarySimulcastConfig | null;
};
