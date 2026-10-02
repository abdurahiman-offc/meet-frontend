"use client";

import { useState, useEffect } from "react";
import { useSpeakingParticipants } from "@livekit/components-react";

interface CaptionsBarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Google Meet Live Captions Bar (Subtitles Overlay):
 * Renders speech indicators and transcript placeholders for active speakers.
 */
export function CaptionsBar({ isOpen, onClose }: CaptionsBarProps) {
  const speakingParticipants = useSpeakingParticipants();
  const [activeSpeech, setActiveSpeech] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    if (speakingParticipants.length > 0) {
      const speaker = speakingParticipants[0];
      const speakerName = speaker.name || "Participant";
      setActiveSpeech(`${speakerName}: [Speaking...]`);
    } else {
      const timer = setTimeout(() => {
        setActiveSpeech("");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [speakingParticipants, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-xl w-[90%] bg-[#202124]/90 backdrop-blur-md border border-[#3c4043]/60 rounded-2xl px-5 py-3 shadow-2xl flex items-center justify-between z-20 animate-fade-in select-none">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#8ab4f8]/20 text-[#8ab4f8] flex-shrink-0">
          CC &bull; English
        </span>
        <p className="text-white text-xs sm:text-sm font-medium truncate">
          {activeSpeech || "Listening for speech..."}
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-6 h-6 rounded-full hover:bg-[#3c4043] flex items-center justify-center text-[#9aa0a6] hover:text-white transition-colors flex-shrink-0 ml-2"
        title="Turn off captions"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
