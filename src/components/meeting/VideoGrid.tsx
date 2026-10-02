"use client";

import { useLocalParticipant, useRemoteParticipants, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantTile } from "./ParticipantTile";
import { ScreenShareView } from "./ScreenShareView";

interface VideoGridProps {
  role?: "host" | "attendee";
  pinnedId?: string | null;
  onTogglePin?: (identity: string) => void;
  raisedHands?: Set<string>;
  onStopPresentation?: () => void;
  isEnhanced?: boolean;
}

/**
 * Responsive Google Meet video grid supporting:
 * 1. Auto-responsive grid layout (1, 2, 3, 4, 6+ participants)
 * 2. Side-by-side presentation mode with right vertical filmstrip
 * 3. Spotlight / Pinned participant mode
 */
export function VideoGrid({
  role,
  pinnedId,
  onTogglePin,
  raisedHands = new Set(),
  onStopPresentation,
  isEnhanced = false,
}: VideoGridProps) {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // Screen share detection
  const screenTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const hasScreenShare = screenTracks.length > 0;
  const isLocalPresenting = localParticipant?.isScreenShareEnabled ?? false;

  const allParticipants = [
    ...(localParticipant ? [{ p: localParticipant, isLocal: true }] : []),
    ...remoteParticipants.map((p) => ({ p, isLocal: false })),
  ];

  // 1. Presentation Mode: Screen Share dominant stage + vertical filmstrip
  if (hasScreenShare) {
    return (
      <div className="flex-1 flex flex-col md:flex-row gap-3 p-3 sm:p-4 overflow-hidden">
        <ScreenShareView
          onStopPresentation={onStopPresentation}
          isLocalPresenting={isLocalPresenting}
        />
        <div className="w-full md:w-64 lg:w-72 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto flex-shrink-0">
          {allParticipants.map(({ p, isLocal }) => (
            <div key={p.identity} className="w-48 md:w-full flex-shrink-0">
              <ParticipantTile
                participant={p}
                isLocal={isLocal}
                isPinned={pinnedId === p.identity}
                onTogglePin={() => onTogglePin?.(p.identity)}
                isHandRaised={raisedHands.has(p.identity)}
                isEnhanced={isLocal ? isEnhanced : false}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Spotlight / Pinned Participant Mode
  const pinnedParticipant = pinnedId
    ? allParticipants.find((item) => item.p.identity === pinnedId)
    : null;

  if (pinnedParticipant) {
    const otherParticipants = allParticipants.filter(
      (item) => item.p.identity !== pinnedId
    );

    return (
      <div className="flex-1 flex flex-col md:flex-row gap-3 p-3 sm:p-4 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-video max-h-[85vh] flex items-center justify-center">
            <ParticipantTile
              participant={pinnedParticipant.p}
              isLocal={pinnedParticipant.isLocal}
              isPinned={true}
              onTogglePin={() => onTogglePin?.(pinnedParticipant.p.identity)}
              isHandRaised={raisedHands.has(pinnedParticipant.p.identity)}
              isEnhanced={pinnedParticipant.isLocal ? isEnhanced : false}
            />
          </div>
        </div>
        {otherParticipants.length > 0 && (
          <div className="w-full md:w-64 lg:w-72 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto flex-shrink-0">
            {otherParticipants.map(({ p, isLocal }) => (
              <div key={p.identity} className="w-48 md:w-full flex-shrink-0">
                <ParticipantTile
                  participant={p}
                  isLocal={isLocal}
                  isPinned={false}
                  onTogglePin={() => onTogglePin?.(p.identity)}
                  isHandRaised={raisedHands.has(p.identity)}
                  isEnhanced={isLocal ? isEnhanced : false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Standard Google Meet Grid Mode
  const count = allParticipants.length;

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
      {count === 1 ? (
        <div className="w-full max-w-4xl aspect-video max-h-[80vh] flex items-center justify-center">
          <ParticipantTile
            participant={allParticipants[0].p}
            isLocal={allParticipants[0].isLocal}
            onTogglePin={() => onTogglePin?.(allParticipants[0].p.identity)}
            isHandRaised={raisedHands.has(allParticipants[0].p.identity)}
            isEnhanced={allParticipants[0].isLocal ? isEnhanced : false}
          />
        </div>
      ) : (
        <div
          className={`w-full h-full max-w-7xl grid gap-3 sm:gap-4 place-content-center items-center justify-center ${
            count === 2
              ? "grid-cols-1 md:grid-cols-2"
              : count <= 4
              ? "grid-cols-1 sm:grid-cols-2"
              : count <= 6
              ? "grid-cols-2 lg:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {allParticipants.map(({ p, isLocal }) => (
            <ParticipantTile
              key={p.identity}
              participant={p}
              isLocal={isLocal}
              onTogglePin={() => onTogglePin?.(p.identity)}
              isHandRaised={raisedHands.has(p.identity)}
              isEnhanced={isLocal ? isEnhanced : false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
