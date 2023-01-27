import { useEffect } from "react";
import { TrackType } from "../../types";
import { SetLocalTrackMetadata } from "../../../library/useLoclPeerState";
import { TrackMetadata } from "./usePeerState";

export const useSetLocalTrackMetadata = (
  type: TrackType,
  setLocalTrackMetadata: SetLocalTrackMetadata,
  metadata: TrackMetadata | null
) => {
  useEffect(() => {
    setLocalTrackMetadata(type, metadata);
  }, [type, setLocalTrackMetadata, metadata]);
};
