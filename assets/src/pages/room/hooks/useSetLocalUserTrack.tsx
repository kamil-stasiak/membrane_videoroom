import { useEffect } from "react";
import { PeersApi } from "../../../library/usePeerState";
import { TrackType } from "../../../library/types";

export const useSetLocalUserTrack = (
  type: TrackType,
  api: PeersApi,
  stream: MediaStream | undefined,
  isEnabled: boolean
) => {
  useEffect(() => {
    api.setLocalStream(type, isEnabled, stream);
  }, [type, api, stream, isEnabled]);
};
