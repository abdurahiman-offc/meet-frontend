"use client";

import { useTracks, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";

interface ScreenShareViewProps {
  onStopPresentation?: () => void;
  isLocalPresenting?: boolean;
}

/**
 * Google Meet presentation stage rendering active screen share feed
 * with a frosted presenter chip and stop presentation action.
 */
export function ScreenShareView({
  onStopPresentation,
  isLocalPresenting,
}: ScreenShareViewProps) {
  const screenTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const activeScreen = screenTracks[0];

  if (!activeScreen) return null;

  const presenterName = isLocalPresenting
    ? "You"
    : activeScreen.participant?.name || "A participant";

  return (
    <div className="relative flex-1 bg-[#171717] rounded-2xl overflow-hidden border border-[#3c4043]/40 flex items-center justify-center shadow-xl">
      <VideoTrack
        trackRef={activeScreen as any}
        className="w-full h-full object-contain"
      />

      {/* Floating Presenter Banner */}
      <div className="absolute top-3 left-3 bg-[#202124]/90 backdrop-blur-md rounded-full px-3.5 py-1.5 flex items-center gap-2.5 border border-white/10 shadow-lg z-10 select-none">
        <div className="w-5 h-5 rounded-full bg-[#8ab4f8]/20 flex items-center justify-center text-[#8ab4f8]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
          </svg>
        </div>
        <span className="text-[#e8eaed] text-xs font-medium">
          {isLocalPresenting ? "You are presenting to everyone" : `${presenterName} is presenting`}
        </span>
        {isLocalPresenting && onStopPresentation && (
          <button
            onClick={onStopPresentation}
            className="ml-1 px-3 py-1 rounded-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] text-xs font-semibold transition-colors"
          >
            Stop presenting
          </button>
        )}
      </div>
    </div>
  );
}
