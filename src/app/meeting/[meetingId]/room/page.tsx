"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { RoomInner } from "@/components/meeting/RoomInner";
import { MEETING_ROOM_OPTIONS } from "@/lib/livekit/room-config";
import { JoinTokenResponse } from "@/types";

export default function MeetingRoomPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const router = useRouter();
  const [joinData, setJoinData] = useState<JoinTokenResponse | null>(null);

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
        options={MEETING_ROOM_OPTIONS}
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
