import React, { FC, useMemo } from "react";
import { ApiTrack, RemotePeer } from "../../hooks/usePeerState";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { StreamSource, TrackType } from "../../../types";
import InfoLayer from "./PeerInfoLayer";
import PeerInfoLayer from "./PeerInfoLayer";
import MicrophoneOff from "../../../../features/room-page/icons/MicrophoneOff";
import CameraOff from "../../../../features/room-page/icons/CameraOff";
import { useSelector } from "../../../../library/useSelector";
import { LibraryTrackMinimal, PeerId, TrackId, UseMembraneClientType } from "../../../../library/types";
import { PeerMetadata, TrackMetadata } from "../../../../libraryUsage/types";
import {
  createLocalPeerIdsSelector,
  createLocalTracksIdsSelector,
  createLocalTracksSelector,
  createPeerIdsSelector,
} from "../../../../library/selectors";
import {
  createAudioTrackStatusSelector,
  createLocalTracksRecordSelector,
  createTracksRecordSelector,
} from "../../../../libraryUsage/customSelectors";
import { useSelector2 } from "../../../../libraryUsage/setup";
import { useLog } from "../../../../helpers/UseLog";

export type TrackWithId = {
  stream?: MediaStream;
  remoteTrackId: string | null;
  encodingQuality?: TrackEncoding;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  enabled?: boolean;
};

export type MediaPlayerTileConfig = {
  peerId?: string;
  emoji?: string;
  flipHorizontally?: boolean;
  displayName?: string;
  video: TrackWithId[];
  audio: TrackWithId[];
  playAudio: boolean;
  screenSharing: TrackWithId[];
  showSimulcast?: boolean;
  remoteSimulcast?: boolean;
  streamSource: StreamSource;
  mediaPlayerId: string;
};

const getTracks = (tracks: ApiTrack[], type: TrackType): TrackWithId[] =>
  tracks
    .filter((track) => track?.metadata?.type === type)
    .map(
      (track): TrackWithId => ({
        stream: track.mediaStream,
        remoteTrackId: track.trackId,
        encodingQuality: track.encoding,
        metadata: track.metadata,
        enabled: true,
      })
    );

const mapRemotePeersToMediaPlayerConfig = (peers: RemotePeer[], showSimulcast?: boolean): MediaPlayerTileConfig[] => {
  return peers.map((peer: RemotePeer): MediaPlayerTileConfig => {
    const videoTracks: TrackWithId[] = getTracks(peer.tracks, "camera");
    const audioTracks: TrackWithId[] = getTracks(peer.tracks, "audio");
    const screenSharingTracks: TrackWithId[] = getTracks(peer.tracks, "screensharing");

    return {
      peerId: peer.id,
      emoji: peer.emoji,
      displayName: peer.displayName,
      video: videoTracks,
      audio: audioTracks,
      screenSharing: screenSharingTracks,
      showSimulcast: showSimulcast,
      flipHorizontally: false,
      remoteSimulcast: true,
      streamSource: "remote",
      playAudio: true,
      mediaPlayerId: peer.id,
    };
  });
};

type Props = {
  // clientWrapper: UseMembraneClientType<PeerMetadata, TrackMetadata>;
  // peers: RemotePeer[];
  // localUser: MediaPlayerTileConfig;
  // showSimulcast?: boolean;
  // showDeveloperInfo?: boolean;
  // selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn?: boolean;
  // webrtc?: MembraneWebRTC;
};

const isLoading = (track: TrackWithId) => track?.stream === undefined && track?.metadata?.active === true;
const showDisabledIcon = (track: TrackWithId) => track?.stream === undefined || track?.metadata?.active === false;

type MediaPlayerTileWrapperProps = {
  // clientWrapper: UseMembraneClientType<PeerMetadata, TrackMetadata> | null;
  peerId: string;
};
//
const RemoteMediaPlayerTileWrapper = ({ peerId }: MediaPlayerTileWrapperProps) => {
  const tracks = useSelector2(createTracksRecordSelector(peerId));

  return (
    <MediaPlayerTile
      audioStream={tracks.audio?.stream || null}
      videoStream={tracks.camera?.stream || null}
      playAudio={true}
      layers={<RemoteLayer peerId={peerId} />}
    />
  );
};

// const usePlayerTileHook = (clientWrapper: UseMembraneClientType<PeerMetadata, TrackMetadata>, peerId: string) => {
//   const tracks = useSelector(clientWrapper, createTracksRecordSelector(peerId));
//   useMemo(() => ({
//     audio: tracks.audio.
//   }), [tracks])
// };

