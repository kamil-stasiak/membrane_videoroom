import React, { FC, useEffect, useState } from "react";
import { AUDIO_TRACKS_CONFIG, SCREEN_SHARING_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "./consts";
import { useMembraneClient, UseMembraneClientType } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, RemotePeer } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import { TrackContext } from "@membraneframework/membrane-webrtc-js";
import { isTrackType } from "../types";
import { useFullState } from "../../library/useFullState";
import { useClientErrorState } from "../../library/useClientErrorState";
import { useLibraryPeersState } from "../../library/usePeersState";
import { LibraryPeer } from "../../library/types";
import { UseLocalPeersState, useLocalPeerState } from "../../library/useLoclPeerState";

type VideoComponentProps = {
  peerId: string;
  membrane: UseMembraneClientType;
};

const PeerComponent = ({ peerId }: VideoComponentProps) => {
  return <div className="text-white">{peerId}</div>;
};

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
  autostartStreaming?: boolean;
};

export type SetErrorMessage = (value: string) => void;

export const parseMetadata = (context: TrackContext) => {
  const type = context.metadata.type;
  const active = context.metadata.active;
  return isTrackType(type) ? { type, active } : { active };
};

const useLog = (state: any, name: string) => {
  useEffect(() => {
    console.log({ name: name, state });
  }, [state, name]);
};

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn, manualMode, autostartStreaming }: Props) => {
  const wakeLock = useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [showDeveloperInfo, toggleDeveloperInfo] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const clientWrapper: UseMembraneClientType | null = useMembraneClient(roomId, peerMetadata, isSimulcastOn, setErrorMessage);

  // const { state, api } = useFullState(clientWrapper, peerMetadata);
  useClientErrorState(clientWrapper, setErrorMessage);
  const peersState = useLibraryPeersState(clientWrapper);

  const local: UseLocalPeersState = useLocalPeerState();
  const isConnected = clientWrapper?.webrtcConnectionStatus === "connected";

  useLog(peersState, "peerState");
  useLog(local, "local");

  const camera = useStreamManager(
    "camera",
    mode,
    isConnected,
    isSimulcastOn,
    clientWrapper,
    VIDEO_TRACKS_CONFIG,
    local,
    autostartStreaming
  );
  const audio = useStreamManager(
    "audio",
    mode,
    isConnected,
    isSimulcastOn,
    clientWrapper,
    AUDIO_TRACKS_CONFIG,
    local,
    autostartStreaming
  );
  const screenSharing = useStreamManager(
    "screensharing",
    mode,
    isConnected,
    isSimulcastOn,
    clientWrapper,
    SCREEN_SHARING_TRACKS_CONFIG,
    local,
    false
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
              {peersState?.list.map((peer: LibraryPeer) => (
                <span key={peer.id} title={peer.id}>
                  {peer.id}
                </span>
              ))}
            </h3>
          </header>
          {clientWrapper && <PeerComponent membrane={clientWrapper} peerId={"Local peer"} />}
          {clientWrapper && (
            <>
              {local.id && <PeerComponent membrane={clientWrapper} peerId={"Local peer"} />}
              {peersState?.list?.map((peer) => (
                <PeerComponent key={peer.id} membrane={clientWrapper} peerId={peer.id} />
              ))}
            </>
          )}

          {/*<VideochatSection*/}
          {/*  clientWrapper={clientWrapper}*/}
          {/*  peers={peersState.remote}*/}
          {/*  localPeer={peersState.local}*/}
          {/*  showSimulcast={showSimulcastMenu}*/}
          {/*  showDeveloperInfo={showDeveloperInfo}*/}
          {/*  webrtc={clientWrapper?.webrtc}*/}
          {/*/>*/}
        </section>
      </div>
      <MediaControlButtons
        mode={mode}
        userMediaVideo={camera.local}
        cameraStreaming={camera.remote}
        userMediaAudio={audio.local}
        audioStreaming={audio.remote}
        displayMedia={screenSharing.local}
        screenSharingStreaming={screenSharing.remote}
      />
      <div className="absolute bottom-2 right-2 flex flex-col items-stretch">
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
