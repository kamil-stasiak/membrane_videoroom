export const AUDIO_TRACK_CONSTRAINTS: MediaTrackConstraints = {
  advanced: [
    { autoGainControl: true },
    { noiseSuppression: true },
    { echoCancellation: true },
  ],
};

export const VIDEO_TRACK_CONSTRAINTS: MediaTrackConstraints = {
  width: { max: 640, ideal: 640, min: 640 },
  height: { max: 480, ideal: 480, min: 480 },
  frameRate: { max: 30, ideal: 24 },
};

export const SCREENSHARING_MEDIA_CONSTRAINTS: DisplayMediaStreamConstraints = {
  video: {
    frameRate: { ideal: 10, max: 15 },
  },
};

export const LOCAL_PEER_ID = "local-peer";

const MBps = 1024 * 8;

export const BANDWIDTH_LIMITS = {
  video: 10 * MBps,
  audio: 1 * MBps,
};
