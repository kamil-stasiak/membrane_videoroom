import { useCallback, useState } from "react";

export type MediaDeviceManager = {
  // todo what to do with constraints?
  listDevices: (constraints?: MediaStreamConstraints) => void;
  isPermissionManagerWindowDisplayed: boolean;
  error: string | null;
  devices: MediaDeviceInfo[] | null;
  devicesMap: MediaDeviceInfoMap | null;
};

export type MediaDeviceInfoMap = {
  [Property in MediaDeviceKind]?: MediaDeviceInfo[];
};

const formatErrorMessage = (audio: boolean, video: boolean) => {
  if (audio && video) return "You didn't allow this site to use Camera and Microphone";
  if (video) return "You didn't allow this site to use Camera";
  if (audio) return "You didn't allow this site to use Microphone";
  else return "Something went wrong during media device initialization";
};

export const useMediaDeviceManager2 = (): MediaDeviceManager => {
  const [isPermissionManagerWindowDisplayed, setIsPermissionManagerWindowDisplayed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // todo remove devices
  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [devicesMap, setDevicesMap] = useState<MediaDeviceInfoMap | null>(null);

  const updateDevicesMap = (devices: MediaDeviceInfo[]) => {
    // console.log({ name: "Updating devices map", devices });
    setDevicesMap({
      videoinput: devices.filter((device) => device.kind === "videoinput"),
      audioinput: devices.filter((device) => device.kind === "audioinput"),
      audiooutput: devices.filter((device) => device.kind === "audiooutput"),
    });
  };

  const listDevices = useCallback(() => {
    // console.log({ devicesMap });
    if (devicesMap !== null) {
      // console.log("Ignored");
      return;
    }
    // console.log("Start list devices");
    navigator.mediaDevices
      .enumerateDevices()
      .then((infos) => {
        const shouldAskForVideoPermission = infos.some((info) => info.label === "" && info.kind === "videoinput");
        const shouldAskForAudioPermission = infos.some((info) => info.label === "" && info.kind === "audioinput");

        updateDevicesMap(infos);
        // in firefox audio and video are connected. Both true or both false
        // in chrome audio and video are independent
        // even google meet couldn't guess firefox permissions - it always displays both camera and mic
        if (!shouldAskForVideoPermission && !shouldAskForAudioPermission) {
          // setDevices(infos);
          // updateDevicesMap(infos);
          return;
        }

        setIsPermissionManagerWindowDisplayed(true);

        navigator.mediaDevices
          .getUserMedia({ audio: shouldAskForAudioPermission, video: shouldAskForVideoPermission })
          .then((mediaStream) => {
            setIsPermissionManagerWindowDisplayed(false);

            navigator.mediaDevices
              .enumerateDevices()
              .then((mediaDeviceInfos) => {
                // setDevices(mediaDeviceInfos);
                updateDevicesMap(mediaDeviceInfos);
              })
              .catch((e) => {
                console.error({ message: "Error during enumerateDevices", error: e });
              })
              .finally(() => {
                mediaStream.getTracks().forEach((track) => track.stop());
              });
          })
          .catch((e) => {
            setIsPermissionManagerWindowDisplayed(false);

            const message = formatErrorMessage(shouldAskForAudioPermission, shouldAskForVideoPermission);
            console.error({
              message: message,
              error: e,
              video: shouldAskForVideoPermission,
              audio: shouldAskForAudioPermission,
            });
            setError(message);
          });
      })
      .catch((e) => {
        console.error({ message: "Error during enumerateDevices()", error: e });
      });
  }, [devicesMap]);

  return { listDevices, isPermissionManagerWindowDisplayed, error, devices, devicesMap };
};
