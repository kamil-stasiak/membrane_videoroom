import { useEffect } from "react";
import { TrackType } from "../../types";
import { SetLocalTrackId } from "../../../library/useLoclPeerState";

export const useSetRemoteTrackId = (type: TrackType, setLocalTrackId: SetLocalTrackId, trackId: string | null) => {
  useEffect(() => {
    // if(api.tracks[type]?.trackId === trackId) {
    //   console.log("useSetRemoteTrackId skipped")
    //   return;
    // }

    setLocalTrackId(type, trackId);
  }, [type, setLocalTrackId, trackId]);
};
