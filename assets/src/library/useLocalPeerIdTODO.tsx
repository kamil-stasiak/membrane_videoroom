import { PeerMetadata } from "../pages/room/hooks/usePeerState";
import { UseMembraneClientType } from "../pages/room/hooks/useMembraneClient";
import { Callbacks } from "@membraneframework/membrane-webrtc-js/dist/membraneWebRTC";
import { useEffect } from "react";
import { SetLocalPeer } from "./useLoclPeerState";

export const useLocalPeerIdTODO = (
  clientWrapper: UseMembraneClientType | null,
  peerMetadata: PeerMetadata,
  setLocalPeer: SetLocalPeer<PeerMetadata>
) => {
  useEffect(() => {
    if (!clientWrapper) return;
    // todo add init state before

    const callbacks: Partial<Callbacks> = {
      onJoinSuccess: (peerId) => {
        setLocalPeer(peerId, peerMetadata);
      },
    };


    // zakładamy message emitter i go usuwamy
    // jeżeli założymu onJoinSuccess za późno, to nie dostaniemy pierwszego eventu,
    // żeby to zminimalizować moglibyśmy na początku odczytać stan WebRtc i dopiero potem zakładać listenery (1)
    // ale czy to nas uratuje? Nie bardzo bo:
    // - zapinam stan domyślny
    // - dostaję event (bo to jest asynchroniczne)
    // - zapinam listenera (2)
    //
    // 1 nie możemy dodać domyślnego stanu bo w MembraneWebRtc wszystko na ten moment jest prywatne
    // 2 wniosek z tego taki, żę listenery trzeba zapiąć na samym początku albo użyć takich, co powtórzą wszystkie
    // komunikaty od początku


    setTimeout(() => {
      clientWrapper.messageEmitter.on("onJoinSuccess", callbacks.onJoinSuccess);
    }, 5000);

    return () => {
      clientWrapper.messageEmitter.off("onJoinSuccess", callbacks.onJoinSuccess);
    };
  }, [clientWrapper, peerMetadata, setLocalPeer]);
};
