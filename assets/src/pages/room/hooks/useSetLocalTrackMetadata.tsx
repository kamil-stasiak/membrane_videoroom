import { useEffect } from "react";
import { PrivateApi } from "../../../library/usePeerState";
import { TrackType } from "../../../library/library.types";

export const useSetLocalTrackMetadata = (
  type: TrackType,
  api: PrivateApi,
  metadata: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  useEffect(() => {
    api.setLocalTrackMetadata(type, metadata);
  }, [type, api, metadata]);
};
