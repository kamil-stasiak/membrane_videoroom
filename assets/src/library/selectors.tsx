import { LibraryPeersState, Selector, LibraryTrackMinimal } from "./types";

type SelectTrackMetadata = (peerId: string, trackId: string) => Selector<object>;
export const selectTrackMetadata: SelectTrackMetadata = (peerId: string, trackId: string): Selector<object> => {
  return (snapshot: LibraryPeersState | null): object => {
    if (!snapshot?.remote) return [];
    return snapshot?.remote[peerId]?.tracks[trackId]?.metadata;
  };
};

type CreateTracksSelector = (peerId: string) => Selector<Array<LibraryTrackMinimal>>;

export const createTracksSelector: CreateTracksSelector = (peerId: string): Selector<Array<LibraryTrackMinimal>> => {
  return (snapshot: LibraryPeersState | null): Array<LibraryTrackMinimal> => {
    if (!snapshot?.remote) return [];
    return Object.values(snapshot?.remote[peerId]?.tracks || {}).map((track) => ({
      trackId: track.trackId,
      encoding: track.encoding,
      stream: track.stream,
      track: track.track,
    }));
  };
};

export const createPeerIdsSelector: Selector<Array<string>> = (snapshot: LibraryPeersState | null): Array<string> =>
  Object.keys(snapshot?.remote || {});
