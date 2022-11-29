import { useCallback, useEffect, useState } from "react";

type MediaDeviceManagerConfig = {
  askOnMount?: boolean;
};

const showMediaDevicesPrompt = (constraints: MediaStreamConstraints, onSuccess: () => void, onError: () => void) => {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
      onSuccess();
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    })
    .catch(() => {
      onError();
    });
};

const a = () => {
  window.navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
    console.log(mediaDevices);
  });

  window.navigator.mediaDevices.enumerateDevices().then((mediaDevicesInfo) => {
    console.log({ name: "enumerateDevices before", mediaDevicesInfo });
  });

  window.navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
    console.log({ name: "media stream start", mediaStream });

    window.navigator.mediaDevices.enumerateDevices().then((mediaDevicesInfo) => {
      console.log({ name: "enumerateDevices in", mediaDevicesInfo });
    });

    setTimeout(() => {
      console.log({ name: "stopping" });
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });

      setTimeout(() => {
        console.log({ name: "enumerate after" });
        window.navigator.mediaDevices.enumerateDevices().then((mediaDevicesInfo) => {
          console.log({ name: "enumerateDevices", mediaDevicesInfo });
        });
      }, 2000);
    }, 10000);
  });

  window.navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
    console.log(mediaDevices);
  });
};

// before authorization:
// chrome:
//  - deviceId - empty string
//  - label - empty string
// firefox:
//  - deviceId - non empty string
//  - label - empty string
// firefox returns label only if persistent permissions are granted
// from docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices

export const useMediaDeviceManager = ({ askOnMount }: MediaDeviceManagerConfig = {}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [asked, setAsked] = useState(!askOnMount);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean | null>(null);
  const [videoPermissionGranted, setVideoPermissionGranted] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
      setDevices(mediaDevices);
      const audioInput = mediaDevices.filter((device) => device.kind === "audioinput");
      setAudioInputDevices(audioInput);

      const audioOutput = mediaDevices.filter((device) => device.kind === "audiooutput");
      setAudioOutputDevices(audioOutput);

      const video = mediaDevices.filter((device) => device.kind === "videoinput");
      setVideoInputDevices(video);
    });
  }, []);

  useEffect(() => {
    if (devices.length === 0) return;

    const emptyId = devices
      .filter((device) => device.kind === "audioinput")
      .find((device) => device.deviceId === "" || device.label === "");
    setAudioPermissionGranted(!emptyId);
  }, [devices]);

  useEffect(() => {
    if (devices.length === 0) return;

    const emptyId = devices
      .filter((device) => device.kind === "videoinput")
      .find((device) => device.deviceId === "" || device.label === "");
    setVideoPermissionGranted(!emptyId);
  }, [devices]);

  const askForPermissions = useCallback(() => {
    if (!audioPermissionGranted && !videoPermissionGranted) {
      showMediaDevicesPrompt(
        { video: true, audio: true },
        () => {
          setAudioPermissionGranted(true);
          setVideoPermissionGranted(true);
        },
        () => setErrorMessage("You didn't allow this site to use Camera and Microphone")
      );
    } else if (!audioPermissionGranted) {
      showMediaDevicesPrompt(
        { audio: true },
        () => {
          setAudioPermissionGranted(true);
        },
        () => setErrorMessage("You didn't allow this site to use Microphone")
      );
    } else if (!videoPermissionGranted) {
      showMediaDevicesPrompt(
        { video: true },
        () => {
          setVideoPermissionGranted(true);
        },
        () => setErrorMessage("You didn't allow this site to use Camera")
      );
    }
  }, [audioPermissionGranted, videoPermissionGranted]);

  useEffect(() => {
    if (asked) return;
    if (devices.length === 0) return;
    if (audioPermissionGranted === null) return;
    if (videoPermissionGranted === null) return;

    askForPermissions();

    setAsked(true);
  }, [devices, audioPermissionGranted, videoPermissionGranted, asked, askForPermissions]);

  return {
    devices,
    audioPermissionGranted,
    videoPermissionGranted,
    errorMessage,
    askForPermissions,
    audioInputDevices,
    audioOutputDevices,
    videoInputDevices,
  };
};
