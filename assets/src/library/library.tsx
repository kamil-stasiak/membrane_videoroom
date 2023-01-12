import { useMemo, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { PeerMetadata, PrivateApi, PeersState, usePeersState } from "./usePeerState";
import { useMembraneClient } from "./useMembraneClient";
import {
  SimulcastConfig,
  TrackBandwidthLimit,
  TrackEncoding,
} from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";

export type PublicApi = Pick<
  MembraneWebRTC,
  | "addTrack"
  | "replaceTrack"
  | "removeTrack"
  | "updateTrackMetadata"
  | "enableTrackEncoding"
  | "disableTrackEncoding"
  | "setTargetTrackEncoding"
>;

const EMPTY = () => {
  return;
};

export type UseLibraryType = {
  peerState: PeersState; // wynikowa strukturka
  errorMessage: string | undefined;
  privateApi: PrivateApi; // dodawanie do wynikowej strukturki // low level, do ukrycia
  publicApi: PublicApi; // api dla uzytkownika
};

export const useLibrary = (roomId: string, isSimulcastOn: boolean, metadata: PeerMetadata): UseLibraryType => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { state: peerState, api: peerApi } = usePeersState();
  const { webrtc } = useMembraneClient(roomId, metadata, isSimulcastOn, peerApi, setErrorMessage);

  const newWebRtc: PublicApi = useMemo(() => {
    console.log({ webrtc });
    if (!webrtc) {
      console.log("Empty webrtc");
      return {
        addTrack: (
          track: MediaStreamTrack,
          stream: MediaStream,
          trackMetadata?: any,
          simulcastConfig?: SimulcastConfig,
          maxBandwidth?: TrackBandwidthLimit
        ) => "",
        removeTrack: (trackId: string) => EMPTY(),
        replaceTrack: (trackId: string, newTrack: MediaStreamTrack, newTrackMetadata?: any) => Promise.reject(),
        updateTrackMetadata: (trackId: string, trackMetadata: any) => EMPTY(),
        enableTrackEncoding: (trackId: string, encoding: TrackEncoding) => EMPTY(),
        disableTrackEncoding: (trackId: string, encoding: TrackEncoding) => EMPTY(),
        setTargetTrackEncoding: (trackId: string, encoding: TrackEncoding) => EMPTY(),
      };
    }

    console.log("Not empty webrtc");

    return {
      addTrack: (
        track: MediaStreamTrack,
        stream: MediaStream,
        trackMetadata?: any,
        simulcastConfig?: SimulcastConfig,
        maxBandwidth?: TrackBandwidthLimit
      ) => webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth),
      removeTrack: (trackId: string) => webrtc.removeTrack(trackId),
      replaceTrack: (trackId: string, newTrack: MediaStreamTrack, newTrackMetadata?: any) =>
        webrtc.replaceTrack(trackId, newTrack),
      updateTrackMetadata: (trackId: string, trackMetadata: any) => webrtc.updateTrackMetadata(trackId, trackMetadata),
      enableTrackEncoding: (trackId: string, encoding: TrackEncoding) => webrtc.enableTrackEncoding(trackId, encoding),
      disableTrackEncoding: (trackId: string, encoding: TrackEncoding) =>
        webrtc.disableTrackEncoding(trackId, encoding),
      setTargetTrackEncoding: (trackId: string, encoding: TrackEncoding) =>
        webrtc.setTargetTrackEncoding(trackId, encoding),
    };
  }, [webrtc]);

  return { errorMessage, peerState, privateApi: peerApi, publicApi: newWebRtc };
};
