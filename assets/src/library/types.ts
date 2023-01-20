export type LibraryPeer = {
  id: string;
};

export type LibraryPeersState = {
  list: ReadonlyArray<LibraryPeer>;
  record: Record<string, LibraryPeer>;
};
