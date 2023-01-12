import React, { FC } from "react";
import { AUDIO_TRACKS_CONFIG, SCREEN_SHARING_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "./consts";
import MediaControlButtons from "./components/MediaControlButtons";
import { RemotePeer } from "../../library/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import { useLibrary } from "../../library/library";
import { useVideoroomWrapper } from "../../library-usage/videoroom-wrapper";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
  autostartStreaming?: boolean;
};

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn, manualMode, autostartStreaming }: Props) => {
  const wakeLock = useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [showDeveloperInfo, toggleDeveloperInfo] = useToggle(false);

  const library = useVideoroomWrapper(roomId, displayName, isSimulcastOn);

  const isConnected = !!library.peerState?.local?.id;

  const camera = useStreamManager(
    "camera",
    mode,
    isConnected,
    isSimulcastOn,
    library.newWebRtc,
    VIDEO_TRACKS_CONFIG,
    library.peerApi,
    autostartStreaming
  );
  const audio = useStreamManager(
    "audio",
    mode,
    isConnected,
    isSimulcastOn,
    library.newWebRtc,
    AUDIO_TRACKS_CONFIG,
    library.peerApi,
    autostartStreaming
  );
  const screenSharing = useStreamManager(
    "screensharing",
    mode,
    isConnected,
    isSimulcastOn,
    library.newWebRtc,
    SCREEN_SHARING_TRACKS_CONFIG,
    library.peerApi,
    false
  );

  return (
    <section>
      <div className="flex flex-col h-screen relative">
        {library.errorMessage && <div className="bg-red-700 text-white p-1 w-full">{library.errorMessage}</div>}

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
                {library.peerMetadata.emoji} {library.peerMetadata.displayName}
              </span>
              {library.peerState.remote.map((peer: RemotePeer) => (
                <span key={peer.id} title={peer.id}>
                  {peer.emoji} {peer.displayName}
                </span>
              ))}
            </h3>
          </header>
          <VideochatSection
            peers={library.peerState.remote}
            localPeer={library.peerState.local}
            showSimulcast={showSimulcastMenu}
            showDeveloperInfo={showDeveloperInfo}
            webrtc={library.newWebRtc}
          />
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
