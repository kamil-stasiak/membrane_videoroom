import React, { FC, useEffect, useState } from "react";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, RemotePeer, usePeersState } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import { DeviceSelector } from "./components/DeviceSelector";
import { useSelectMediaDevice } from "./hooks/useSelectMediaDevice";
import { useMediaDeviceManager2 } from "./hooks/useMediaDeviceManager2";
import { AUDIO_TRACK_CONSTRAINTS, SCREENSHARING_MEDIA_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
  autostartStreaming?: boolean;
};

export type SetErrorMessage = (value: string) => void;

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn, manualMode, autostartStreaming }: Props) => {
  const wakeLock = useAcquireWakeLockAutomatically();
  const deviceManager = useMediaDeviceManager2();

  const [used, setUsed] = useState<boolean>(false);
  useEffect(() => {
    if (!deviceManager || used) return;
    deviceManager.listDevices();
    setUsed(true);
  }, [deviceManager, used]);

  // useEffect(() => {
  //   console.log({ name: "Manager", deviceManager });
  // }, [deviceManager]);

  const videoInputs = useSelectMediaDevice("videoDeviceId", deviceManager?.devicesMap?.videoinput || []);
  const audioInputs = useSelectMediaDevice("audioDeviceId", deviceManager?.devicesMap?.audioinput || []);

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [showDeveloperInfo, toggleDeveloperInfo] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const { state: peerState, api: peerApi } = usePeersState();
  const { webrtc } = useMembraneClient(roomId, peerMetadata, isSimulcastOn, peerApi, setErrorMessage);

  useEffect(() => {
    console.log({ name: "peerState", peerState });
  }, [peerState]);

  const isConnected = !!peerState?.local?.id;

  const camera = useStreamManager(
    "camera",
    videoInputs.deviceId,
    mode,
    isConnected,
    isSimulcastOn,
    webrtc,
    peerApi,
    autostartStreaming || false,
    "video",
    VIDEO_TRACK_CONSTRAINTS,
    "user"
  );
  const audio = useStreamManager(
    "audio",
    audioInputs.deviceId,
    mode,
    isConnected,
    isSimulcastOn,
    webrtc,
    peerApi,
    autostartStreaming || false,
    "audio",
    AUDIO_TRACK_CONSTRAINTS,
    "user"
  );
  const screenSharing = useStreamManager(
    "screensharing",
    null,
    mode,
    isConnected,
    isSimulcastOn,
    webrtc,
    peerApi,
    autostartStreaming || false,
    "video",
    SCREENSHARING_MEDIA_CONSTRAINTS,
    "display"
  );

  return (
    <section>
      <div className="flex flex-col h-screen relative">
        {errorMessage && <div className="bg-red-700 text-white p-1 w-full">{errorMessage}</div>}

        {showDeveloperInfo && (
          <div className="absolute text-white text-shadow-lg right-0 top-0 p-2 flex flex-col text-right">
            <span className="ml-2">Is WakeLock supported: {wakeLock.isSupported ? "🟢" : "🔴"}</span>
          </div>
        )}

        <DeviceSelector
          label="Select video input"
          options={videoInputs.devices}
          setDeviceId={videoInputs.setDeviceId}
          deviceId={videoInputs.deviceId}
        />
        <DeviceSelector
          label="Select audio input"
          options={audioInputs.devices}
          setDeviceId={audioInputs.setDeviceId}
          deviceId={audioInputs.deviceId}
        />

        <section className="flex flex-col h-screen mb-14">
          <header className="p-4">
            <div className="flex items-center">
              <img src="/svg/logo_min.svg" className="hidden md:block h-8 mr-2" alt="Mini logo" />
              <h2 className="text-2xl md:text-4xl text-center font-bold text-white">Membrane WebRTC video room demo</h2>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Room {roomId}</h3>
            <h3 className="text-xl font-medium text-white">
              Participants{" "}
              <span>
                {peerMetadata.emoji} {peerMetadata.displayName}
              </span>
              {peerState.remote.map((peer: RemotePeer) => (
                <span key={peer.id} title={peer.id}>
                  {peer.emoji} {peer.displayName}
                </span>
              ))}
            </h3>
          </header>
          <VideochatSection
            peers={peerState.remote}
            localPeer={peerState.local}
            showSimulcast={showSimulcastMenu}
            showDeveloperInfo={showDeveloperInfo}
            webrtc={webrtc}
          />
        </section>
        <MediaControlButtons
          mode={mode}
          videoDeviceId={videoInputs.deviceId}
          userMediaVideo={camera.local}
          cameraStreaming={camera.remote}
          audioDeviceId={audioInputs.deviceId}
          userMediaAudio={audio.local}
          audioStreaming={audio.remote}
          displayMedia={screenSharing.local}
          screenSharingStreaming={screenSharing.remote}
        />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 md:right-2 md:-translate-x-1 md:left-auto flex flex-col items-stretch">
        {isSimulcastOn && (
          <button
            onClick={toggleSimulcastMenu}
            className="bg-gray-700 hover:bg-gray-900 focus:ring ring-gray-800 focus:border-gray-800 text-white font-bold py-2 px-4 m-1 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            Show simulcast controls
          </button>
        )}
        <button
          onClick={toggleDeveloperInfo}
          className="bg-gray-700 hover:bg-gray-900 focus:ring ring-gray-800 focus:border-gray-800 text-white font-bold py-2 px-4 m-1 rounded focus:outline-none focus:shadow-outline w-full"
          type="submit"
        >
          Show developer info
        </button>
      </div>
    </section>
  );
};

export default RoomPage;
