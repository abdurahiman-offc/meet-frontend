"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { listParticipants, removeParticipant } from "@/lib/api";
import { ParticipantInfo } from "@/types";

interface ParticipantPanelProps {
  meetingId: string;
  onClose: () => void;
}

/**
 * Slide-out panel for hosts to view participant list and remove attendees.
 */
export function ParticipantPanel({ meetingId, onClose }: ParticipantPanelProps) {
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
        <h3 className="text-white font-semibold text-sm">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-[hsl(215,15%,50%)] hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : participants.length === 0 ? (
          <p className="text-[hsl(215,15%,45%)] text-sm text-center py-8">
            No participants yet
          </p>
        ) : (
          participants.map((p) => (
            <div
              key={p.user_id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[hsl(220,20%,14%)] group transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {p.picture ? (
                  <Image
                    src={p.picture}
                    alt={p.name}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-300 text-sm font-semibold flex-shrink-0">
                    {p.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[hsl(215,10%,45%)] text-xs capitalize">
                    {p.role}
                  </p>
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
