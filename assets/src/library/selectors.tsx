import type { LibraryPeersState, Selector, LibraryTrackMinimal, PeerId, TrackId } from "./types";

type CreatePeerIdsSelector = () => Selector<Array<PeerId>>;
export const createPeerIdsSelector: CreatePeerIdsSelector =
  (): Selector<Array<PeerId>> =>
  (snapshot: LibraryPeersState | null): Array<PeerId> =>
    Object.keys(snapshot?.remote || {});

type CreateTracksIdsSelector = (peerId: PeerId) => Selector<Array<TrackId>>;
export const createTracksIdsSelector: CreateTracksIdsSelector =
  (peerId: string): Selector<Array<PeerId>> =>
  (snapshot: LibraryPeersState | null): Array<TrackId> =>
    Object.values(snapshot?.remote[peerId]?.tracks || {}).map((track) => track.trackId);

type CreateTracksSelector = (peerId: PeerId) => Selector<Array<LibraryTrackMinimal>>;
export const createTracksSelector: CreateTracksSelector =
  (peerId: PeerId): Selector<Array<LibraryTrackMinimal>> =>
  (snapshot: LibraryPeersState | null): Array<LibraryTrackMinimal> =>
    Object.values(snapshot?.remote[peerId]?.tracks || {}).map((track) => ({
      trackId: track.trackId,
      encoding: track.encoding,
      stream: track.stream,
      track: track.track,
    }));

type SelectTrackMetadata = (peerId: PeerId, trackId: TrackId) => Selector<object>;
export const selectTrackMetadata: SelectTrackMetadata =
  (peerId: string, trackId: string): Selector<object> =>
  (snapshot: LibraryPeersState | null): object =>
    snapshot?.remote[peerId]?.tracks[trackId]?.metadata || {};
