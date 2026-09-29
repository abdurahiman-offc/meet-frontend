"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  LiveKitRoom,
  useRoomContext,
  useLocalParticipant,
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
  useConnectionState,
  useIsSpeaking,
  isTrackReference,
} from "@livekit/components-react";
import { Track, ConnectionState, LocalParticipant, Participant, RoomEvent } from "livekit-client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { endMeeting, leaveMeeting, listParticipants, removeParticipant } from "@/lib/api";
import { JoinTokenResponse, ParticipantInfo } from "@/types";

// ── Connection Status Overlay ─────────────────────────────────────────────────

function ConnectionStatusOverlay() {
  const connectionState = useConnectionState();

  if (connectionState === ConnectionState.Connected) return null;

  if (connectionState === ConnectionState.Reconnecting) {
    return (
      <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-white font-semibold text-lg">Reconnecting…</p>
          <p className="text-amber-300 text-sm mt-1">Restoring your connection</p>
        </div>
      </div>
    );
  }

  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-xl mb-1">Connection Lost</p>
          <p className="text-[hsl(215,15%,55%)] text-sm mb-6">Your connection was interrupted</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium text-sm transition-all"
            >
              Rejoin
            </button>
            <a
              href="/dashboard"
              className="px-5 py-2.5 bg-[hsl(220,20%,18%)] hover:bg-[hsl(220,20%,22%)] text-white rounded-xl font-medium text-sm transition-all"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Participant Tile ──────────────────────────────────────────────────────────

function ParticipantTile({
  participant,
  isLocal,
}: {
  participant: Participant | LocalParticipant;
  isLocal: boolean;
}) {
  const isSpeaking = useIsSpeaking(participant);
  const allCameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }]
  );
  const videoTrack = allCameraTracks.find(
    (t) => t.participant.identity === participant.identity && t.source === Track.Source.Camera
  );
  const isCameraOff = !videoTrack?.publication || videoTrack.publication.isMuted;

  const metadata = (() => {
    try { return JSON.parse(participant.metadata || "{}"); } catch { return {}; }
  })();
  const isHost = metadata.role === "host";

  return (
    <div
      className={`relative aspect-video bg-[hsl(220,20%,10%)] rounded-xl overflow-hidden border transition-all ${
        isSpeaking ? "border-green-400/60 shadow-[0_0_16px_rgba(74,222,128,0.15)]" : "border-[hsl(220,15%,18%)]"
      }`}
    >
      {videoTrack?.publication && !videoTrack.publication.isMuted ? (
        <VideoTrack
          trackRef={videoTrack as any}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl font-bold text-brand-300">
            {participant.name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* Name + badge */}
      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 max-w-[70%]">
          <span className="text-white text-xs font-medium truncate">
            {participant.name || "Unknown"}{isLocal ? " (You)" : ""}
          </span>
          {isHost && (
            <span className="text-amber-400 text-xs font-semibold flex-shrink-0">Host</span>
          )}
        </div>
        {isSpeaking && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
        )}
      </div>

      {/* Muted indicator */}
      {participant.isMicrophoneEnabled === false && (
        <div className="absolute top-2 right-2 w-7 h-7 bg-danger/80 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Screen Share View ─────────────────────────────────────────────────────────

function ScreenShareView() {
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const activeScreen = screenTracks[0];
  if (!activeScreen) return null;

  return (
    <div className="relative flex-1 bg-black rounded-xl overflow-hidden border border-[hsl(220,15%,18%)]">
      <VideoTrack trackRef={activeScreen as any} className="w-full h-full object-contain" />
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
        <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
        </svg>
        <span className="text-white text-xs font-medium">
          {activeScreen.participant?.name || "Someone"} is sharing their screen
        </span>
      </div>
    </div>
  );
}

// ── Participant Panel ─────────────────────────────────────────────────────────

function ParticipantPanel({
  meetingId,
  onClose,
}: {
  meetingId: string;
  onClose: () => void;
}) {
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await listParticipants(meetingId);
        setParticipants(list);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [meetingId]);

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await removeParticipant(meetingId, userId);
      setParticipants((prev) => prev.filter((p) => p.user_id !== userId));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="w-72 bg-[hsl(220,20%,10%)] border-l border-[hsl(220,15%,18%)] flex flex-col h-full animate-slide-up">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[hsl(220,15%,18%)]">
        <h3 className="text-white font-semibold text-sm">Participants ({participants.length})</h3>
        <button onClick={onClose} className="text-[hsl(215,15%,50%)] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : participants.length === 0 ? (
          <p className="text-[hsl(215,15%,45%)] text-sm text-center py-8">No participants yet</p>
        ) : (
          participants.map((p) => (
            <div key={p.user_id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[hsl(220,20%,14%)] group transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                {p.picture ? (
                  <Image src={p.picture} alt={p.name} width={32} height={32} className="rounded-full flex-shrink-0" unoptimized />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-300 text-sm font-semibold flex-shrink-0">
                    {p.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[hsl(215,10%,45%)] text-xs capitalize">{p.role}</p>
                </div>
              </div>
              {p.role === "attendee" && (
                <button
                  onClick={() => handleRemove(p.user_id)}
                  disabled={removingId === p.user_id}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  {removingId === p.user_id ? "…" : "Remove"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Control Bar ───────────────────────────────────────────────────────────────

function ControlBar({
  meetingId,
  role,
  sessionId,
  onShowParticipants,
  showParticipants,
}: {
  meetingId: string;
  role: "host" | "attendee";
  sessionId: string;
  onShowParticipants: () => void;
  showParticipants: boolean;
}) {
  const router = useRouter();
  const { localParticipant } = useLocalParticipant();
  const [isSharing, setIsSharing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;

  const toggleMic = async () => {
    await localParticipant?.setMicrophoneEnabled(!isMicEnabled);
  };

  const toggleCamera = async () => {
    await localParticipant?.setCameraEnabled(!isCameraEnabled);
  };

  const toggleScreenShare = async () => {
    if (isSharing) {
      await localParticipant?.setScreenShareEnabled(false);
      setIsSharing(false);
    } else {
      try {
        await localParticipant?.setScreenShareEnabled(true);
        setIsSharing(true);
      } catch (err: any) {
        if (err.name !== "NotAllowedError") {
          console.error("Screen share error:", err);
        }
      }
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveMeeting(meetingId);
    } finally {
      router.replace("/dashboard");
    }
  };

  const handleEndMeeting = async () => {
    try {
      await endMeeting(meetingId);
    } finally {
      router.replace("/dashboard");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-[hsl(220,20%,9%)] border-t border-[hsl(220,15%,16%)]">
        {/* Left: Meeting ID */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[hsl(215,15%,45%)]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
          <span className="font-mono">{meetingId}</span>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-3">
          {/* Mic */}
          <button
            id="room-mic-btn"
            onClick={toggleMic}
            title={isMicEnabled ? "Mute" : "Unmute"}
            className={`flex flex-col items-center gap-1 group`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMicEnabled ? "bg-[hsl(220,20%,18%)] hover:bg-[hsl(220,20%,23%)] text-white" : "bg-danger hover:bg-danger-hover text-white"
            }`}>
              {isMicEnabled ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-[hsl(215,15%,50%)]">{isMicEnabled ? "Mute" : "Unmute"}</span>
          </button>

          {/* Camera */}
          <button
            id="room-cam-btn"
            onClick={toggleCamera}
            title={isCameraEnabled ? "Stop Camera" : "Start Camera"}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isCameraEnabled ? "bg-[hsl(220,20%,18%)] hover:bg-[hsl(220,20%,23%)] text-white" : "bg-danger hover:bg-danger-hover text-white"
            }`}>
              {isCameraEnabled ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25ZM12 9.75h.008v.008H12V9.75Z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-[hsl(215,15%,50%)]">{isCameraEnabled ? "Stop Video" : "Start Video"}</span>
          </button>

          {/* Screen Share */}
          <button
            id="room-share-btn"
            onClick={toggleScreenShare}
            title={isSharing ? "Stop Sharing" : "Share Screen"}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isSharing ? "bg-green-500/20 border border-green-500/40 text-green-400" : "bg-[hsl(220,20%,18%)] hover:bg-[hsl(220,20%,23%)] text-white"
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
              </svg>
            </div>
            <span className="text-xs text-[hsl(215,15%,50%)]">{isSharing ? "Stop Share" : "Share"}</span>
          </button>

          {/* Participants (host only) */}
          {role === "host" && (
            <button
              id="room-participants-btn"
              onClick={onShowParticipants}
              title="Participants"
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                showParticipants ? "bg-brand-500/20 border border-brand-500/40 text-brand-400" : "bg-[hsl(220,20%,18%)] hover:bg-[hsl(220,20%,23%)] text-white"
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <span className="text-xs text-[hsl(215,15%,50%)]">People</span>
            </button>
          )}
        </div>

        {/* Right: Leave / End */}
        <div className="flex items-center gap-2">
          {role === "host" && (
            <button
              id="end-meeting-btn"
              onClick={() => setShowEndConfirm(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-danger/15 hover:bg-danger/25 border border-danger/30 text-red-400 rounded-xl font-medium text-sm transition-all"
            >
              End for all
            </button>
          )}
          <button
            id="leave-meeting-btn"
            onClick={handleLeave}
            disabled={isLeaving}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-danger hover:bg-danger-hover text-white rounded-xl font-medium text-sm transition-all disabled:opacity-60"
          >
            {isLeaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            )}
            Leave
          </button>
        </div>
      </div>

      {/* End meeting confirm */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEndConfirm(false)} />
          <div className="relative glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold text-lg mb-2">End meeting?</h3>
            <p className="text-[hsl(215,15%,55%)] text-sm mb-6">
              This will disconnect all participants and close the meeting.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-[hsl(220,15%,22%)] text-[hsl(215,15%,60%)] hover:text-white transition-all text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleEndMeeting} className="flex-1 py-2.5 rounded-xl bg-danger hover:bg-danger-hover text-white font-medium text-sm transition-all">
                End for All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Video Grid ────────────────────────────────────────────────────────────────

function VideoGrid({ role }: { role: "host" | "attendee" }) {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useParticipants();
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const hasScreenShare = screenTracks.length > 0;

  const otherParticipants = remoteParticipants.filter(
    (p) => p.identity !== localParticipant?.identity
  );

  if (hasScreenShare) {
    return (
      <div className="flex-1 flex gap-3 p-4 overflow-hidden">
        <ScreenShareView />
        <div className="w-48 flex flex-col gap-3 overflow-y-auto">
          {localParticipant && (
            <ParticipantTile participant={localParticipant} isLocal={true} />
          )}
          {otherParticipants.map((p) => (
            <ParticipantTile key={p.identity} participant={p} isLocal={false} />
          ))}
        </div>
      </div>
    );
  }

  const allParticipants = [
    ...(localParticipant ? [{ p: localParticipant, isLocal: true }] : []),
    ...otherParticipants.map((p) => ({ p, isLocal: false })),
  ];

  const count = allParticipants.length;
  const gridCols = count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : count <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={`flex-1 grid ${gridCols} gap-3 p-4 content-center auto-rows-fr overflow-hidden`}>
      {allParticipants.map(({ p, isLocal }) => (
        <ParticipantTile key={p.identity} participant={p} isLocal={isLocal} />
      ))}
    </div>
  );
}

// ── Audio Renderer ────────────────────────────────────────────────────────────

function AudioRenderer() {
  const audioTracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }]);
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

// ── Room Inner (uses LiveKit hooks) ──────────────────────────────────────────

function RoomInner({
  meetingId,
  role,
  sessionId,
}: {
  meetingId: string;
  role: "host" | "attendee";
  sessionId: string;
}) {
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[hsl(220,20%,8%)] relative">
      <AudioRenderer />
      <ConnectionStatusOverlay />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(220,15%,16%)] bg-[hsl(220,20%,9%)]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <span className="text-white font-medium text-sm">Meet</span>
        </div>

        <div className="flex items-center gap-2">
          {role === "host" && (
            <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
              Host
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid role={role} />
        {showParticipants && role === "host" && (
          <ParticipantPanel
            meetingId={meetingId}
            onClose={() => setShowParticipants(false)}
          />
        )}
      </div>

      <ControlBar
        meetingId={meetingId}
        role={role}
        sessionId={sessionId}
        onShowParticipants={() => setShowParticipants((v) => !v)}
        showParticipants={showParticipants}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MeetingRoomPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const router = useRouter();
  const [joinData, setJoinData] = useState<JoinTokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`meeting_token_${meetingId}`);
    if (!raw) {
      // No token: redirect back to pre-join
      router.replace(`/meeting/${meetingId}`);
      return;
    }
    try {
      setJoinData(JSON.parse(raw));
    } catch {
      router.replace(`/meeting/${meetingId}`);
    }
  }, [meetingId, router]);

  if (!joinData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || joinData.livekit_url;

  return (
    <AuthGuard>
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={joinData.token}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={() => {
          sessionStorage.removeItem(`meeting_token_${meetingId}`);
        }}
        options={{
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            simulcast: true,
          },
        }}
      >
        <RoomInner
          meetingId={meetingId}
          role={joinData.role}
          sessionId={joinData.session_id}
        />
      </LiveKitRoom>
    </AuthGuard>
  );
}
