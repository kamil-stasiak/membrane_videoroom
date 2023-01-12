import { useEffect } from "react";
import { PrivateApi } from "../../../library/usePeerState";
import { TrackType } from "../../../library/types";

export const useSetRemoteTrackId = (type: TrackType, trackId: string | null, api: PrivateApi | null) => {
  useEffect(() => {
    if (!api) return;
    api.setLocalTrackId(type, trackId);
  }, [type, api, trackId]);
};
