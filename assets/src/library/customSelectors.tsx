import type { LibraryPeersState, LibraryTrack, LibraryTrackMinimal, PeerId, Selector } from "./types";
import { TrackType } from "../pages/types";

export type PeerGui = { id: PeerId; emoji: string | null; name: string | null };
export type CreatePeersGuiSelector = () => Selector<Array<PeerGui>>;
export const createPeersGuiSelector: CreatePeersGuiSelector =
  (): Selector<Array<PeerGui>> =>
  (snapshot: LibraryPeersState | null): Array<PeerGui> =>
    Object.values(snapshot?.remote || {}).map((peer) => ({
      id: peer.id,
      emoji: peer.metadata?.emoji || null,
      name: peer.metadata?.displayName || null,
    }));

export type CreatePeerGuiSelector = (peerId: PeerId) => Selector<PeerGui | null>;
export const createPeerGuiSelector: CreatePeerGuiSelector =
  (peerId: PeerId): Selector<PeerGui | null> =>
  (snapshot: LibraryPeersState | null): PeerGui | null => {
    const peer = snapshot?.remote[peerId];
    if (!peer) return null;

    return {
      id: peer.id,
      emoji: peer.metadata?.emoji || null,
      name: peer.metadata?.displayName || null,
    };
  };

type CreateTracksRecordSelector = (peerId: PeerId) => Selector<Partial<Record<TrackType, LibraryTrackMinimal>>>;
export const createTracksRecordSelector: CreateTracksRecordSelector =
  (peerId: PeerId): Selector<Partial<Record<TrackType, LibraryTrackMinimal>>> =>
  (snapshot: LibraryPeersState | null): Partial<Record<TrackType, LibraryTrackMinimal>> => {
    const tracks: Record<string, LibraryTrack> = snapshot?.remote[peerId]?.tracks || {};
    const trackTuples: Array<[TrackType | null, LibraryTrackMinimal]> = Object.entries(tracks).map(([trackId, track]) => {
      const trackType: TrackType | null = track.metadata?.type || null;
      if(!trackType) {
        console.warn(`Track '${trackId}' has empty type`)
      }
      const libraryMinimalTrack: LibraryTrackMinimal = {
        stream: track.stream,
        trackId: track.trackId,
        simulcastConfig: track.simulcastConfig ? { ...track.simulcastConfig } : null,
        track: track.track,
      };
      return [trackType, libraryMinimalTrack];
    });
    const result: Partial<Record<TrackType, LibraryTrackMinimal>> = Object.fromEntries(trackTuples);

    return result;
  };
