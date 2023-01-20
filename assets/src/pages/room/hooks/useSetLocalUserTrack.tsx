import { useEffect } from "react";
import { TrackType } from "../../types";
import { SetLocalStream } from "../../../library/useLoclPeerState";

export const useSetLocalUserTrack = (
  type: TrackType,
  setLocalStream: SetLocalStream,
  stream: MediaStream | undefined,
  isEnabled: boolean
) => {
  useEffect(() => {
    // if (api.tracks[type]?.stream === stream) {
    //   console.log("Skipped");
    //   return;
    // }

    setLocalStream(type, isEnabled, stream);
  }, [type, setLocalStream, stream, isEnabled]);
};
