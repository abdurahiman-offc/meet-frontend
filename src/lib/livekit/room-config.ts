import {
  RoomOptions,
  VideoPresets,
  AudioPresets,
  ScreenSharePresets,
} from "livekit-client";

/**
 * Standard LiveKit Room configuration for Google Meet-style video quality
 * and network reliability.
 *
 * Configures:
 * - Adaptive Stream: LiveKit automatically adjusts received video quality
 *   based on the rendered video element size.
 * - Dynacast: Automatically pauses unpublished/unconsumed video layers
 *   to conserve publisher bandwidth and CPU.
 * - 720p Video Capture & Encoding defaults with simulcast (720p, 360p, 180p).
 * - 1080p 15fps screen share encoding for sharp text/slides.
 * - Speech audio preset with Discontinuous Transmission (DTX) and Redundant Audio (RED)
 *   for resilience against packet loss.
 */
export const MEETING_ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
  publishDefaults: {
    simulcast: true,
    videoEncoding: VideoPresets.h720.encoding,
    videoSimulcastLayers: [
      VideoPresets.h360,
      VideoPresets.h180,
    ],
    screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
    audioPreset: AudioPresets.speech,
    dtx: true,
    red: true,
  },
};
