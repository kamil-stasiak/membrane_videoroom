import { LibraryPeersState } from "./types";

export type Store = {
  getSnapshot: () => LibraryPeersState;
  setStore: (setter: (prevState: LibraryPeersState) => LibraryPeersState) => void;
  subscribe: (onStoreChange: () => void) => () => void;
};

export type Listener = () => void;
export const createStore = (): Store => {
  let listeners: Listener[] = [];
  let store: LibraryPeersState = { local: { id: null, tracks: {}, metadata: null }, remote: {} };

  const getSnapshot = (): LibraryPeersState => {
    return store;
  };

  const subscribe: (onStoreChange: () => void) => () => void = (callback: Listener) => {
    listeners = [...listeners, callback];

    return () => {
      listeners = listeners.filter((e) => e !== callback);
    };
  };

  const setStore = (setter: (prevState: LibraryPeersState) => LibraryPeersState) => {
    store = setter(store);

    listeners.forEach((listener) => {
      listener();
    });
  };

  return { getSnapshot, subscribe, setStore };
};
