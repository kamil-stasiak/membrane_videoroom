import { useCallback, useEffect, useMemo, useState } from "react";
import { VIDEO_TRACK_CONSTRAINTS } from "../consts";

export type UseMediaResult = State & Api;

type State = {
  isError: boolean; // todo remove
  isSuccess: boolean; // todo remove
  stream?: MediaStream; // important
  isEnabled: boolean; // important
};

export type Api = {
  stop: () => Promise<void>;
  enable: () => void;
  disable: () => void;
  start: (deviceId: string) => Promise<MediaStream>;
  replace: (deviceId: string) => Promise<MediaStream>;
};

const stopTracks = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

export const useMediaDevice = (
  type: "audio" | "video",
  mediaTrackConstraints: MediaTrackConstraints,
  navigatorMediaType: "user" | "display"
): UseMediaResult => {
  const [state, setState] = useState<State>({
    isError: false,
    isSuccess: true,
    stream: undefined,
    isEnabled: false,
  });

  const [api, setApi] = useState<Api>({
    stop: () => Promise.resolve(),
    enable: () => {},
    disable: () => {},
    start: (id: string) => {
      console.log("Hello");
      return Promise.reject();
    },
    replace: (id: string) => Promise.reject(),
  });

  // rename to clearState or sth
  const setErrorState = useCallback(() => {
    setState(
      (): State => ({
        isError: true,
        isSuccess: false,
        stream: undefined,
        isEnabled: false,
      })
    );
  }, []);

  const setSuccessfulState = useCallback((stream: MediaStream) => {
    setState(
      (): State => ({
        isError: false,
        isSuccess: true,
        stream: stream,
        isEnabled: true,
      })
    );
  }, []);

  const setupTrackCallbacks = useCallback(
    (stream: MediaStream) => {
      stream.getTracks().forEach((track) => {
        // onended fires up when:
        // - user clicks "Stop sharing" button
        // - user withdraws permission to camera
        track.onended = () => {
          setErrorState();
        };
      });
    },
    [setErrorState]
  );

  const getMediaStream = useCallback(
    (deviceId: string): Promise<MediaStream> => {
      const constraints: MediaStreamConstraints = { [type]: { ...mediaTrackConstraints, deviceId: deviceId } };

      return navigatorMediaType === "user"
        ? navigator.mediaDevices.getUserMedia(constraints)
        : navigator.mediaDevices.getDisplayMedia(constraints);
    },
    [mediaTrackConstraints, navigatorMediaType, type]
  );

  const startStream = useCallback(
    (id: string): Promise<MediaStream> => {
      return getMediaStream(id)
        .then((stream: MediaStream) => {
          console.log({ name: "Stream", stream });
          setupTrackCallbacks(stream);
          setSuccessfulState(stream);
          return stream;
        })
        .catch((error) => {
          // this callback fires up when
          // - user didn't grant permission to camera
          // - user clicked "Cancel" instead of "Share" on Screen Sharing menu ("Chose what to share" in Google Chrome)
          setErrorState();
          return Promise.reject();
        });
    },
    [getMediaStream, setupTrackCallbacks, setSuccessfulState, setErrorState]
  );

  const setEnable = useCallback(
    (status: boolean) => {
      state.stream?.getTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = status;
      });
      setState(
        (prevState: State): State => ({
          ...prevState,
          isEnabled: status,
        })
      );
    },
    [state.stream, setState] // todo
  );

  useEffect(() => {
    const stream = state.stream;

    if (stream) {
      const stopInner = () => {
        const result: Promise<void> = new Promise((resolve, reject) => {
          if (stream) {
            stopTracks(stream);
          }
          // todo refactor
          setState((prevStateInner) => {
            resolve();
            return {
              ...prevStateInner,
              isError: false,
              isSuccess: true,
              stream: undefined,
              isEnabled: false,
            };
          });
        });

        return result;
      };

      setApi({
        stop: stopInner,
        enable: () => setEnable(true),
        disable: () => setEnable(false),
        start: (id: string) => startStream(id),
        replace: (id: string) => {
          return stopInner().then(() => {
            return startStream(id);
          });
        },
      });
    } else {
      setApi({
        stop: () => Promise.reject(),
        enable: () => {
          // empty
        },
        disable: () => {
          // empty
        },
        start: (id: string) => startStream(id),
        replace: (id: string) => Promise.reject(),
      });
    }
  }, [startStream, setEnable, state]);

  const result: UseMediaResult = useMemo(() => ({ ...api, ...state }), [api, state]);

  return result;
};

export class MediaStreamConfig {
  private readonly type = "MediaStreamConfig";

  constructor(public constraints: MediaStreamConstraints) {
    this.constraints = constraints;
  }
}

export class DisplayMediaStreamConfig {
  private readonly type = "DisplayMediaStreamConfig";

  constructor(public constraints: DisplayMediaStreamConstraints) {
    this.constraints = constraints;
  }
}
