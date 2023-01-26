import React, { FC, useState } from "react";
import { AUDIO_TRACKS_CONFIG, SCREEN_SHARING_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "./consts";
import { useMembraneClient, UseMembraneClientType } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import { useClientErrorState } from "../../library/useClientErrorState";
import { LibraryPeersState, LibraryTrackMinimal, PeerId } from "../../library/types";
import { UseLocalPeersState, useLocalPeerState } from "../../library/useLoclPeerState";
import { useSelector } from "../../library/useSelector";
import {
  createPeerIdsSelector,
  createTracksIdsSelector,
  createTracksSelector,
  createTrackMetadataSelector,
  createFullStateSelector,
} from "../../library/selectors";
import { createPeersGuiSelector, PeerGui } from "../../library/customSelectors";
import { VideochatSection } from "./VideochatSection";
import { useLog } from "../../helpers/UseLog";

type TrackMetadataComponentProps = {
  peerId: string;
  trackId: string;
  membrane: UseMembraneClientType;
};

const TrackMetadataComponent = ({ peerId, trackId, membrane }: TrackMetadataComponentProps) => {
  const metadata: object = useSelector(membrane, createTrackMetadataSelector(peerId, trackId));

  return (
    <div className="border-dashed border-2 border-indigo-600">
      {Object.entries(metadata || {}).map(([key, value]) => (
        <div key={key}>
          {key}:{JSON.stringify(value)}
        </div>
      ))}
    </div>
  );
};

type RemoteTrackComponentProps = {
  // remove peerId
  peerId: string;
  trackId: string;
  membrane: UseMembraneClientType;
};

const RemoteTrackComponent = ({ trackId, membrane, peerId }: RemoteTrackComponentProps) => {
  return (
    <div>
      <h2>{trackId}</h2>
      <TrackMetadataComponent trackId={trackId} membrane={membrane} peerId={peerId} />
    </div>
  );
};

type VideoComponentProps = {
  peerId: string;
  membrane: UseMembraneClientType;
};

const RemotePeerComponent = ({ peerId, membrane }: VideoComponentProps) => {
  const tracksState: Array<string> = useSelector(membrane, createTracksIdsSelector(peerId));

  return (
    <div className="text-white border-dashed border-2 border-indigo-600">
      <h1>{peerId}</h1>
      {tracksState.map((trackId) => (
        <RemoteTrackComponent key={trackId} trackId={trackId} membrane={membrane} peerId={peerId} />
      ))}
    </div>
  );
};

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
  autostartStreaming?: boolean;
};

export type SetErrorMessage = (value: string) => void;

const RoomPage: FC<Props> = (props: Props) => {
  const { roomId, displayName, isSimulcastOn, manualMode, autostartStreaming } = props;
  const wakeLock = useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(true);
  const [showDeveloperInfo, toggleDeveloperInfo] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const local: UseLocalPeersState<PeerMetadata> = useLocalPeerState<PeerMetadata>();
  const clientWrapper: UseMembraneClientType | null = useMembraneClient(
    roomId,
    peerMetadata,
    isSimulcastOn,
    setErrorMessage
  );
  // useLocalPeerIdTODO(clientWrapper, peerMetadata, local.setLocalPeer);

  const remotePeers: Array<PeerGui> = useSelector(clientWrapper, createPeersGuiSelector());
  useClientErrorState(clientWrapper, setErrorMessage);
  const isConnected = clientWrapper?.webrtcConnectionStatus === "connected";

  const fullState: LibraryPeersState | null = useSelector(clientWrapper, createFullStateSelector());
  useLog(fullState, "fullState");

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
              {remotePeers.map((peer) => (
                <span key={peer.id} title={peer.id}>
                  ({peer.emoji}
                  {peer.name})
                </span>
              ))}
            </h3>
          </header>
          {/*{clientWrapper && (*/}
          {/*  <>*/}
          {/*    {local.id && <div className="text-white">{local.id}</div>}*/}
          {/*    {remotePeers.map((peer) => (*/}
          {/*      <RemotePeerComponent key={peer.id} membrane={clientWrapper} peerId={peer.id} />*/}
          {/*    ))}*/}
          {/*  </>*/}
          {/*)}*/}

          <VideochatSection
            clientWrapper={clientWrapper}
            // peers={peersState.remote}
            // localPeer={peersState.local}
            showSimulcast={showSimulcastMenu}
            showDeveloperInfo={showDeveloperInfo}
            webrtc={clientWrapper?.webrtc}
          />
        </section>
      </div>
      <MediaControlButtons
        clientWrapper={clientWrapper}
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
