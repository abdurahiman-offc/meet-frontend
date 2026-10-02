"use client";

import { useState } from "react";
import Image from "next/image";
import { useIsSpeaking, useTracks, VideoTrack } from "@livekit/components-react";
import { Track, Participant, LocalParticipant } from "livekit-client";
import { ConnectionQualityIndicator } from "./ConnectionQualityIndicator";

interface ParticipantTileProps {
  participant: Participant | LocalParticipant;
  isLocal: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
  isHandRaised?: boolean;
  isEnhanced?: boolean;
}

/**
 * Google Meet style participant video tile:
 * - 16:9 aspect-video with rounded-2xl corners
 * - Vibrant Google Green outline when speaking
 * - Bottom-left frosted chip with participant name, host badge, and audio equalizer bars
 * - Circular avatar fallback with concentric acoustic pulse rings when speaking with camera off
 * - Top-right pin and muted microphone indicators
 */
export function ParticipantTile({
  participant,
  isLocal,
  isPinned = false,
  onTogglePin,
  isHandRaised = false,
  isEnhanced = false,
}: ParticipantTileProps) {
  const isSpeaking = useIsSpeaking(participant);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch camera track
  const allCameraTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);
  const videoTrack = allCameraTracks.find(
    (t) =>
      t.participant.identity === participant.identity &&
      t.source === Track.Source.Camera
  );

  const isVideoEnabled = videoTrack?.publication && !videoTrack.publication.isMuted;
  const isMuted = participant.isMicrophoneEnabled === false;

  const metadata = (() => {
    try {
      return JSON.parse(participant.metadata || "{}");
    } catch {
      return {};
    }
  })();
  const isHost = metadata.role === "host";

  // Google Meet palette background for avatar initials
  const avatarColors = [
    "bg-[#1a73e8]", // Google Blue
    "bg-[#d93025]", // Google Red
    "bg-[#188038]", // Google Green
    "bg-[#e37400]", // Google Orange
    "bg-[#9334e6]", // Google Purple
    "bg-[#129eaf]", // Teal
  ];
  const charCode = (participant.name || "?").charCodeAt(0);
  const avatarBg = avatarColors[charCode % avatarColors.length];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full aspect-video bg-[#1c1d20] rounded-2xl overflow-hidden transition-all duration-200 select-none group ${
        isSpeaking
          ? "border-2 border-[#34a853] shadow-[0_0_18px_rgba(52,168,83,0.35)]"
          : isPinned
          ? "border-2 border-[#8ab4f8] shadow-[0_0_12px_rgba(138,180,248,0.25)]"
          : "border border-[#3c4043]/30 hover:border-[#3c4043]/70"
      }`}
    >
      {/* 1. Camera Video Feed */}
      {isVideoEnabled ? (
        <VideoTrack
          trackRef={videoTrack as any}
          className="w-full h-full object-cover"
        />
      ) : (
        /* 2. Avatar Fallback with Google Meet Acoustic Wave Ripple */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#25272a] to-[#1c1d20]">
          <div className="relative flex items-center justify-center">
            {/* Concentric sound ripple rings when speaking with camera off */}
            {isSpeaking && (
              <>
                <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[#34a853]/40 animate-acoustic pointer-events-none" />
                <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[#34a853]/30 animate-acoustic-delay pointer-events-none" />
              </>
            )}

            {/* Avatar circle */}
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-semibold text-white shadow-xl border border-white/10 ${avatarBg}`}
            >
              {participant.name?.[0]?.toUpperCase() || "?"}
            </div>
          </div>
        </div>
      )}

      {/* Top Left: Hand Raised badge + Connection quality + Enhanced chip */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
        {isHandRaised && (
          <div
            className="flex items-center gap-1 bg-[#fbbc04] text-[#202124] px-2 py-0.5 rounded-full text-xs font-semibold shadow-md animate-bounce"
            title="Hand raised"
          >
            <span>✋</span>
            <span className="hidden sm:inline text-[11px]">Raised hand</span>
          </div>
        )}
        {isLocal && isEnhanced && (
          <div
            className="flex items-center gap-1 bg-[#202124]/85 backdrop-blur-md text-[#8ab4f8] border border-[#8ab4f8]/40 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm"
            title="Auto-enhanced lighting & clarity via WebGL"
          >
            <span>✨</span>
            <span className="hidden sm:inline">Enhanced</span>
          </div>
        )}
        <div className={`transition-opacity duration-150 ${isHovered ? "opacity-100" : "opacity-0 sm:opacity-80"}`}>
          <ConnectionQualityIndicator participant={participant} />
        </div>
      </div>

      {/* Top Right: Pin button & Muted mic badge */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
        {/* Pin to stage button */}
        {onTogglePin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isPinned
                ? "bg-[#8ab4f8] text-[#202124] shadow-md"
                : "bg-[#202124]/80 backdrop-blur-md text-[#bdc1c6] hover:text-white hover:bg-[#3c4043] border border-white/10 opacity-0 group-hover:opacity-100"
            }`}
            title={isPinned ? "Unpin from main screen" : "Pin to main screen"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25 1.5 1.5.75-.75V8.25L13.5 4.5H9.75v3.75l-.75.75 1.5 1.5m3 0v6.75m-3-6.75L6 15.75m4.5-4.5 4.5 4.5" />
            </svg>
          </button>
        )}

        {/* Mic muted red badge */}
        {isMuted && (
          <div
            className="w-8 h-8 rounded-full bg-[#ea4335] text-white flex items-center justify-center shadow-md border border-red-400/30"
            title="Microphone is off"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom Left: Google Meet Frosted Participant Chip */}
      <div className="absolute bottom-2.5 left-2.5 max-w-[85%] z-10">
        <div className="flex items-center gap-2 bg-[#202124]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-md">
          {/* Active Speaking equalizer bars */}
          {isSpeaking && !isMuted ? (
            <div className="flex items-end gap-[2px] h-3.5 w-3.5 flex-shrink-0" title="Speaking">
              <span className="w-1 bg-[#34a853] rounded-full soundwave-bar-1" />
              <span className="w-1 bg-[#34a853] rounded-full soundwave-bar-2" />
              <span className="w-1 bg-[#34a853] rounded-full soundwave-bar-3" />
            </div>
          ) : null}

          {/* Participant name */}
          <span className="text-white text-xs font-medium truncate">
            {participant.name || "Unknown"}
            {isLocal ? " (You)" : ""}
          </span>

          {/* Host pill tag */}
          {isHost && (
            <span className="text-[10px] font-semibold text-[#fbbc04] bg-[#fbbc04]/15 px-2 py-0.5 rounded-full flex-shrink-0">
              Host
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
