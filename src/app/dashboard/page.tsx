"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { createMeeting, getMyMeetings, scheduleCalendarMeeting } from "@/lib/api";
import { Meeting } from "@/types";

// ── Google Meet Status Badge ──────────────────────────────────────────────────

function MeetingStatusBadge({ status }: { status: string }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#137333]/20 text-[#81c995] border border-[#137333]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#81c995] animate-pulse" />
        Live
      </span>
    );
  }
  if (status === "created") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#1a73e8]/20 text-[#8ab4f8] border border-[#1a73e8]/30">
        Scheduled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#3c4043]/40 text-[#9aa0a6] border border-[#3c4043]">
      Ended
    </span>
  );
}

// ── Google Meet "Here's your joining info" Modal ───────────────────────────────

function JoiningInfoModal({
  isOpen,
  meeting,
  onClose,
  onShowToast,
}: {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !meeting) return null;

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/meeting/${meeting.meeting_id}`
    : meeting.join_url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      onShowToast("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#2d2e30] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-white">Here&apos;s your joining info</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#3c4043] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-[#9aa0a6] text-sm mb-6 leading-relaxed">
          Send this to people you want to meet with. Be sure to save it so you can use it later, too.
        </p>

        {/* Link box with one-click copy */}
        <div className="flex items-center justify-between bg-[#202124] border border-[#3c4043] rounded-xl px-4 py-3 mb-6">
          <span className="text-[#e8eaed] text-sm font-mono truncate mr-2 select-all">
            {joinUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy meeting link"
            className="p-1.5 rounded-lg text-[#8ab4f8] hover:text-[#aecbfa] hover:bg-[#3c4043] transition-colors flex-shrink-0"
          >
            {copied ? (
              <svg className="w-5 h-5 text-[#81c995]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            )}
          </button>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-[#9aa0a6] hover:text-white hover:bg-[#3c4043] transition-colors"
          >
            Close
          </button>
          <a
            href={`/meeting/${meeting.meeting_id}`}
            className="px-6 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium transition-colors"
          >
            Join now
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Google Meet Settings Modal ────────────────────────────────────────────────

function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"audio" | "video" | "general">("audio");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen || activeTab !== "video") {
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      return;
    }
    let active = true;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((s) => {
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {});
    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isOpen, activeTab]); // eslint-disable-line

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#2d2e30] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between pb-4 border-b border-[#3c4043] mb-6">
          <h2 className="text-xl font-medium text-white">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#3c4043] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#3c4043] mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "audio"
                ? "border-[#8ab4f8] text-[#8ab4f8]"
                : "border-transparent text-[#9aa0a6] hover:text-white"
            }`}
          >
            Audio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "video"
                ? "border-[#8ab4f8] text-[#8ab4f8]"
                : "border-transparent text-[#9aa0a6] hover:text-white"
            }`}
          >
            Video
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-[#8ab4f8] text-[#8ab4f8]"
                : "border-transparent text-[#9aa0a6] hover:text-white"
            }`}
          >
            General & Legal
          </button>
        </div>

        {activeTab === "audio" && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9aa0a6] font-medium mb-2">Microphone</label>
              <div className="p-3 bg-[#202124] border border-[#3c4043] rounded-xl flex items-center justify-between">
                <span className="text-sm text-[#e8eaed]">Default - System Microphone</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#81c995] animate-pulse" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9aa0a6] font-medium mb-2">Speakers</label>
              <div className="p-3 bg-[#202124] border border-[#3c4043] rounded-xl flex items-center justify-between">
                <span className="text-sm text-[#e8eaed]">Default - System Audio</span>
                <span className="text-xs text-[#8ab4f8] font-medium cursor-pointer hover:underline">Test</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "video" && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-[#202124] border border-[#3c4043] rounded-2xl overflow-hidden flex items-center justify-center">
              {stream ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <p className="text-[#9aa0a6] text-sm">Camera preview loading…</p>
              )}
            </div>
            <p className="text-xs text-[#9aa0a6] text-center">Camera: High Definition (720p)</p>
          </div>
        )}

        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6]">Legal & Compliance</span>
              <div className="grid grid-cols-1 gap-2.5">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#202124] hover:bg-[#303134] border border-[#3c4043] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/10 text-[#8ab4f8] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white group-hover:text-[#8ab4f8] transition-colors flex items-center gap-1.5">
                        Privacy Policy
                        <svg className="w-3.5 h-3.5 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </span>
                      <p className="text-xs text-[#9aa0a6]">Google Cloud OAuth 2.0 user data disclosure</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#8ab4f8]">&rarr;</span>
                </a>

                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#202124] hover:bg-[#303134] border border-[#3c4043] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8ab4f8]/10 text-[#8ab4f8] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white group-hover:text-[#8ab4f8] transition-colors flex items-center gap-1.5">
                        Terms of Service
                        <svg className="w-3.5 h-3.5 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </span>
                      <p className="text-xs text-[#9aa0a6]">Terms of use & community guidelines</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#8ab4f8]">&rarr;</span>
                </a>
              </div>
            </div>

            <div className="p-3 bg-[#202124] border border-[#3c4043] rounded-xl text-xs space-y-1">
              <span className="text-[#9aa0a6] block text-[10px] uppercase font-semibold">Contact & Support</span>
              <p className="text-white">Email: <a href="mailto:abdurahimanoffc@gmail.com" className="text-[#8ab4f8] hover:underline font-mono">abdurahimanoffc@gmail.com</a></p>
              <p className="text-white">Phone: <a href="tel:+919544499352" className="text-[#8ab4f8] hover:underline font-mono">+91 9544499352</a></p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#3c4043] flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#9aa0a6]">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8ab4f8] hover:text-[#aecbfa] hover:underline"
            >
              Privacy Policy
            </a>
            <span className="text-[#5f6368]">&bull;</span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8ab4f8] hover:text-[#aecbfa] hover:underline"
            >
              Terms of Service
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Google Meet Main Dashboard Page ──────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);

  // New Meeting Dropdown & Modal states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [laterMeetingModal, setLaterMeetingModal] = useState<Meeting | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);
  const [isSchedulingCalendar, setIsSchedulingCalendar] = useState(false);

  // Code or Link Input
  const [codeOrLink, setCodeOrLink] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Fetch recent meetings
  const loadMeetings = useCallback(async () => {
    try {
      const list = await getMyMeetings();
      setMeetings(list);
    } catch {
      // User may not have meetings yet
    } finally {
      setIsLoadingMeetings(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // 1. Create a meeting for later
  const handleCreateForLater = async () => {
    setIsDropdownOpen(false);
    try {
      const meeting = await createMeeting("Meeting for later");
      setMeetings((prev) => [meeting, ...prev]);
      setLaterMeetingModal(meeting);
    } catch (err: any) {
      console.error("Failed to create meeting for later:", err);
      const detail = err?.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Failed to create meeting for later");
    }
  };

  // 2. Start an instant meeting
  const handleStartInstant = async () => {
    setIsDropdownOpen(false);
    setIsCreatingInstant(true);
    try {
      const meeting = await createMeeting("Instant Meeting");
      setMeetings((prev) => [meeting, ...prev]);
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err: any) {
      console.error("Failed to start instant meeting:", err);
      const detail = err?.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Failed to start instant meeting");
      setIsCreatingInstant(false);
    }
  };

  // 3. Schedule in Google Calendar
  const handleScheduleInCalendar = async () => {
    setIsDropdownOpen(false);
    setIsSchedulingCalendar(true);
    try {
      const res = await scheduleCalendarMeeting("Google Meet Video Meeting");
      setMeetings((prev) => [res.meeting, ...prev]);

      // Open Google Calendar template in new tab
      if (res.calendar_template_url) {
        window.open(res.calendar_template_url, "_blank");
      }
      showToast(
        res.created_in_google_calendar
          ? "Event created & opened in Google Calendar!"
          : "Opened Google Calendar with meeting link!"
      );
    } catch (err: any) {
      console.warn("Schedule calendar API failed, falling back to local link generation:", err);
      // Fallback: create plain meeting and open calendar URL directly
      try {
        const fallbackMeeting = await createMeeting("Google Meet Video Meeting");
        setMeetings((prev) => [fallbackMeeting, ...prev]);
        const joinUrl = `${window.location.origin}/meeting/${fallbackMeeting.meeting_id}`;
        const title = encodeURIComponent("Meet Video Meeting");
        const details = encodeURIComponent(`Join with Google Meet:\n${joinUrl}\n\nMeeting ID: ${fallbackMeeting.meeting_id}`);
        const loc = encodeURIComponent(joinUrl);
        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}`;
        window.open(calUrl, "_blank");
        showToast("Opened Google Calendar with meeting link!");
      } catch (innerErr: any) {
        console.error("Fallback meeting creation failed:", innerErr);
        const detail = innerErr?.response?.data?.detail;
        showToast(typeof detail === "string" ? detail : "Failed to schedule in Google Calendar");
      }
    } finally {
      setIsSchedulingCalendar(false);
    }
  };

  // Join via code or link
  const handleJoin = () => {
    const trimmed = codeOrLink.trim();
    if (!trimmed) return;
    const parts = trimmed.split("/");
    const meetingId = parts[parts.length - 1];
    router.push(`/meeting/${meetingId}`);
  };

  // Carousel content data
  const carouselSlides = [
    {
      title: "Get a link you can share",
      description: "Click New meeting to get a link you can send to people you want to meet with",
      icon: (
        <svg className="w-20 h-20 text-[#8ab4f8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      ),
    },
    {
      title: "Plan ahead",
      description: "Click New meeting to schedule meetings in Google Calendar and send invites to attendees",
      icon: (
        <svg className="w-20 h-20 text-[#81c995]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
      ),
    },
    {
      title: "Your meeting is safe",
      description: "No one can join a meeting unless invited or admitted by the host",
      icon: (
        <svg className="w-20 h-20 text-[#f28b82]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col font-sans select-none">
        {/* Header */}
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-16 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16">
            {/* Left Hero Section: Headline, New Meeting, Join Code */}
            <div className="lg:col-span-7 max-w-xl">
              <h1 className="text-4xl sm:text-[44px] font-normal text-white tracking-tight leading-[1.15]">
                Video calls and meetings for everyone
              </h1>
              <p className="text-lg sm:text-[19px] text-[#9aa0a6] mt-4 mb-8 font-normal leading-relaxed">
                Connect, collaborate, and celebrate from anywhere with Google Meet
              </p>

              {/* Action Row */}
              <div className="flex flex-wrap items-center gap-4">
                {/* "New meeting" Button with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    id="new-meeting-dropdown-btn"
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isCreatingInstant || isSchedulingCalendar}
                    className="h-12 px-6 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.98] text-white font-medium text-sm transition-all flex items-center gap-2.5 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isCreatingInstant || isSchedulingCalendar ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    )}
                    <span>New meeting</span>
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Dropdown Menu (Exactly like Google Meet) */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-[#2d2e30] border border-[#3c4043] rounded-2xl py-2 shadow-2xl z-50 animate-slide-up">
                      {/* Option 1: Create a meeting for later */}
                      <button
                        type="button"
                        id="create-for-later-btn"
                        onClick={handleCreateForLater}
                        className="w-full px-4 py-3 flex items-center gap-3.5 text-left text-sm text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[#9aa0a6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                        </svg>
                        <span>Create a meeting for later</span>
                      </button>

                      {/* Option 2: Start an instant meeting */}
                      <button
                        type="button"
                        id="start-instant-btn"
                        onClick={handleStartInstant}
                        className="w-full px-4 py-3 flex items-center gap-3.5 text-left text-sm text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[#9aa0a6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Start an instant meeting</span>
                      </button>

                      {/* Option 3: Schedule in Google Calendar */}
                      <button
                        type="button"
                        id="schedule-calendar-btn"
                        onClick={handleScheduleInCalendar}
                        className="w-full px-4 py-3 flex items-center gap-3.5 text-left text-sm text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[#9aa0a6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                        <span>Schedule in Google Calendar</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* "Enter a code or link" Box + Join button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#9aa0a6] pointer-events-none">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6ZM6.75 9h1.5m3 0h1.5m3 0h1.5M6.75 12h1.5m3 0h1.5m3 0h1.5m-10.5 3h10.5" />
                      </svg>
                    </span>
                    <input
                      id="join-code-input"
                      type="text"
                      value={codeOrLink}
                      onChange={(e) => setCodeOrLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      placeholder="Enter a code or link"
                      className="h-12 w-56 sm:w-64 pl-11 pr-4 bg-transparent border border-[#5f6368] focus:border-[#8ab4f8] focus:border-2 text-white placeholder-[#9aa0a6] rounded-md text-sm transition-all focus:outline-none"
                    />
                  </div>

                  <button
                    id="join-btn"
                    type="button"
                    onClick={handleJoin}
                    disabled={!codeOrLink.trim()}
                    className={`h-12 px-4 rounded-full text-sm font-medium transition-all ${
                      codeOrLink.trim()
                        ? "text-[#8ab4f8] hover:bg-[#8ab4f8]/10 cursor-pointer"
                        : "text-[#5f6368] cursor-default opacity-70"
                    }`}
                  >
                    Join
                  </button>
                </div>
              </div>

              {/* Divider & Learn More link */}
              <div className="border-t border-[#3c4043] my-8" />
              <p className="text-xs text-[#9aa0a6]">
                <a
                  href="https://support.google.com/meet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8ab4f8] hover:underline font-normal inline-flex items-center gap-1"
                >
                  Learn more
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>{" "}
                about Google Meet
              </p>
            </div>

            {/* Right Hero Section: Google Meet Carousel */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#2d2e30] border border-[#3c4043] flex flex-col items-center justify-center p-6 text-center relative shadow-lg">
                {/* Carousel Illustration */}
                <div className="mb-4 animate-fade-in">
                  {carouselSlides[currentSlide].icon}
                </div>

                <h3 className="text-lg font-medium text-white mb-2 leading-tight">
                  {carouselSlides[currentSlide].title}
                </h3>
                <p className="text-xs text-[#9aa0a6] leading-relaxed max-w-[220px]">
                  {carouselSlides[currentSlide].description}
                </p>

                {/* Left/Right Carousel Controls */}
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
                  className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#3c4043] hover:bg-[#4a4d52] text-white flex items-center justify-center shadow-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                  className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#3c4043] hover:bg-[#4a4d52] text-white flex items-center justify-center shadow-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center gap-2 mt-5">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx ? "w-6 bg-[#8ab4f8]" : "w-2 bg-[#5f6368] hover:bg-[#9aa0a6]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* "Your meetings" Section */}
          <div className="mt-8 pt-8 border-t border-[#3c4043]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white">Your meetings</h2>
              {meetings.length > 0 && (
                <span className="text-xs text-[#9aa0a6] bg-[#2d2e30] border border-[#3c4043] px-3 py-1 rounded-full">
                  {meetings.length} meeting{meetings.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {isLoadingMeetings ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : meetings.length === 0 ? (
              <div className="bg-[#2d2e30] border border-[#3c4043] rounded-2xl py-12 text-center">
                <p className="text-[#9aa0a6] text-sm">No scheduled or past meetings yet</p>
                <p className="text-xs text-[#5f6368] mt-1">Click &quot;New meeting&quot; above to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map((m) => (
                  <div
                    key={m.id || m.meeting_id}
                    className="bg-[#2d2e30] hover:bg-[#303134] border border-[#3c4043] rounded-2xl p-5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-white text-base truncate">{m.title}</h3>
                        <MeetingStatusBadge status={m.status} />
                      </div>
                      <p className="font-mono text-xs text-[#8ab4f8] tracking-wider mb-2">
                        {m.meeting_id}
                      </p>
                      <p className="text-xs text-[#9aa0a6]">
                        {new Date(m.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#3c4043] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/meeting/${m.meeting_id}`;
                          navigator.clipboard.writeText(url);
                          showToast("Link copied to clipboard");
                        }}
                        className="text-xs text-[#9aa0a6] hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                        Copy link
                      </button>

                      {m.status !== "ended" && (
                        <a
                          href={`/meeting/${m.meeting_id}`}
                          className="px-4 py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium transition-colors"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Minimal Dashboard Footer */}
          <footer className="mt-16 pt-6 border-t border-[#3c4043]/50 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9aa0a6] gap-4 select-none">
            <div className="flex items-center gap-2">
              <span className="text-[#e8eaed] font-medium">Google Meet</span>
              <span className="text-[#5f6368]">&bull;</span>
              <span>Abdurahiman</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a
                href="mailto:abdurahimanoffc@gmail.com"
                className="hover:text-white transition-colors"
              >
                abdurahimanoffc@gmail.com
              </a>
              <a
                href="tel:+919544499352"
                className="hover:text-white transition-colors"
              >
                9544499352
              </a>
            </div>
          </footer>
        </main>

        {/* Modal 1: "Here's your joining info" (For "Create a meeting for later") */}
        <JoiningInfoModal
          isOpen={Boolean(laterMeetingModal)}
          meeting={laterMeetingModal}
          onClose={() => setLaterMeetingModal(null)}
          onShowToast={showToast}
        />

        {/* Modal 2: Settings (Camera/Microphone) */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Toast Notification (Snappy feedback at bottom-left) */}
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 bg-[#303134] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl border border-[#3c4043] flex items-center gap-3 animate-slide-up">
            <svg className="w-4 h-4 text-[#81c995]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
