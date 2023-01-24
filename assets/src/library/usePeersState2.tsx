import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { useEffect, useState } from "react";
import { LibraryPeer, LibraryPeersState } from "./types";
import { useFullState2 } from "../pages/room/UseFullState2";

const groupBy = <IN,>(arr: Array<IN>, criteria: (it: IN) => string): Record<string, Array<IN>> =>
  arr.reduce((acc, currentValue) => {
    if (!acc[criteria(currentValue)]) {
      acc[criteria(currentValue)] = [];
    }
    acc[criteria(currentValue)].push(currentValue);
    return acc;
  }, {} as Record<string, Array<IN>>);

export const useLibraryPeersState2 = (clientWrapper: UseMembraneClientType | null): LibraryPeersState | null => {
  const fullState = useFullState2(clientWrapper);
  const [state, setState] = useState<LibraryPeersState | null>(null);

  useEffect(() => {
    if (!fullState) return;

    const list: Array<LibraryPeer> = fullState.remote.map((peer) => ({
      id: peer.id,
    }));

    const record: Record<string, LibraryPeer> = Object.fromEntries(
      new Map(Object.entries(groupBy(list, (e) => e.id)).map(([id, peers]) => [id, peers[0]]))
    );
  }, [fullState]);

  return state;
};
