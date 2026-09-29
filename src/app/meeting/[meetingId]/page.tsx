"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { useMeeting } from "@/hooks/useMeeting";
import { joinMeeting } from "@/lib/api";

export default function PreJoinPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { meeting, isLoading, error } = useMeeting(meetingId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Request camera + mic on mount
  useEffect(() => {
    let mounted = true;
    const startMedia = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err: any) {
        if (!mounted) return;
        if (err.name === "NotAllowedError") {
          setPermissionError("Camera or microphone access was denied. You can still join without them.");
        } else {
          setPermissionError("Could not access camera or microphone.");
        }
        setCameraOn(false);
        setMicOn(false);
      }
    };
    startMedia();
    return () => {
      mounted = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []); // eslint-disable-line

  // Sync camera track state
  useEffect(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => { t.enabled = cameraOn; });
  }, [cameraOn, stream]);

  // Sync mic track state
  useEffect(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => { t.enabled = micOn; });
  }, [micOn, stream]);

  const handleJoin = async () => {
    setIsJoining(true);
    // Stop local preview stream before entering room
    stream?.getTracks().forEach((t) => t.stop());
    try {
      const joinData = await joinMeeting(meetingId);
      // Store join data for the room page
      sessionStorage.setItem(`meeting_token_${meetingId}`, JSON.stringify(joinData));
      router.push(`/meeting/${meetingId}/room`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) router.push(`/meeting/${meetingId}/ended`);
      else if (status === 404) router.push("/unauthorized");
      else {
        alert("Failed to join meeting. Please try again.");
        setIsJoining(false);
      }
    }
  };

  // Redirect on meeting status
  useEffect(() => {
    if (!meeting) return;
    if (meeting.status === "ended") router.replace(`/meeting/${meetingId}/ended`);
  }, [meeting, meetingId, router]);

  if (!isLoading && error === "not_found") {
    router.replace("/unauthorized");
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col font-sans select-none">
        {/* Google Meet Header */}
        <header className="border-b border-[#3c4043] bg-[#202124]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="flex items-center gap-2 group">
                <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
                  <rect x="18" y="24" width="44" height="52" rx="10" fill="#00832D" />
                  <path d="M42 24H52C57.5228 24 62 28.4772 62 34V46H42V24Z" fill="#EA4335" />
                  <path d="M18 34C18 28.4772 22.4772 24 28 24H42V50H18V34Z" fill="#FBBC04" />
                  <path d="M18 50H42V76H28C22.4772 76 18 71.5228 18 66V50Z" fill="#4285F4" />
                  <path d="M42 54H62V66C62 71.5228 57.5228 76 52 76H42V54Z" fill="#00AC47" />
                  <path d="M62 38L82 23V77L62 62V38Z" fill="#00832D" />
                  <path d="M62 38L82 23V50H62V38Z" fill="#EA4335" />
                  <path d="M62 50H82V77L62 62V50Z" fill="#00AC47" />
                </svg>
                <span className="text-lg font-normal text-white">Meet</span>
              </a>
              <span className="text-[#5f6368]">•</span>
              <span className="text-sm font-mono text-[#9aa0a6]">{meetingId}</span>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9aa0a6] hidden sm:inline">{user.email}</span>
                {user.picture ? (
                  <Image src={user.picture} alt={user.name} width={30} height={30} className="rounded-full" unoptimized />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-xs font-medium">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Camera Preview */}
            <div className="lg:col-span-3">
              <div className="relative aspect-video bg-[#2d2e30] rounded-2xl overflow-hidden border border-[#3c4043] shadow-lg">
                {cameraOn && stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    {user?.picture ? (
                      <Image src={user.picture} alt={user.name} width={72} height={72} className="rounded-full ring-4 ring-[#3c4043]" unoptimized />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#1a73e8] flex items-center justify-center text-3xl font-bold text-white ring-4 ring-[#3c4043]">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <p className="text-[#9aa0a6] text-sm font-medium">Camera is off</p>
                  </div>
                )}

                {/* Microphone & Camera Google Meet controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button
                    id="prejoin-mic-btn"
                    type="button"
                    onClick={() => setMicOn(!micOn)}
                    title={micOn ? "Turn off microphone" : "Turn on microphone"}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${
                      micOn
                        ? "bg-[#3c4043]/90 hover:bg-[#4a4d52] text-white"
                        : "bg-[#ea4335] hover:bg-[#d93025] text-white"
                    }`}
                  >
                    {micOn ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                      </svg>
                    )}
                  </button>

                  <button
                    id="prejoin-cam-btn"
                    type="button"
                    onClick={() => setCameraOn(!cameraOn)}
                    title={cameraOn ? "Turn off camera" : "Turn on camera"}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${
                      cameraOn
                        ? "bg-[#3c4043]/90 hover:bg-[#4a4d52] text-white"
                        : "bg-[#ea4335] hover:bg-[#d93025] text-white"
                    }`}
                  >
                    {cameraOn ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25ZM12 9.75h.008v.008H12V9.75Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Google Meet Join Panel */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl font-normal text-white mb-1.5">Ready to join?</h1>
                    <p className="text-[#9aa0a6] text-sm">
                      {meeting?.title || "Meeting"}
                    </p>
                    {meeting?.status === "live" && (
                      <span className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-[#81c995] bg-[#137333]/20 border border-[#137333]/30 px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-[#81c995] rounded-full animate-pulse" />
                        Meeting in progress
                      </span>
                    )}
                  </div>

                  {permissionError && (
                    <div className="bg-[#f28b82]/10 border border-[#f28b82]/30 rounded-xl p-4 flex gap-3 text-sm text-[#f28b82]">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      <p>{permissionError}</p>
                    </div>
                  )}

                  <button
                    id="join-now-btn"
                    type="button"
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="w-full py-3.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full font-medium text-base transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isJoining ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Joining…</>
                    ) : "Join now"}
                  </button>

                  <p className="text-xs text-center text-[#9aa0a6]">
                    Joining with camera {cameraOn ? "on" : "off"} and microphone {micOn ? "on" : "off"}
                  </p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
