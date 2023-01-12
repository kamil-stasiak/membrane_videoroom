import { useLibrary, UseLibraryType } from "../library/library";
import { useEffect, useState } from "react";
import { PeerMetadata } from "../library/usePeerState";
import { getRandomAnimalEmoji } from "../library/utils";

// todo change PeerMetadata to generic
export const useVideoroomWrapper = (roomId: string, displayName: string, isSimulcastOn: boolean): UseLibraryType => {
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const libraryResult = useLibrary(roomId, isSimulcastOn, peerMetadata);

  useEffect(() => {
    console.log({ libraryResult });
  }, [libraryResult]);

  return libraryResult;
};
