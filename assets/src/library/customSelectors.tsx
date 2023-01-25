import { LibraryPeersState, PeerId, Selector } from "./types";

export type PeerGui = { id: PeerId; emoji: string | null; name: string | null };
export type CreatePeerGuiSelector = () => Selector<Array<PeerGui>>;
export const createPeerGuiSelector: CreatePeerGuiSelector =
  (): Selector<Array<PeerGui>> =>
  (snapshot: LibraryPeersState | null): Array<PeerGui> =>
    Object.values(snapshot?.remote || {}).map((peer) => ({
      id: peer.id,
      emoji: peer.metadata?.emoji || null,
      name: peer.metadata?.displayName || null,
    }));
