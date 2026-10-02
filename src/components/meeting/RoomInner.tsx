"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useLocalParticipant,
  useRemoteParticipants,
  useChat,
} from "@livekit/components-react";

import { AudioRenderer } from "./AudioRenderer";
import { ConnectionStatusOverlay } from "./ConnectionStatusOverlay";
import { TopBar } from "./TopBar";
import { VideoGrid } from "./VideoGrid";
import { ControlBar } from "./ControlBar";
import { SideDrawer, DrawerTab } from "./SideDrawer";
import { CaptionsBar } from "./CaptionsBar";
import { SettingsModal } from "./SettingsModal";
import { useVideoEnhancement } from "@/hooks/useVideoEnhancement";

interface RoomInnerProps {
  meetingId: string;
  role: "host" | "attendee";
  sessionId: string;
}

/**
 * Master Google Meet Room Orchestrator:
 * - Coordinates TopBar, dynamic VideoGrid (spotlight/pin & presentation), docked SideDrawer,
 *   3-Zone ControlBar, Live Captions, and Audio/Video Settings Modal.
 * - Handles keyboard shortcuts (Ctrl+D for Mic, Ctrl+E for Camera).
 * - Client-side automatic video quality enhancement (WebGL GPU shader).
 */
export function RoomInner({ meetingId, role, sessionId }: RoomInnerProps) {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const { chatMessages } = useChat();

  // Automatic client-side video enhancement (WebGL GPU shader pipeline)
  const videoEnhancement = useVideoEnhancement();

  // Layout & UI state
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);

  // Participant count (local + remotes)
  const totalParticipantCount = 1 + remoteParticipants.length;

  // Track unread chat messages
  useEffect(() => {
    if (activeDrawerTab === "chat") {
      setLastReadMessageCount(chatMessages.length);
    }
  }, [activeDrawerTab, chatMessages.length]);

  const unreadCount =
    activeDrawerTab === "chat" ? 0 : Math.max(0, chatMessages.length - lastReadMessageCount);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  // Hand raise toggle
  const toggleHandRaised = () => {
    if (!localParticipant) return;
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);

    setRaisedHands((prev) => {
      const next = new Set(prev);
      if (nextState) {
        next.add(localParticipant.identity);
        showToast("You raised your hand");
      } else {
        next.delete(localParticipant.identity);
        showToast("You lowered your hand");
      }
      return next;
    });
  };

  // Keyboard shortcuts (Ctrl+D for mic, Ctrl+E for camera, C for captions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        localParticipant?.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
        showToast(
          localParticipant?.isMicrophoneEnabled
            ? "Microphone turned off"
            : "Microphone turned on"
        );
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        localParticipant?.setCameraEnabled(!localParticipant.isCameraEnabled);
        showToast(
          localParticipant?.isCameraEnabled
            ? "Camera turned off"
            : "Camera turned on"
        );
      } else if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsCaptionsOn((prev) => {
          showToast(!prev ? "Captions turned on" : "Captions turned off");
          return !prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [localParticipant, showToast]);

  return (
    <div className="flex flex-col h-screen bg-[#202124] text-[#e8eaed] overflow-hidden relative font-sans select-none">
      {/* 1. Remote Audio Playback */}
      <AudioRenderer />

      {/* 2. Reconnection / Network Overlay */}
      <ConnectionStatusOverlay />

      {/* 3. Google Meet Top Bar */}
      <TopBar
        meetingId={meetingId}
        role={role}
        isSharingScreen={localParticipant?.isScreenShareEnabled}
        onStopScreenShare={() => localParticipant?.setScreenShareEnabled(false)}
      />

      {/* 4. Main Stage (Video Grid + Docked Right Drawer) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Center Stage Video Grid */}
        <VideoGrid
          role={role}
          pinnedId={pinnedId}
          onTogglePin={(id) => setPinnedId((prev) => (prev === id ? null : id))}
          raisedHands={raisedHands}
          onStopPresentation={() => localParticipant?.setScreenShareEnabled(false)}
          isEnhanced={videoEnhancement.isEnabled && !videoEnhancement.fallbackReason}
        />

        {/* Live Captions Subtitle Overlay */}
        <CaptionsBar
          isOpen={isCaptionsOn}
          onClose={() => setIsCaptionsOn(false)}
        />

        {/* Google Meet Docked Multi-Tab Right Drawer */}
        {activeDrawerTab && (
          <SideDrawer
            meetingId={meetingId}
            role={role}
            activeTab={activeDrawerTab}
            onTabChange={setActiveDrawerTab}
            onClose={() => setActiveDrawerTab(null)}
            currentUserId={localParticipant?.identity}
            currentUserName={localParticipant?.name}
            onTogglePin={(id) => setPinnedId((prev) => (prev === id ? null : id))}
            pinnedId={pinnedId}
          />
        )}
      </div>

      {/* 5. Google Meet 3-Zone Bottom Control Bar */}
      <ControlBar
        meetingId={meetingId}
        role={role}
        sessionId={sessionId}
        activeDrawerTab={activeDrawerTab}
        onToggleDrawer={(tab) =>
          setActiveDrawerTab((prev) => (prev === tab ? null : tab))
        }
        participantCount={totalParticipantCount}
        unreadChatCount={unreadCount}
        isHandRaised={isHandRaised}
        onToggleHand={toggleHandRaised}
        isCaptionsOn={isCaptionsOn}
        onToggleCaptions={() => setIsCaptionsOn((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isEnhancementEnabled={videoEnhancement.isEnabled}
        onToggleEnhancement={() => videoEnhancement.toggleEnhancement()}
      />

      {/* 6. Audio / Video Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        enhancement={videoEnhancement}
      />

      {/* 7. Floating Google Meet Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-6 z-50 bg-[#28292c] border border-[#3c4043] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#8ab4f8]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
