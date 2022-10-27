import React, { FC, useState } from "react";

import { useDisplayMedia, UseMediaResult, useUserMedia } from "./hooks/useUserMedia";
import { AUDIO_TRACK_CONSTRAINTS, SCREENSHARING_MEDIA_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";
import { useMediaStreamControl } from "./hooks/useMediaStreamControl";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, RemotePeer, usePeersState } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { useLocalPeerStreamLifecycle } from "./hooks/useLocalPeerStreamLifecycle";
import { getRandomAnimalEmoji } from "./utils";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
};

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(isSimulcastOn);
  const [peerMetadata] = useState<PeerMetadata>({emoji: getRandomAnimalEmoji(), displayName: displayName})

  // useAskForPermission()
  const userMediaVideo: UseMediaResult = useUserMedia(VIDEO_TRACK_CONSTRAINTS);
  const userMediaAudio: UseMediaResult = useUserMedia(AUDIO_TRACK_CONSTRAINTS);
  const displayMedia: UseMediaResult = useDisplayMedia(SCREENSHARING_MEDIA_CONSTRAINTS);

  const { state: peerState, api: peerApi } = usePeersState();

  const { webrtc, selectRemoteTrackEncoding, enableTrackEncoding, disableTrackEncoding } =
    useMembraneClient(roomId, peerMetadata, isSimulcastOn, peerApi, setErrorMessage);

  const userCameraStreamId = useMediaStreamControl("camera", webrtc, userMediaVideo.stream);
  const userAudioStreamId = useMediaStreamControl("audio", webrtc, userMediaAudio.stream);
  const screenSharingStreamId = useMediaStreamControl("screensharing", webrtc, displayMedia.stream);

  useLocalPeerStreamLifecycle("camera", peerApi, userMediaVideo.stream, userCameraStreamId || undefined);
  useLocalPeerStreamLifecycle("audio", peerApi, userMediaAudio.stream, userAudioStreamId || undefined);
  useLocalPeerStreamLifecycle("screensharing", peerApi, displayMedia.stream, screenSharingStreamId || undefined);

  return (
    <section>
      <div className="flex flex-col h-screen relative">
        {errorMessage && (
          <div className="bg-red-700" style={{ height: "100px", width: "100%" }}>
            {errorMessage}
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
              Participants
              <span> {displayName}</span>
              {peerState.remote.map((e: RemotePeer) => (
                <span key={e.id} title={e.id}>
                  {e.displayName}
                </span>
              ))}
            </h3>
          </header>
          <VideochatSection
            peers={peerState.remote}
            localPeer={peerState.local}
            showSimulcast={showSimulcastMenu}
            selectRemoteTrackEncoding={selectRemoteTrackEncoding}
            enableTrackEncoding={enableTrackEncoding}
            disableTrackEncoding={disableTrackEncoding}
          />
        </section>
        <MediaControlButtons
          userMediaAudio={userMediaAudio}
          userMediaVideo={userMediaVideo}
          displayMedia={displayMedia}
        />
      </div>
      {isSimulcastOn && (
        <button
          onClick={toggleSimulcastMenu}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 md:right-2 md:-translate-x-1 md:left-auto bg-gray-700 hover:bg-gray-900 focus:ring ring-gray-800 focus:border-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-max"
          type="submit"
        >
          Show simulcast controls
        </button>
      )}
    </section>
  );
};

export default RoomPage;
