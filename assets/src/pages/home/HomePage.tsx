import React, { FC, useContext, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { UserContext } from "../../contexts/userContext";
import clsx from "clsx";
import { DeveloperContext } from "../../contexts/developerContext";
import { Checkbox, Props as CheckboxProps } from "./Checkbox";
import { useToggle } from "../room/hooks/useToggle";
import { useMediaDeviceManager2 } from "../room/hooks/useMediaDeviceManager2";
import { useBooleanDebounce } from "../room/hooks/useBooleanDebounce";

export type Device = {
  id: string;
  label: string;
};

export const HomePage: FC = () => {
  // const deviceManager = useMediaDeviceManager({ askOnMount: true });
  //
  // const deviceManager = useMediaDeviceManager2();
  // useEffect(() => {
  //   console.log({ name: "devices", d: deviceManager });
  // }, [deviceManager]);
  //
  // const booleanDebounce = useBooleanDebounce(deviceManager.isPermissionManagerWindowDisplayed, 300, 0);

  // useEffect(() => {
  //   console.log({ name: "useDebounce", booleanDebounce });
  // }, [booleanDebounce]);

  const match = useParams();
  const [searchParams] = useSearchParams();
  const { manualMode, simulcast, cameraAutostart } = useContext(DeveloperContext);
  const { setUsername } = useContext(UserContext);

  const roomId: string = match?.roomId || "";
  const [roomIdInput, setRoomIdInput] = useState<string>(roomId);

  const lastDisplayName: string | null = localStorage.getItem("displayName");
  const [displayNameInput, setDisplayNameInput] = useState<string>(lastDisplayName || "");

  const [autostartCameraAndMicInput, setAutostartCameraAndMicCheckbox] = useToggle(false);

  const simulcastParam: string = searchParams?.get("simulcast") || "";
  const simulcastDefaultValue: boolean = simulcastParam === "true";
  const [simulcastInput, toggleSimulcastCheckbox] = useToggle(simulcastDefaultValue);

  const [manualModeInput, toggleManualModeCheckbox] = useToggle(false);

  const disabled = displayNameInput.length === 0 || roomIdInput.length === 0;

  const checkboxes: CheckboxProps[] = [
    {
      text: "Autostart camera and mic",
      id: "autostart-camera-and-mic",
      onClick: setAutostartCameraAndMicCheckbox,
      status: autostartCameraAndMicInput,
    },
    {
      text: "Simulcast",
      id: "simulcast",
      onClick: toggleSimulcastCheckbox,
      status: simulcastInput,
    },
    {
      text: "Manual mode",
      id: "manual-mode",
      onClick: toggleManualModeCheckbox,
      status: manualModeInput,
    },
  ];

  return (
    <section>
      {/*<div*/}
      {/*  className={clsx({*/}
      {/*    "text-white p-1 w-full": true,*/}
      {/*    "bg-green-700": !deviceManager.isPermissionManagerWindowDisplayed,*/}
      {/*    "bg-yellow-700": deviceManager.isPermissionManagerWindowDisplayed,*/}
      {/*  })}*/}
      {/*>*/}
      {/*  <button onClick={() => deviceManager.listDevices()}>Enumerate devices</button>*/}
      {/*</div>*/}

      {/*{deviceManager.error && <div className="bg-red-700 text-white p-1 w-full">{deviceManager.error}</div>}*/}
      {/*{booleanDebounce && <div className="bg-purple-700 text-white p-1 w-full">Text overlay</div>}*/}
      <div className="p-8 flex flex-col items-center">
        <div className="mb-4">
          <img src="/svg/logo.svg" className="mb-2" alt="logo" />
          <h2 className="font-rocGrotesk font-medium text-4xl text-white mb-2 ">Videoroom</h2>
        </div>
        <div className="bg-white shadow-md rounded max-w-md px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_name">
              Room name
            </label>
            <input
              value={roomIdInput}
              onChange={(event) => setRoomIdInput(event.target.value)}
              type="text"
              required
              name="room_name"
              placeholder="Room name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="display_name">
              Display name
            </label>
            <input
              value={displayNameInput}
              onChange={(event) => setDisplayNameInput(event.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="display_name"
              type="text"
              placeholder="Display name"
            />
          </div>
          {checkboxes.map(({ text, id, status, onClick }, index) => (
            <Checkbox key={index} text={text} id={id} status={status} onClick={onClick} />
          ))}
          <div className="flex items-center justify-between">
            <Link
              onClick={() => {
                localStorage.setItem("displayName", displayNameInput);
                setUsername(displayNameInput);
                simulcast.setSimulcast(simulcastInput);
                manualMode.setManualMode(manualModeInput);
                cameraAutostart.setCameraAutostart(autostartCameraAndMicInput);
              }}
              to={`/room/${roomIdInput}`}
              className={clsx(
                disabled ? "pointer-events-none cursor-default bg-gray-300" : "bg-membraneLight",
                "w-full hover:bg-membraneLight/75 focus:ring ring-membraneDark focus:border-membraneDark text-membraneDark font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              )}
            >
              Join room!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
