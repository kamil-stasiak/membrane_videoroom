import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type SetErrorMessage = (value: string) => void;

export type ApiTrack = {
  trackId: string;
  mediaStreamTrack?: MediaStreamTrack;
  mediaStream?: MediaStream;
  metadata?: TrackMetadata;
  encoding?: TrackEncoding;
};

export type RemotePeer = {
  tracks: ApiTrack[];
} & NewPeer;

export type PeersMap = {
  [peerId: string]: RemotePeer;
};

// todo move display name and emoji to metadata
export type NewPeer = {
  id: string;
  displayName?: string;
  emoji?: string;
  source: "local" | "remote";
};

// todo Change TrackEncoding to something like EncodingType in "@membraneframework/membrane-webrtc-js"
const EncodingValues = ["l", "m", "h"] as const;
type EncodingType = typeof EncodingValues[number]; // eslint-disable-line @typescript-eslint/no-unused-vars

export const isTrackEncoding = (value: string): value is TrackEncoding =>
  EncodingValues.includes(value as TrackEncoding);

const TrackTypeValues = ["screensharing", "camera", "audio"] as const;
export type TrackType = typeof TrackTypeValues[number];
export const isTrackType = (value: string): value is TrackType => TrackTypeValues.includes(value as TrackType);

const StreamSourceValues = ["local", "remote"] as const;
export type StreamSource = typeof StreamSourceValues[number];

export type TrackMetadata = {
  type?: TrackType;
};

export type PeersState = {
  local?: LocalPeer;
  remote: RemotePeer[];
};

export type Track = {
  stream?: MediaStream;
  trackId?: string;
  enabled: boolean;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

// todo replace by TracksMap
export type Tracks = {
  [Property in TrackType]?: Track;
};

export type TracksMap = Partial<Record<TrackType,Track>>


export type LocalPeer = {
  id?: string;
  metadata?: PeerMetadata;
  tracks: Tracks;
};

export type PrivateApi = {
  addPeers: (peerId: NewPeer[]) => void;
  removePeer: (peerId: string) => void;
  addTrack: (
    peerId: string,
    trackId: string,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    metadata?: TrackMetadata
  ) => void;
  removeTrack: (peerId: string, trackId: string) => void;
  setMetadata: (peerId: string, trackId: string, metadata: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  setEncoding: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  setLocalPeer: (id: string, metadata?: PeerMetadata) => void;
  setLocalStream: (type: TrackType, enabled: boolean, stream: MediaStream | undefined) => void;
  setLocalTrackId: (type: TrackType, trackId: string | null) => void;
  setLocalTrackMetadata: (type: TrackType, metadata?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type UsePeersStateResult = {
  state: PeersState;
  api: PrivateApi;
};

export type PeerMetadata = {
  emoji?: string;
  displayName?: string;
};
