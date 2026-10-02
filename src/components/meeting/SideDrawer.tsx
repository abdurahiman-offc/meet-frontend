"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useChat } from "@livekit/components-react";
import { listParticipants, removeParticipant } from "@/lib/api";
import { ParticipantInfo } from "@/types";

export type DrawerTab = "people" | "chat" | "details" | "host";

interface SideDrawerProps {
  meetingId: string;
  role: "host" | "attendee";
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
  onTogglePin?: (identity: string) => void;
  pinnedId?: string | null;
}

/**
 * Google Meet multi-tab docked side drawer:
 * - People tab: Search, add people, host mute all, participant listing with mic & kick controls
 * - In-call messages tab: Real-time chat powered by LiveKit's useChat
 * - Meeting details tab: Shareable joining info with copy action
 * - Host controls tab: Meeting safety and interaction permissions
 */
export function SideDrawer({
  meetingId,
  role,
  activeTab,
  onTabChange,
  onClose,
  currentUserId,
  currentUserName = "You",
  onTogglePin,
  pinnedId,
}: SideDrawerProps) {
  // ── People state ──
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // ── Chat state (LiveKit useChat) ──
  const { chatMessages, send, isSending } = useChat();
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Host permissions mock state ──
  const [canShareScreen, setCanShareScreen] = useState(true);
  const [canSendChat, setCanSendChat] = useState(true);
  const [canTurnOnMic, setCanTurnOnMic] = useState(true);
  const [canTurnOnVideo, setCanTurnOnVideo] = useState(true);

  // Fetch participant directory
  useEffect(() => {
    let mounted = true;
    const fetchParticipants = async () => {
      try {
        const list = await listParticipants(meetingId);
        if (mounted) setParticipants(list);
      } catch {
        // silent fallback
      } finally {
        if (mounted) setIsLoadingPeople(false);
      }
    };

    fetchParticipants();
    const timer = setInterval(fetchParticipants, 4000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [meetingId]);

  // Auto-scroll chat on new messages
  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || isSending) return;
    try {
      await send(text);
      setChatInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await removeParticipant(meetingId, userId);
      setParticipants((prev) => prev.filter((p) => p.user_id !== userId));
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 sm:w-96 bg-[#28292c] rounded-2xl my-2 mr-2 sm:my-3 sm:mr-3 border border-[#3c4043]/50 flex flex-col overflow-hidden shadow-2xl z-30 select-none animate-slide-up">
      {/* 1. Header with Tab Switcher & Close button */}
      <div className="p-3 border-b border-[#3c4043]/40 bg-[#28292c]">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-[#e8eaed] font-medium text-base">
            {activeTab === "people"
              ? "People"
              : activeTab === "chat"
              ? "In-call messages"
              : activeTab === "details"
              ? "Meeting details"
              : "Host controls"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#3c4043] flex items-center justify-center text-[#9aa0a6] hover:text-white transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#202124]/60 p-1 rounded-xl">
          <button
            onClick={() => onTabChange("people")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "people"
                ? "bg-[#3c4043] text-white shadow-sm"
                : "text-[#9aa0a6] hover:text-[#e8eaed]"
            }`}
          >
            <span>People</span>
            <span className="text-[11px] bg-white/10 px-1.5 py-0.2 rounded-full">
              {participants.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange("chat")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-[#3c4043] text-white shadow-sm"
                : "text-[#9aa0a6] hover:text-[#e8eaed]"
            }`}
          >
            <span>Chat</span>
            {chatMessages.length > 0 && (
              <span className="text-[11px] bg-[#8ab4f8] text-[#202124] font-semibold px-1.5 rounded-full">
                {chatMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("details")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === "details"
                ? "bg-[#3c4043] text-white shadow-sm"
                : "text-[#9aa0a6] hover:text-[#e8eaed]"
            }`}
          >
            Details
          </button>

          {role === "host" && (
            <button
              onClick={() => onTabChange("host")}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === "host"
                  ? "bg-[#3c4043] text-white shadow-sm"
                  : "text-[#9aa0a6] hover:text-[#e8eaed]"
              }`}
            >
              Host
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB: PEOPLE */}
      {activeTab === "people" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick Actions Bar */}
          <div className="p-3 space-y-2 border-b border-[#3c4043]/30">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#8ab4f8]/10 hover:bg-[#8ab4f8]/20 border border-[#8ab4f8]/30 text-[#8ab4f8] text-xs font-semibold transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              <span>{copiedLink ? "Joining link copied!" : "Add people / Share link"}</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for people"
                className="w-full bg-[#202124] border border-[#3c4043]/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Participant list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-[11px] font-semibold text-[#9aa0a6] uppercase tracking-wider px-2 py-1">
              In call ({filteredParticipants.length})
            </div>

            {isLoadingPeople ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredParticipants.length === 0 ? (
              <p className="text-[#9aa0a6] text-xs text-center py-8">
                No matching participants
              </p>
            ) : (
              filteredParticipants.map((p) => {
                const isUserHost = p.role === "host";
                const isMe = p.user_id === currentUserId;

                return (
                  <div
                    key={p.user_id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#35363a] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.picture ? (
                        <Image
                          src={p.picture}
                          alt={p.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {p.name[0]?.toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">
                          {p.name}
                          {isMe && " (You)"}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {isUserHost && (
                            <span className="text-[10px] text-[#fbbc04] font-medium">
                              Meeting host
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Pin & Host Kick */}
                    <div className="flex items-center gap-1">
                      {onTogglePin && (
                        <button
                          onClick={() => onTogglePin(p.livekit_identity || p.user_id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            pinnedId === (p.livekit_identity || p.user_id)
                              ? "text-[#8ab4f8]"
                              : "text-[#9aa0a6] hover:text-white opacity-0 group-hover:opacity-100"
                          }`}
                          title="Pin to screen"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25 1.5 1.5.75-.75V8.25L13.5 4.5H9.75v3.75l-.75.75 1.5 1.5m3 0v6.75m-3-6.75L6 15.75m4.5-4.5 4.5 4.5" />
                          </svg>
                        </button>
                      )}

                      {role === "host" && !isMe && (
                        <button
                          onClick={() => handleRemove(p.user_id)}
                          disabled={removingId === p.user_id}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#f28b82] hover:bg-[#ea4335]/15 transition-all text-xs"
                          title="Remove from call"
                        >
                          {removingId === p.user_id ? "…" : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. TAB: IN-CALL MESSAGES (CHAT) */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Google Meet official disclaimer */}
          <div className="p-3 bg-[#202124]/50 border-b border-[#3c4043]/30 text-[11px] text-[#9aa0a6] leading-relaxed">
            Messages can only be seen by people in the call and are deleted when the call ends.
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#9aa0a6]">
                <div className="w-12 h-12 rounded-full bg-[#3c4043]/40 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-[#bdc1c6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.502 49.177 49.177 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-[#bdc1c6]">No messages yet</p>
                <p className="text-[11px] text-[#9aa0a6] mt-1">Send a message to everyone in the call</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => {
                const isMe = msg.from?.identity === currentUserId;
                const time = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[11px] text-[#9aa0a6]">
                      <span className="font-semibold text-white">
                        {isMe ? "You" : msg.from?.name || "Participant"}
                      </span>
                      <span>{time}</span>
                    </div>
                    <div className="bg-[#35363a] text-[#e8eaed] text-xs p-2.5 rounded-2xl rounded-tl-sm max-w-[90%] break-words">
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-[#3c4043]/40 bg-[#28292c] flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send a message to everyone"
              disabled={!canSendChat && role !== "host"}
              className="flex-1 bg-[#202124] border border-[#3c4043]/50 rounded-full px-4 py-2 text-xs text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isSending || (!canSendChat && role !== "host")}
              className="w-8 h-8 rounded-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#8ab4f8]"
            >
              <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* 4. TAB: MEETING DETAILS */}
      {activeTab === "details" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[#e8eaed]">
          <div>
            <h4 className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider mb-2">
              Joining info
            </h4>
            <div className="p-3 bg-[#202124] rounded-xl border border-[#3c4043]/40 space-y-2">
              <p className="text-white text-xs break-all font-mono">
                {`${window.location.origin}/meeting/${meetingId}`}
              </p>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-[#8ab4f8] hover:text-[#aecbfa] font-medium text-xs transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                <span>{copiedLink ? "Link copied to clipboard!" : "Copy joining info"}</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider mb-2">
              Dial-in access
            </h4>
            <div className="p-3 bg-[#202124] rounded-xl border border-[#3c4043]/40 space-y-1.5 text-xs text-[#bdc1c6]">
              <p>
                <span className="text-[#9aa0a6]">Phone: </span>(US) +1 415-555-0199
              </p>
              <p>
                <span className="text-[#9aa0a6]">PIN: </span>
                <span className="font-mono">842 190 231#</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider mb-2">
              Attachments
            </h4>
            <p className="text-[#9aa0a6] text-xs">
              No attachments found for this meeting.
            </p>
          </div>
        </div>
      )}

      {/* 5. TAB: HOST CONTROLS */}
      {activeTab === "host" && role === "host" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[#e8eaed]">
          <div>
            <h3 className="font-semibold text-white text-sm mb-1">Meeting safety</h3>
            <p className="text-[#9aa0a6] text-[11px] leading-relaxed">
              Use these host settings to keep your meeting safe and control what participants can do.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider">
              Let everyone
            </h4>

            {/* Share screen toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202124] border border-[#3c4043]/40">
              <div>
                <p className="font-medium text-white">Share their screen</p>
                <p className="text-[#9aa0a6] text-[11px]">Allow attendees to present</p>
              </div>
              <input
                type="checkbox"
                checked={canShareScreen}
                onChange={(e) => setCanShareScreen(e.target.checked)}
                className="w-4 h-4 accent-[#8ab4f8] cursor-pointer"
              />
            </div>

            {/* Send chat messages toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202124] border border-[#3c4043]/40">
              <div>
                <p className="font-medium text-white">Send chat messages</p>
                <p className="text-[#9aa0a6] text-[11px]">Allow in-call text chat</p>
              </div>
              <input
                type="checkbox"
                checked={canSendChat}
                onChange={(e) => setCanSendChat(e.target.checked)}
                className="w-4 h-4 accent-[#8ab4f8] cursor-pointer"
              />
            </div>

            {/* Turn on microphone */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202124] border border-[#3c4043]/40">
              <div>
                <p className="font-medium text-white">Turn on their microphone</p>
                <p className="text-[#9aa0a6] text-[11px]">Allow participants to unmute</p>
              </div>
              <input
                type="checkbox"
                checked={canTurnOnMic}
                onChange={(e) => setCanTurnOnMic(e.target.checked)}
                className="w-4 h-4 accent-[#8ab4f8] cursor-pointer"
              />
            </div>

            {/* Turn on video */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202124] border border-[#3c4043]/40">
              <div>
                <p className="font-medium text-white">Turn on their video</p>
                <p className="text-[#9aa0a6] text-[11px]">Allow camera feeds</p>
              </div>
              <input
                type="checkbox"
                checked={canTurnOnVideo}
                onChange={(e) => setCanTurnOnVideo(e.target.checked)}
                className="w-4 h-4 accent-[#8ab4f8] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
