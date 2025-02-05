import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { isTrackEncoding } from "../../../../types";

type Props = {
  setDesiredEncoding: (encoding: TrackEncoding) => void;
  desiredEncoding?: TrackEncoding;
  disabled?: boolean;
};

export const SimulcastEncodingToReceive: FC<Props> = ({ desiredEncoding, setDesiredEncoding, disabled }: Props) => {
  return (
    <div className="absolute bottom-0 right-0 z-50 bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
      <label>Encoding to receive</label>
      <select
        disabled={disabled}
        value={desiredEncoding}
        onChange={(event) => {
          const value = event.target.value;
          if (!isTrackEncoding(value)) return;
          setDesiredEncoding(value);
        }}
      >
        <option value="h">High</option>
        <option value="m">Medium</option>
        <option value="l">Low</option>
      </select>
    </div>
  );
};
