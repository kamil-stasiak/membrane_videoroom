import { useEffect } from "react";
import { PrivateApi } from "../../../library/usePeerState";
import { TrackType } from "../../../library/library.types";

export const useSetLocalUserTrack = (
  type: TrackType,
  api: PrivateApi,
  stream: MediaStream | undefined,
  isEnabled: boolean
) => {
  useEffect(() => {
    api.setLocalStream(type, isEnabled, stream);
  }, [type, api, stream, isEnabled]);
};
