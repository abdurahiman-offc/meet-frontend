"use client";

import { useState, useEffect } from "react";
import { ConnectionQualityIndicator } from "./ConnectionQualityIndicator";

interface TopBarProps {
  meetingId: string;
  role: "host" | "attendee";
  isSharingScreen?: boolean;
  onStopScreenShare?: () => void;
}

/**
 * Google Meet top info bar:
 * - Left: Official 4-color Meet camera glyph + Meet label + Meeting code chip with copy button
 * - Center: Active presentation banner (if presenting)
 * - Right: Real-time clock + End-to-end security shield + Connection indicator + Host tag
 */
export function TopBar({
  meetingId,
  role,
  isSharingScreen,
  onStopScreenShare,
}: TopBarProps) {
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="h-14 px-4 sm:px-6 flex items-center justify-between bg-[#202124] border-b border-[#3c4043]/40 z-20 select-none">
      {/* Left: Google Meet Logo & Meeting Code */}
      <div className="flex items-center gap-3">
        {/* Google Meet 4-color Camera Glyph */}
        <div className="flex items-center gap-2">
          <svg className="w-7 h-7" viewBox="0 0 87.2 72.3" fill="none">
            {/* Green top left */}
            <path
              d="M0 55.4V16.9C0 7.6 7.6 0 16.9 0H52.3V55.4H0Z"
              fill="#00832d"
            />
            {/* Blue camera body */}
            <path
              d="M0 55.4V16.9C0 7.6 7.6 0 16.9 0H52.3V55.4H0Z"
              fill="#00ac47"
            />
            {/* Yellow bottom */}
            <path
              d="M52.3 55.4H16.9C7.6 55.4 0 63 0 72.3H52.3V55.4Z"
              fill="#ffba00"
            />
            {/* Red top corner */}
            <path
              d="M52.3 0H69.2C78.5 0 86.1 7.6 86.1 16.9V27.7L69.2 16.9H52.3V0Z"
              fill="#ea4335"
            />
            {/* Blue camera lens */}
            <path
              d="M69.2 16.9L87.2 29.8V42.5L69.2 55.4V16.9Z"
              fill="#2684fc"
            />
            {/* Green right bottom */}
            <path
              d="M52.3 55.4H69.2L86.1 44.6V55.4C86.1 64.7 78.5 72.3 69.2 72.3H52.3V55.4Z"
              fill="#0066da"
            />
          </svg>
          <span className="text-[#e8eaed] font-medium text-base tracking-tight hidden sm:inline">
            Google Meet
          </span>
        </div>

        {/* Meeting ID chip with copy button */}
        <div className="relative flex items-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3c4043]/30 hover:bg-[#3c4043]/60 border border-[#3c4043]/40 text-[#bdc1c6] hover:text-white transition-all text-xs font-mono"
            title="Copy joining info"
          >
            <span>{meetingId}</span>
            <svg
              className="w-3.5 h-3.5 text-[#9aa0a6]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
              />
            </svg>
          </button>
          {copied && (
            <span className="absolute -bottom-8 left-0 text-[11px] bg-[#28292c] text-[#8ab4f8] px-2.5 py-1 rounded-md shadow-lg border border-[#3c4043] animate-fade-in whitespace-nowrap z-30">
              Joining link copied!
            </span>
          )}
        </div>
      </div>

      {/* Center: Screen presentation banner (when presenting) */}
      {isSharingScreen && (
        <div className="hidden md:flex items-center gap-3 px-4 py-1 rounded-full bg-[#8ab4f8]/15 border border-[#8ab4f8]/30 text-[#8ab4f8] text-xs font-medium animate-fade-in">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
          </svg>
          <span>You are presenting to everyone</span>
          {onStopScreenShare && (
            <button
              onClick={onStopScreenShare}
              className="ml-1 px-2.5 py-0.5 rounded-full bg-[#8ab4f8] text-[#202124] font-semibold hover:bg-[#aecbfa] transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      )}

      {/* Right: Security shield + Connection indicator + Clock + Host */}
      <div className="flex items-center gap-3">
        {/* End-to-end encryption / secure badge */}
        <div
          className="hidden sm:flex items-center gap-1 text-[11px] text-[#9aa0a6] hover:text-[#bdc1c6] transition-colors cursor-default"
          title="Your meeting is encrypted"
        >
          <svg className="w-3.5 h-3.5 text-[#81c995]" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
          <span className="hidden md:inline">Encrypted</span>
        </div>

        {/* Network Connection Quality */}
        <ConnectionQualityIndicator showLabel={true} />

        {/* Host badge */}
        {role === "host" && (
          <span className="text-[11px] font-medium text-[#fbbc04] bg-[#fbbc04]/10 border border-[#fbbc04]/25 px-2.5 py-0.5 rounded-full">
            Host
          </span>
        )}

        {/* Live time */}
        <span className="text-xs font-medium text-[#9aa0a6] pl-1">
          {currentTime}
        </span>
      </div>
    </header>
  );
}
