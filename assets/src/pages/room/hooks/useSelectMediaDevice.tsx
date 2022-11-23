import { useEffect, useState } from "react";
import { Device } from "../../home/HomePage";

export const useSelectMediaDevice = (mediaDevices: MediaDeviceInfo[]) => {
  // useEffect(() => {
  //   console.log({ devices: mediaDevices });
  // }, [mediaDevices]);

  const devices: Device[] = mediaDevices.map((device) => ({
    id: device.deviceId,
    label: device.label,
  }));
  const [device, setDevice] = useState<string | null>(null);

  // useEffect(() => {
  //   console.log({ name: "currentInput", device });
  // }, [device]);

  useEffect(() => {
    if (mediaDevices.length === 0) return;
    if (device) return;

    setDevice(mediaDevices[0].deviceId);
  }, [mediaDevices, device, setDevice]);

  return { devices, setDevice, device };
};
