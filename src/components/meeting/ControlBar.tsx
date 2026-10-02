"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocalParticipant } from "@livekit/components-react";
import { endMeeting, leaveMeeting } from "@/lib/api";
import { DrawerTab } from "./SideDrawer";

interface ControlBarProps {
  meetingId: string;
  role: "host" | "attendee";
  sessionId: string;
  activeDrawerTab: DrawerTab | null;
  onToggleDrawer: (tab: DrawerTab) => void;
  participantCount?: number;
  unreadChatCount?: number;
  isHandRaised?: boolean;
  onToggleHand?: () => void;
  isCaptionsOn?: boolean;
  onToggleCaptions?: () => void;
  onOpenSettings?: () => void;
  isEnhancementEnabled?: boolean;
  onToggleEnhancement?: () => void;
}

/**
 * Google Meet 3-Zone Bottom Control Bar:
 * - Zone 1 (Left): Live clock + meeting ID + copy link button
 * - Zone 2 (Center): Mic, Camera, Captions, Raise Hand, Screen Share, More Options (⋮), Leave/End call (Red Pill)
 * - Zone 3 (Right): Details (ⓘ), People (👥), Chat (💬), Activities (▲●■), Host Controls (🛡️)
 */
export function ControlBar({
  meetingId,
  role,
  sessionId,
  activeDrawerTab,
  onToggleDrawer,
  participantCount = 1,
  unreadChatCount = 0,
  isHandRaised = false,
  onToggleHand,
  isCaptionsOn = false,
  onToggleCaptions,
  onOpenSettings,
  isEnhancementEnabled = true,
  onToggleEnhancement,
}: ControlBarProps) {
  const router = useRouter();
  const { localParticipant } = useLocalParticipant();

  const [currentTime, setCurrentTime] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;
  const isSharing = localParticipant?.isScreenShareEnabled ?? false;

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close more menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Media toggles
  const toggleMic = async () => {
    await localParticipant?.setMicrophoneEnabled(!isMicEnabled);
  };

  const toggleCamera = async () => {
    await localParticipant?.setCameraEnabled(!isCameraEnabled);
  };

  const toggleScreenShare = async () => {
    if (isSharing) {
      await localParticipant?.setScreenShareEnabled(false);
    } else {
      try {
        await localParticipant?.setScreenShareEnabled(true);
      } catch (err: any) {
        if (err.name !== "NotAllowedError") {
          console.error("Screen share error:", err);
        }
      }
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveMeeting(meetingId);
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem(`meeting_token_${meetingId}`);
      router.replace("/dashboard");
    }
  };

  const handleEndForAll = async () => {
    try {
      await endMeeting(meetingId);
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem(`meeting_token_${meetingId}`);
      router.replace("/dashboard");
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    setShowMoreMenu(false);
  };

  return (
    <>
      <footer className="h-20 bg-[#202124] border-t border-[#3c4043]/40 px-4 sm:px-6 flex items-center justify-between z-20 select-none">
        {/* ── ZONE 1 (Left): Time & Meeting ID ── */}
        <div className="hidden lg:flex items-center gap-3 min-w-[200px]">
          <span className="text-white text-sm font-medium">
            {currentTime}
          </span>
          <span className="text-[#5f6368]">|</span>
          <div className="relative flex items-center">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-[#bdc1c6] hover:text-white font-mono hover:bg-[#3c4043]/40 px-2 py-1 rounded-lg transition-colors"
              title="Copy joining info"
            >
              <span>{meetingId}</span>
              <svg className="w-3.5 h-3.5 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            </button>
            {copiedLink && (
              <span className="absolute -top-9 left-0 text-[11px] bg-[#28292c] text-[#8ab4f8] px-2.5 py-1 rounded-md shadow-lg border border-[#3c4043] whitespace-nowrap animate-fade-in z-30">
                Link copied!
              </span>
            )}
          </div>
        </div>

        {/* ── ZONE 2 (Center): Primary Action Buttons ── */}
        <div className="flex items-center gap-2.5 sm:gap-3 mx-auto">
          {/* 1. Microphone Toggle */}
          <button
            id="room-mic-btn"
            onClick={toggleMic}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
              isMicEnabled
                ? "bg-[#3c4043] hover:bg-[#474a4d] text-white"
                : "bg-[#ea4335] hover:bg-[#d93025] text-white shadow-md"
            }`}
            title={isMicEnabled ? "Turn off microphone (ctrl + d)" : "Turn on microphone (ctrl + d)"}
          >
            {isMicEnabled ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            )}
          </button>

          {/* 2. Camera Toggle */}
          <button
            id="room-cam-btn"
            onClick={toggleCamera}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
              isCameraEnabled
                ? "bg-[#3c4043] hover:bg-[#474a4d] text-white"
                : "bg-[#ea4335] hover:bg-[#d93025] text-white shadow-md"
            }`}
            title={isCameraEnabled ? "Turn off camera (ctrl + e)" : "Turn on camera (ctrl + e)"}
          >
            {isCameraEnabled ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25ZM12 9.75h.008v.008H12V9.75Z" />
              </svg>
            )}
          </button>

          {/* 3. Captions (CC) Toggle */}
          <button
            onClick={onToggleCaptions}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
              isCaptionsOn
                ? "bg-[#8ab4f8] text-[#202124] shadow-md font-bold"
                : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
            }`}
            title={isCaptionsOn ? "Turn off captions" : "Turn on captions"}
          >
            <span className="text-xs font-bold tracking-tight">CC</span>
          </button>

          {/* 4. Raise Hand Toggle */}
          <button
            onClick={onToggleHand}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
              isHandRaised
                ? "bg-[#fbbc04] hover:bg-[#f9ab00] text-[#202124] shadow-md ring-2 ring-[#fbbc04]/40"
                : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
            }`}
            title={isHandRaised ? "Lower hand" : "Raise hand"}
          >
            <span className="text-lg">✋</span>
          </button>

          {/* 5. Present Now / Screen Share */}
          <button
            id="room-share-btn"
            onClick={toggleScreenShare}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
              isSharing
                ? "bg-[#8ab4f8] text-[#202124] shadow-md"
                : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
            }`}
            title={isSharing ? "Stop presenting" : "Present now"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
          </button>

          {/* 6. More Options Menu (⋮) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                showMoreMenu
                  ? "bg-[#474a4d] text-white"
                  : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
              }`}
              title="More options"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
            </button>

            {/* Google Meet Popover Menu */}
            {showMoreMenu && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 bg-[#28292c] rounded-2xl border border-[#3c4043]/60 shadow-2xl p-1.5 text-xs text-[#e8eaed] animate-slide-up z-40">
                <button
                  onClick={toggleFullScreen}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#3c4043] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25h-4.5m4.5 0v-4.5m0 4.5L15 15m5.25-11.25h-4.5m4.5 0v4.5m0-4.5L15 9" />
                  </svg>
                  <span>Toggle Full Screen</span>
                </button>

                {onToggleEnhancement && (
                  <button
                    onClick={() => {
                      onToggleEnhancement();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#3c4043] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">✨</span>
                      <span>Video Lighting (Auto)</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isEnhancementEnabled
                          ? "bg-[#8ab4f8]/20 text-[#8ab4f8]"
                          : "bg-[#5f6368]/20 text-[#9aa0a6]"
                      }`}
                    >
                      {isEnhancementEnabled ? "On" : "Off"}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenSettings?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#3c4043] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  <span>Audio & Video Settings</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. Leave / End Call Signature Google Red Pill */}
          <button
            id="leave-meeting-btn"
            onClick={() => {
              if (role === "host") {
                setShowEndModal(true);
              } else {
                handleLeave();
              }
            }}
            disabled={isLeaving}
            className="w-14 sm:w-16 h-11 sm:h-12 rounded-full bg-[#ea4335] hover:bg-[#d93025] flex items-center justify-center text-white transition-all shadow-md active:scale-95 disabled:opacity-60"
            title={role === "host" ? "Leave or End Call" : "Leave call"}
          >
            {isLeaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              /* Phone Hang Up Glyph */
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1 0-1.41C3.28 8.84 7.42 7 12 7s8.72 1.84 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            )}
          </button>
        </div>

        {/* ── ZONE 3 (Right): Side Drawer Action Buttons ── */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-[200px] justify-end">
          {/* Details (ⓘ) */}
          <button
            onClick={() => onToggleDrawer("details")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeDrawerTab === "details"
                ? "bg-[#8ab4f8]/20 text-[#8ab4f8]"
                : "text-[#bdc1c6] hover:text-white hover:bg-[#3c4043]"
            }`}
            title="Meeting details"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </button>

          {/* People (👥) with badge */}
          <button
            id="room-participants-btn"
            onClick={() => onToggleDrawer("people")}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeDrawerTab === "people"
                ? "bg-[#8ab4f8]/20 text-[#8ab4f8]"
                : "text-[#bdc1c6] hover:text-white hover:bg-[#3c4043]"
            }`}
            title="People"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span className="absolute -top-1 -right-1 text-[10px] font-semibold bg-[#3c4043] text-[#e8eaed] rounded-full px-1.5 py-0.2 border border-[#202124]">
              {participantCount}
            </span>
          </button>

          {/* Chat (💬) */}
          <button
            onClick={() => onToggleDrawer("chat")}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeDrawerTab === "chat"
                ? "bg-[#8ab4f8]/20 text-[#8ab4f8]"
                : "text-[#bdc1c6] hover:text-white hover:bg-[#3c4043]"
            }`}
            title="Chat with everyone"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.502 49.177 49.177 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            {unreadChatCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8ab4f8]" />
            )}
          </button>

          {/* Activities (▲●■) */}
          <button
            onClick={() => onToggleDrawer("details")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#bdc1c6] hover:text-white hover:bg-[#3c4043] transition-all hidden sm:flex"
            title="Activities"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              {/* Triangle */}
              <polygon points="12,2 17,11 7,11" />
              {/* Circle */}
              <circle cx="6" cy="18" r="4" />
              {/* Square */}
              <rect x="14" y="14" width="8" height="8" rx="1.5" />
            </svg>
          </button>

          {/* Host Controls (🛡️) */}
          {role === "host" && (
            <button
              onClick={() => onToggleDrawer("host")}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeDrawerTab === "host"
                  ? "bg-[#8ab4f8]/20 text-[#8ab4f8]"
                  : "text-[#bdc1c6] hover:text-white hover:bg-[#3c4043]"
              }`}
              title="Host controls"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </button>
          )}
        </div>
      </footer>

      {/* Google Meet Host Leave / End Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEndModal(false)}
          />
          <div className="relative bg-[#202124] rounded-2xl p-6 max-w-sm w-full border border-[#3c4043]/60 shadow-2xl animate-slide-up">
            <h3 className="text-white font-medium text-lg mb-2">Leave call?</h3>
            <p className="text-[#9aa0a6] text-xs leading-relaxed mb-6">
              You are the host of this call. Do you want to end the call for everyone or just leave?
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleEndForAll}
                className="w-full py-2.5 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white font-medium text-xs transition-colors"
              >
                End the call for everyone
              </button>
              <button
                onClick={handleLeave}
                className="w-full py-2.5 rounded-full bg-[#3c4043] hover:bg-[#474a4d] text-[#e8eaed] font-medium text-xs transition-colors"
              >
                Just leave the call
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="w-full py-2 rounded-full text-[#9aa0a6] hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
