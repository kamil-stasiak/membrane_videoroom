import { useCallback, useEffect, useMemo, useState } from "react";

export type UseMediaResult = State & Api;

type State = {
  isError: boolean;
  isSuccess: boolean;
  stream?: MediaStream;
  isEnabled: boolean;
};

export type Api = {
  start: () => void;
  stop: () => void;
  enable: () => void;
  disable: () => void;
};

type Config = {
  startOnMount: boolean;
};

const stopTracks = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

export const useMediaDevice = (
  config: Config,
  deviceId: string | null,
  mediaStreamSupplier: () => Promise<MediaStream>
): UseMediaResult => {
  const [state, setState] = useState<State>({
    isError: false,
    isSuccess: true,
    stream: undefined,
    isEnabled: false,
  });

  const [api, setApi] = useState<Api>({
    start: () => {},
    stop: () => {},
    enable: () => {},
    disable: () => {},
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

  const startStream = useCallback((): Promise<MediaStream> => {
    return mediaStreamSupplier()
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
  }, [mediaStreamSupplier, setupTrackCallbacks, setSuccessfulState, setErrorState]); // todo add media stream supplier

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

  // every device id change
  useEffect(() => {
    console.log("every Device Id change: start");
    if (deviceId === null) return;
    // if (!config.startOnMount) return;

    console.log({ name: "Every DeviceId change", deviceId });
    const promise = startStream();
    return () => {
      promise
        .then((stream) => {
          stopTracks(stream);
        })
        .catch(() => {
          // empty
        });
    };
  }, [deviceId]);

  useEffect(() => {
    const stream = state.stream;

    if (stream) {
      setApi({
        stop: () => {
          stopTracks(stream);
          // todo refactor
          setState((prevStateInner) => ({
            ...prevStateInner,
            isError: false,
            isSuccess: true,
            stream: undefined,
            isEnabled: false,
          }));
        },
        start: () => {
          // empty
        },
        enable: () => setEnable(true),
        disable: () => setEnable(false),
      });
    } else {
      setApi({
        stop: () => {
          // empty
        },
        start: () => {
          startStream();
        },
        enable: () => {
          // empty
        },
        disable: () => {
          // empty
        },
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

export const useMedia = (
  config: MediaStreamConfig | DisplayMediaStreamConfig,
  deviceId: string | null,
  startOnMount = false
): UseMediaResult => {
  const mediaStreamSupplier = useCallback(() => {
    return config instanceof DisplayMediaStreamConfig
      ? navigator.mediaDevices.getDisplayMedia(config.constraints)
      : navigator.mediaDevices.getUserMedia(config.constraints);
  }, [config, deviceId]);

  return useMediaDevice({ startOnMount }, deviceId, mediaStreamSupplier);
};
