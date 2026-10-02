"use client";

import { useTracks, AudioTrack, isTrackReference } from "@livekit/components-react";
import { Track } from "livekit-client";

/**
 * Invisible component that attaches and plays incoming audio tracks from remote participants.
 */
export function AudioRenderer() {
  const audioTracks = useTracks([
    { source: Track.Source.Microphone, withPlaceholder: false },
  ]);

  return (
    <>
      {audioTracks.map((track) =>
        track.participant?.isLocal || !isTrackReference(track) ? null : (
          <AudioTrack key={track.publication.trackSid} trackRef={track} />
        )
      )}
    </>
  );
}
