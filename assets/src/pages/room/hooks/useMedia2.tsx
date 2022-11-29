import { useCallback, useState } from "react";
import { VIDEO_TRACK_CONSTRAINTS } from "../consts";

export class MediaStreamWrapper {
  public isEnabled: boolean;
  public mediaStream: MediaStream | null;

  public constructor(mediaStream: MediaStream | null, isEnabled: boolean) {
    this.mediaStream = mediaStream;
    this.isEnabled = isEnabled;
    this.setupTrackCallbacks();
  }

  private setupTrackCallbacks = () => {
    this.mediaStream?.getTracks().forEach((track) => {
      // onended fires up when:
      // - user clicks "Stop sharing" button
      // - user withdraws permission to camera
      track.onended = () => {
        //
      };
    });
  };

  public start = (id: string): Promise<MediaStreamWrapper> => {
    return navigator.mediaDevices
      .getUserMedia({
        video: {
          ...VIDEO_TRACK_CONSTRAINTS,
          deviceId: id,
        },
      })
      .then((stream: MediaStream) => {
        console.log({ name: "Stream", stream });

        const mediaStreamWrapper = new MediaStreamWrapper(stream, true);

        return mediaStreamWrapper;
      })
      .catch((error) => {
        // this callback fires up when
        // - user didn't grant permission to camera
        // - user clicked "Cancel" instead of "Share" on Screen Sharing menu ("Chose what to share" in Google Chrome)
        return Promise.reject();
      });
  };

  public stop = () => {
    this.mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });
    this.mediaStream = null;
    return new MediaStreamWrapper(null, false);
  };

  public enableTracks = (): MediaStreamWrapper => this.setEnable(true);
  public disableTracks = (): MediaStreamWrapper => this.setEnable(false);

  private setEnable = (status: boolean): MediaStreamWrapper => {
    this.mediaStream?.getTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = status;
    });
    return new MediaStreamWrapper(this.mediaStream, this.isEnabled);
  };
}

export const useMediaDevice2 = () => {
  const [state, setState] = useState<MediaStreamWrapper | null>(null);

  const start = useCallback((id: string): Promise<MediaStreamWrapper> => {
    return new MediaStreamWrapper(null, false).start(id);
  }, []);

  return state;
};
