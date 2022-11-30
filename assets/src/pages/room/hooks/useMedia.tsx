import { useCallback, useEffect, useMemo, useState } from "react";

export type MediaDevice = State & Api;

type State = {
  isError: boolean;
  isSuccess: boolean;
  stream?: MediaStream;
  isEnabled: boolean;
};

type Api = {
  stop: () => Promise<void>;
  enable: () => void;
  disable: () => void;
  start: (deviceId?: string | null) => Promise<void>;
  replace: (deviceId?: string | null) => Promise<void>;
};

const stopTracks = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

export const useMedia = (
  type: "audio" | "video",
  mediaTrackConstraints: MediaTrackConstraints,
  navigatorMediaType: "user" | "display"
): MediaDevice => {
  const [state, setState] = useState<State>({
    isError: false,
    isSuccess: true,
    stream: undefined,
    isEnabled: false,
  });

  const [api, setApi] = useState<Api>({
    stop: () => Promise.resolve(),
    enable: () => {
      return;
    },
    disable: () => {
      return;
    },
    start: (deviceId?: string | null) => Promise.reject(),
    replace: (deviceId?: string | null) => Promise.reject(),
  });

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
    (deviceId?: string | null): Promise<MediaStream> => {
      const constraints: MediaStreamConstraints = {
        [type]: {
          ...mediaTrackConstraints,
          deviceId: deviceId || undefined,
        },
      };

      return navigatorMediaType === "user"
        ? navigator.mediaDevices.getUserMedia(constraints)
        : navigator.mediaDevices.getDisplayMedia(constraints);
    },
    [mediaTrackConstraints, navigatorMediaType, type]
  );

  const startStream = useCallback(
    (deviceId?: string | null): Promise<MediaStream> => {
      return getMediaStream(deviceId)
        .then((stream: MediaStream) => {
          // console.log({ name: "Stream", stream });
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
    [state, setState] // todo
  );

  const stopStream = useCallback(
    (): Promise<void> =>
      new Promise((resolve, reject) => {
        if (!state.stream) {
          reject();
          return;
        }

        stopTracks(state.stream);
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
      }),
    [state]
  );

  useEffect(() => {
    setApi({
      stop: stopStream,
      enable: () => setEnable(true),
      disable: () => setEnable(false),
      start: (deviceId?: string | null) =>
        startStream(deviceId).then(() => {
          return;
        }),
      replace: (deviceId?: string | null) =>
        stopStream()
          .then(() => startStream(deviceId))
          .then(() => {
            return;
          }),
    });
  }, [startStream, setEnable, state, stopStream]);

  return useMemo(() => ({ ...api, ...state }), [api, state]);
};
