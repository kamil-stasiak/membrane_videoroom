import { useCallback, useEffect, useState } from "react";
import { Device } from "../../home/HomePage";

export const useSelectMediaDevice = (key: string, mediaDevices: MediaDeviceInfo[]) => {
  const devices: Device[] = mediaDevices.map((device) => ({
    id: device.deviceId,
    label: device.label,
  }));

  const [deviceId, setDeviceIdLocal] = useState<string | null>(null);

  const setDeviceId = useCallback(
    (value: string) => {
      setDeviceIdLocal(value);
      localStorage.setItem(key, value);
    },
    [key, setDeviceIdLocal]
  );

  useEffect(() => {
    if (mediaDevices.length === 0) return;
    if (deviceId) return;

    const localStorageId: string | null = localStorage.getItem(key);
    const lastSelectedDevice: MediaDeviceInfo | undefined = mediaDevices.find((e) => e.deviceId === localStorageId);
    const defaultDevice: MediaDeviceInfo | undefined = mediaDevices.find((e) => e.deviceId === "default");
    const firstFromList: MediaDeviceInfo = mediaDevices?.[0];

    const devicesList = [lastSelectedDevice, defaultDevice, firstFromList];
    const selectedDevice = devicesList.filter((device) => device)?.[0];

    selectedDevice && setDeviceId(selectedDevice.deviceId);
  }, [mediaDevices, deviceId, setDeviceId, key]);

  return { devices, setDeviceId, deviceId };
};
