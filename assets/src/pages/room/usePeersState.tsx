import { UseMembraneClientType } from "./hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect, useMemo, useState } from "react";
import { Peer } from "@membraneframework/membrane-webrtc-js";
import { LibraryPeer, LibraryPeersState } from "../../library/types";

export const useLibraryPeersState = (clientWrapper: UseMembraneClientType | null): LibraryPeersState | null => {
  const [state, setState] = useState<LibraryPeersState | null>(null);

  const callbacks: Partial<Callbacks> = useMemo(
    () => ({
      onJoinSuccess: (peerId, peersInRoom: Peer[]) => {
        const map = new Map(peersInRoom.map((peer) => [peer.id, { id: peer.id }]));
        const record: Record<string, LibraryPeer> = Object.fromEntries(map);
        const list: ReadonlyArray<LibraryPeer> = Object.values(record);
        setState({ list, record });
      },
      onPeerJoined: (peer) => {
        setState((prevState) => {
          const prevList: ReadonlyArray<LibraryPeer> = prevState?.list || [];
          const prevRecord: Record<string, LibraryPeer> = prevState?.record || {};
          const newPeer: LibraryPeer = { id: peer.id };
          const newRecord: Record<string, LibraryPeer> = { ...prevRecord, [peer.id]: newPeer };
          const newList: ReadonlyArray<LibraryPeer> = [...prevList, newPeer];

          return { list: newList, record: newRecord };
        });
      },
      onPeerLeft: (peer) => {
        setState((prevState) => {
          const newList: ReadonlyArray<LibraryPeer> = (prevState?.list || []).filter((p) => peer.id !== p.id);
          const newRecord: Record<string, LibraryPeer> = prevState?.record || {};
          delete newRecord[peer.id];

          return { list: newList, record: newRecord };
        });
      },
    }),
    []
  );

  useEffect(() => {
    if (!clientWrapper) return;

    clientWrapper.messageEmitter.on("onJoinSuccess", callbacks.onJoinSuccess);
    clientWrapper.messageEmitter.on("onPeerJoined", callbacks.onPeerJoined);
    clientWrapper.messageEmitter.on("onPeerLeft", callbacks.onPeerLeft);

    return () => {
      clientWrapper.messageEmitter.off("onJoinSuccess", callbacks.onJoinSuccess);
      clientWrapper.messageEmitter.off("onPeerJoined", callbacks.onPeerJoined);
      clientWrapper.messageEmitter.off("onPeerLeft", callbacks.onPeerLeft);
    };
  }, [callbacks, clientWrapper]);
  return state;
};