type LocalPeerMediaPlayerWrapperProps = {
  // clientWrapper: UseMembraneClientType<PeerMetadata, TrackMetadata> | null;
};

type RemoteLayerProps = {
  peerId: PeerId;
};

const RemoteLayer = ({ peerId }: RemoteLayerProps) => {
  const audioStatus = useSelector2(createAudioTrackStatusSelector(peerId));

  useLog(audioStatus, "Audio status");
  return (
    <InfoLayer
      topLeft={
        <div className="flex flex-row items-center gap-x-2 text-xl">
          {audioStatus === "muted" && <MicrophoneOff />}
          {audioStatus === "active" && "Active"}
          {audioStatus === null && "None"}
        </div>
      }
    />
  );
};

const LocalPeerMediaPlayerWrapper = (props: LocalPeerMediaPlayerWrapperProps) => {
  const tracks: Partial<Record<TrackType, LibraryTrackMinimal>> = useSelector2(createLocalTracksRecordSelector());

  return (
    <MediaPlayerTile
      audioStream={null}
      videoStream={tracks.camera?.stream || null}
      flipHorizontally={true}
      playAudio={false}
    />
  );
};

const MediaPlayerPeersSection: FC<Props> = ({
  // peers,
  // localUser,
  // showSimulcast,
  oneColumn,
}: // clientWrapper,
// webrtc,
// showDeveloperInfo,
Props) => {
  // const allPeersConfig: MediaPlayerTileConfig[] = [
  //   localUser,
  //   ...mapRemotePeersToMediaPlayerConfig(peers, showSimulcast),
  // ];

  const localPeerId: PeerId | null = useSelector2(createLocalPeerIdsSelector());
  const remotePeersIds: Array<PeerId> = useSelector2(createPeerIdsSelector());

  return (
    <div
      id="videos-grid"
      className={clsx({
        "grid h-full w-full flex-1 grid-flow-row grid-cols-1 justify-items-center gap-4": true,
        "md:grid-cols-2": !oneColumn,
      })}
    >
      {localPeerId && <LocalPeerMediaPlayerWrapper />}
      {remotePeersIds.map((peerId) => (
        <RemoteMediaPlayerTileWrapper key={peerId} peerId={peerId} />
      ))}

      {/*<MediaPlayerTile />*/}
      {/*{allPeersConfig.map((config) => {*/}
      {/*  // todo for now only first audio, video and screen sharing stream are handled*/}
      {/*  const video: TrackWithId | undefined = config.video[0];*/}
      {/*  const screenSharing: TrackWithId | undefined = config.screenSharing[0];*/}
      {/*  const audio: TrackWithId | undefined = config.audio[0];*/}

      {/*  const emoji = config.emoji || "";*/}
      {/*  const localAudio = config.playAudio ? { emoji: "🔊", title: "Playing" } : { emoji: "🔇", title: "Muted" };*/}

      {/*  // todo refactor to separate component / layer*/}
      {/*  const cameraDevice = video?.stream ? "📹🟢" : "📹🔴";*/}
      {/*  const screenSharingDevice = screenSharing?.stream ? "🖥🟢" : "🖥🔴";*/}
      {/*  const microphoneDevice = audio?.stream ? "🔊🟢" : "🔊🔴";*/}

      {/*  const cameraStreamStatus = video?.enabled ? "📹🟢" : "📹🔴";*/}
      {/*  const screenSharingStreamStatus = screenSharing?.enabled ? "🖥🟢" : "🖥🔴";*/}
      {/*  const microphoneStreamStatus = audio?.enabled ? "🔊🟢" : "🔊🔴";*/}

      {/*  const cameraTrack = video?.remoteTrackId ? "📹🟢" : "📹🔴";*/}
      {/*  const screenSharingTrack = screenSharing?.remoteTrackId ? "🖥🟢" : "🖥🔴";*/}
      {/*  const microphoneTrack = audio?.remoteTrackId ? "🔊🟢" : "🔊🔴";*/}

      {/*  const cameraMetadataStatus = video?.metadata?.active ? "📹🟢" : "📹🔴";*/}
      {/*  const screenSharingMetadataStatus = screenSharing?.metadata?.active ? "🖥🟢" : "🖥🔴";*/}
      {/*  const microphoneMetadataStatus = audio?.metadata?.active ? "🔊🟢" : "🔊🔴";*/}

      {/*  return (*/}
      {/*    <MediaPlayerTile*/}
      {/*      key={config.mediaPlayerId}*/}
      {/*      peerId={config.peerId}*/}
      {/*      video={video}*/}
      {/*      audioStream={audio?.stream}*/}
      {/*      layers={*/}
      {/*        <>*/}
      {/*          {showDeveloperInfo && (*/}
      {/*            <PeerInfoLayer*/}
      {/*              topLeft={<div>{emoji}</div>}*/}
      {/*              topRight={*/}
      {/*                <div>*/}
      {/*                  <div className="text-right">*/}
      {/*                    <span title="Streaming" className="ml-2">*/}
      {/*                      Device:*/}
      {/*                    </span>*/}
      {/*                    <span title="Screen Sharing" className="ml-2">*/}
      {/*                      {screenSharingDevice}*/}
      {/*                    </span>*/}
      {/*                    <span title="Camera" className="ml-2">*/}
      {/*                      {cameraDevice}*/}
      {/*                    </span>*/}
      {/*                    <span title="Audio" className="ml-2">*/}
      {/*                      {microphoneDevice}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}
      {/*                  <div className="text-right">*/}
      {/*                    <span title="Streaming" className="ml-2">*/}
      {/*                      Stream status:*/}
      {/*                    </span>*/}
      {/*                    <span title="Screen Sharing" className="ml-2">*/}
      {/*                      {screenSharingStreamStatus}*/}
      {/*                    </span>*/}
      {/*                    <span title="Camera" className="ml-2">*/}
      {/*                      {cameraStreamStatus}*/}
      {/*                    </span>*/}
      {/*                    <span title="Audio" className="ml-2">*/}
      {/*                      {microphoneStreamStatus}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}
      {/*                  <div className="text-right">*/}
      {/*                    <span title="Streaming" className="ml-2">*/}
      {/*                      Active tracks:*/}
      {/*                    </span>*/}
      {/*                    <span title="Screen Sharing" className="ml-2">*/}
      {/*                      {screenSharingTrack}*/}
      {/*                    </span>*/}
      {/*                    <span title="Camera" className="ml-2">*/}
      {/*                      {cameraTrack}*/}
      {/*                    </span>*/}
      {/*                    <span title="Audio" className="ml-2">*/}
      {/*                      {microphoneTrack}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}
      {/*                  <div className="text-right">*/}
      {/*                    <span title="Streaming" className="ml-2">*/}
      {/*                      Metadata:*/}
      {/*                    </span>*/}
      {/*                    <span title="Screen Sharing" className="ml-2">*/}
      {/*                      {screenSharingMetadataStatus}*/}
      {/*                    </span>*/}
      {/*                    <span title="Camera" className="ml-2">*/}
      {/*                      {cameraMetadataStatus}*/}
      {/*                    </span>*/}
      {/*                    <span title="Audio" className="ml-2">*/}
      {/*                      {microphoneMetadataStatus}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}
      {/*                </div>*/}
      {/*              }*/}
      {/*              bottomRight={*/}
      {/*                <div className="text-right">*/}
      {/*                  <span className="ml-2">Allow audio playing:</span>*/}
      {/*                  <span title={localAudio.title} className="ml-2">*/}
      {/*                    {localAudio.emoji}*/}
      {/*                  </span>*/}
      {/*                </div>*/}
      {/*              }*/}
      {/*            />*/}
      {/*          )}*/}
      {/*          <InfoLayer*/}
      {/*            bottomLeft={<div>{config.displayName}</div>}*/}
      {/*            topLeft={*/}
      {/*              <div className="flex flex-row items-center gap-x-2 text-xl">*/}
      {/*                {showDisabledIcon(audio) && (*/}
      {/*                  <MicrophoneOff className={clsx(isLoading(audio) && "animate-spin")} />*/}
      {/*                )}*/}
      {/*                {showDisabledIcon(video) && <CameraOff className={clsx(isLoading(audio) && "animate-spin")} />}*/}
      {/*              </div>*/}
      {/*            }*/}
      {/*          />*/}
      {/*        </>*/}
      {/*      }*/}
      {/*      showSimulcast={showSimulcast}*/}
      {/*      streamSource={config.streamSource}*/}
      {/*      flipHorizontally={config.flipHorizontally}*/}
      {/*      webrtc={webrtc}*/}
      {/*      playAudio={config.playAudio}*/}
      {/*    />*/}
      {/*  );*/}
      {/*})}*/}
    </div>
  );
};

export default MediaPlayerPeersSection;
