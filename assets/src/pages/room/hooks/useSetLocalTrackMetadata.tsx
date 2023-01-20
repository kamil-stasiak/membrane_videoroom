import { useEffect } from "react";
import { TrackType } from "../../types";
import { SetLocalTrackMetadata } from "../../../library/useLoclPeerState";

export const useSetLocalTrackMetadata = (
  type: TrackType,
  setLocalTrackMetadata: SetLocalTrackMetadata,
  metadata: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  useEffect(() => {
    // todo fix objects comparison
    // if(api.metadata)

    setLocalTrackMetadata(type, metadata);
  }, [type, setLocalTrackMetadata, metadata]);
};
