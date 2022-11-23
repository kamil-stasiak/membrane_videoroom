import React, { FC } from "react";
import { Device } from "../../home/HomePage";

type Props = {
  setDeviceId: (id: string) => void;
  deviceId?: string;
  disabled?: boolean;
  options: Device[];
};

export const DeviceSelector: FC<Props> = ({ setDeviceId, deviceId, disabled, options }: Props) => {
  return (
    <div className="text-sm md:text-base text-gray-700 opacity-80 bg-white p-2 z-50">
      <label>Select video input</label>
      <select
        disabled={disabled}
        // value={"default"}
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
