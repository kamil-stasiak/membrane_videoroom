import React, { FC, useEffect, useState } from "react";
import { AUDIO_TRACKS_CONFIG, SCREEN_SHARING_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "./consts";
import { useMembraneClient, UseMembraneClientType } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { ApiTrack, PeerMetadata } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import { TrackContext } from "@membraneframework/membrane-webrtc-js";
import { isTrackType } from "../types";
import { useClientErrorState } from "../../library/useClientErrorState";
import { LibraryPeersState } from "../../library/types";
import { UseLocalPeersState, useLocalPeerState } from "../../library/useLoclPeerState";
import { useLocalPeerIdTODO } from "../../library/useLocalPeerIdTODO";
import { UseTracksState, useTracksState } from "../../library/useTracksState";
import { useTrackMetadata } from "../../library/useTrackMetadata";
import { useLibraryPeersState2 } from "../../library/usePeersState2";
import { useFullState2 } from "./UseFullState2";
import { Track3, useTracksState2 } from "../../library/useTracksState2";
import { useLog } from "./UseLog";
import { useWhyDidYouUpdate } from "../../library/whyDidYouRender";

type TrackMetadataComponentProps = {
  trackId: string;
  membrane: UseMembraneClientType;
};

const TrackMetadataComponent = ({ trackId, membrane }: TrackMetadataComponentProps) => {
  const metadata = useTrackMetadata(membrane, trackId);

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
  track: Track3;
  membrane: UseMembraneClientType;
};

const RemoteTrackComponent = ({ track, membrane }: RemoteTrackComponentProps) => {
  return (
    <div>
      <h2>
        {track.track?.kind} - {track.trackId}
      </h2>
      {/*<TrackMetadataComponent trackId={track.trackId} membrane={membrane} />*/}
    </div>
  );
};

type VideoComponentProps = {
  peerId: string;
  membrane: UseMembraneClientType;
};

const RemotePeerComponent = ({ peerId, membrane }: VideoComponentProps) => {
  const tracksState = useTracksState2(membrane, peerId);

  // useEffect(() => {
  //   console.log({ name: "tracks", tracksState });
  // }, [tracksState]);

  return (
    <div className="text-white border-dashed border-2 border-indigo-600">
      <h1>{peerId}</h1>
      {/*{tracksState.map((track) => (*/}
      {/*  <RemoteTrackComponent key={track?.trackId} track={track} membrane={membrane} />*/}
      {/*))}*/}
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

export const parseMetadata = (context: TrackContext) => {
  const type = context.metadata.type;
  const active = context.metadata.active;
  return isTrackType(type) ? { type, active } : { active };
};

const subscribers: Array<() => void> = [];

// function subscribe(callback) {
//   window.addEventListener('online', callback);
//   window.addEventListener('offline', callback);
//   return () => {
//     window.removeEventListener('online', callback);
//     window.removeEventListener('offline', callback);
//   };
// }

// const subscribe = (callback: () => void) => {
//   // console.log("subscribe");
//   //
//   // subscribers.push(callback);
//
//   return () => {
//     // console.log("unsubscribe");
//   };
// };

// const getSnapshot = () => {
//   console.log("getSnapshot");
//   return "OK";
// };
//

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

  const remotePeers = useLibraryPeersState2(clientWrapper);
  // useWhyDidYouUpdate("RoomPage", props);

  // useFullState2(clientWrapper);

  // useSyncExternalStore(subscribe, getSnapshot);

  // const isOnline = useSyncExternalStore(subscribe, getSnapshot);

  // const { state, api } = useFullState(clientWrapper, peerMetadata);
  useClientErrorState(clientWrapper, setErrorMessage);

  // const peersState: LibraryPeersState | null = useLibraryPeersState2(clientWrapper);
  const isConnected = clientWrapper?.webrtcConnectionStatus === "connected";

  // useLog(remotePeers, "remotePeers");
  // useLog(local, "local");
  // useLog(state, "fullState");

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
        {/*<button*/}
        {/*  onClick={() =>*/}
        {/*    subscribers.forEach((call) => {*/}
        {/*      call();*/}
        {/*    })*/}
        {/*  }*/}
        {/*>*/}
        {/*  Click*/}
        {/*</button>*/}

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
              {/*{remotePeers.map((peerId) => (*/}
              {/*  <span key={peerId} title={peerId}>*/}
              {/*    {peerId}*/}
              {/*  </span>*/}
              {/*))}*/}
            </h3>
          </header>
          {clientWrapper && (
            <>
              {local.id && <div className="text-white">{local.id}</div>}
              {remotePeers.map((peerId) => (
                <RemotePeerComponent key={peerId} membrane={clientWrapper} peerId={peerId} />
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
