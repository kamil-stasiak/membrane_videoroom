import React, { FC } from "react";
import { Device } from "../../home/HomePage";

type Props = {
  label: string;
  setDeviceId: (id: string) => void;
  deviceId: string | null;
  options: Device[];
};

export const DeviceSelector: FC<Props> = ({ label, setDeviceId, deviceId, options }: Props) => {
  return (
    <div className="text-sm md:text-base text-gray-700 opacity-80 bg-white p-2 z-50">
      <label>{label}</label>
      <select
        value={deviceId || undefined}
        onChange={(event) => {
          const value: string = event.target.value;
          setDeviceId(value);
        }}
      >
        {options.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
