import { PeerMetadata } from "../pages/room/hooks/usePeerState";
import { TrackType } from "../pages/types";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type LibraryTrackReady = {
  stream: MediaStream | null;
  trackId: string;
  metadata: any | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  encoding: TrackEncoding | null;
  track: MediaStreamTrack | null;
};

export type LibraryTrackAdded = LibraryTrackReady;
export type LibraryTrack = LibraryTrackReady | LibraryTrackAdded;

export type LibraryLocalPeer = {
  id: string | null;
  // todo make PeerMetadata generic
  metadata: PeerMetadata | null;
  // todo rethink key - for now it is track type but it is not generic
  tracks: Partial<Record<TrackType, LibraryTrack>>;
};

export type LibraryRemotePeer = {
  id: string;
  // todo make PeerMetadata generic
  metadata: PeerMetadata | null;
  tracks: Record<string, LibraryTrack>;
};

export type LibraryPeersState = {
  local: LibraryLocalPeer;
  remote: Record<string, LibraryRemotePeer>;
};
