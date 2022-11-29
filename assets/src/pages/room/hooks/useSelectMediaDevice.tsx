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

  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    console.log({ name: "currentInput", deviceId });
  }, [deviceId]);

  useEffect(() => {
    if (mediaDevices.length === 0) return;
    if (deviceId) return;

    console.log({ name: "mediaDevices", mediaDevices });

    const selectedDevice = mediaDevices.find((e) => e.deviceId !== "default");
    if (selectedDevice) {
      setDeviceId(selectedDevice.deviceId);
    }
  }, [mediaDevices, deviceId, setDeviceId]);

  return { devices, setDeviceId, deviceId };
};
