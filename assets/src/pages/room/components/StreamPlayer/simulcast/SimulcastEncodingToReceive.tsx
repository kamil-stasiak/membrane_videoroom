import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { Tooltip } from "./Tooltip";
import { LayerButton } from "./LayerButton";

type Props = {
  currentEncoding: TrackEncoding | null;
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (encoding: TrackEncoding) => void;
  tileSizeEncoding: TrackEncoding | null;
  smartEncoding: TrackEncoding | null;
  localSmartEncodingStatus: boolean;
  setLocalSmartEncodingStatus: (value: boolean) => void;
  globalSmartEncodingStatus: boolean;
  disabled: boolean;
};

export const SimulcastEncodingToReceive: FC<Props> = ({
  currentEncoding,
  targetEncoding,
  setTargetEncoding,
  tileSizeEncoding,
  smartEncoding,
  localSmartEncodingStatus,
  setLocalSmartEncodingStatus,
  globalSmartEncodingStatus,
  disabled,
}: Props) => {
  return (
    <div className="absolute bottom-0 right-0 z-50 w-full bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
      <div className="flex flex-row justify-between">
        <Tooltip text="Encoding based on all rules" textCss="left-20">
          <div>Smart: {smartEncoding}</div>
        </Tooltip>

        <Tooltip text="Toggle automatic layer switching">
          <div className="form-check flex items-center gap-x-1">
            <label className="form-check-label text-brand-dark-blue-500">Smart</label>
            <input
              disabled={!globalSmartEncodingStatus}
              onChange={() => setLocalSmartEncodingStatus(!localSmartEncodingStatus)}
              className="form-check-input"
              type="checkbox"
              checked={globalSmartEncodingStatus && localSmartEncodingStatus}
            />
          </div>
        </Tooltip>

        <Tooltip text="Encoding based on tile size" textCss="right-20">
          <div>Tile: {tileSizeEncoding}</div>
        </Tooltip>
      </div>

      <div className="flex flex-row justify-between">
        <Tooltip text="Current encoding" textCss="left-10">
          <div>Encoding: {currentEncoding}</div>
        </Tooltip>

        <Tooltip text="Selected encoding target">
          <div>Target: {targetEncoding}</div>
        </Tooltip>

        <div className="flex flex-row justify-end">
          <LayerButton
            disabled={disabled}
            text="L"
            onClick={() => setTargetEncoding("l")}
            tooltipText="Switch encoding to Low"
          />
          <LayerButton
            disabled={disabled}
            text="M"
            onClick={() => setTargetEncoding("m")}
            tooltipText="Switch encoding to Medium"
          />
          <LayerButton
            disabled={disabled}
            text="H"
            onClick={() => setTargetEncoding("h")}
            tooltipText="Switch encoding to High"
          />
        </div>
      </div>
    </div>
  );
};
