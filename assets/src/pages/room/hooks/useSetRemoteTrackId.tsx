import { useEffect } from "react";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export const useSetRemoteTrackId = (type: TrackType, trackIds: string[], api?: PeersApi) => {
  useEffect(() => {
    if (!api) return;
    // console.log("this one?");

    api.setLocalTrackId(type, trackIds[0]);
  }, [type, api, trackIds]);
};
