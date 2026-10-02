"use client";

import {
  useConnectionQualityIndicator,
  useLocalParticipant,
  useMaybeParticipantContext,
} from "@livekit/components-react";
import { ConnectionQuality, Participant } from "livekit-client";

interface ConnectionQualityIndicatorProps {
  participant?: Participant;
  showLabel?: boolean;
  className?: string;
}

function ActiveIndicator({
  participant,
  showLabel,
  className,
}: {
  participant: Participant;
  showLabel: boolean;
  className: string;
}) {
  const { quality } = useConnectionQualityIndicator({ participant });

  const getQualityDetails = () => {
    switch (quality) {
      case ConnectionQuality.Excellent:
        return {
          label: "Good",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          barColor: "bg-emerald-400",
          activeBars: 3,
        };
      case ConnectionQuality.Good:
        return {
          label: "Good",
          color: "text-green-400",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
          barColor: "bg-green-400",
          activeBars: 2,
        };
      case ConnectionQuality.Poor:
        return {
          label: "Poor",
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          barColor: "bg-amber-400",
          activeBars: 1,
        };
      case ConnectionQuality.Lost:
        return {
          label: "Lost",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
          barColor: "bg-red-400",
          activeBars: 0,
        };
      case ConnectionQuality.Unknown:
      default:
        return {
          label: "Connecting...",
          color: "text-[hsl(215,15%,55%)]",
          bgColor: "bg-[hsl(220,15%,16%)]",
          borderColor: "border-[hsl(220,15%,22%)]",
          barColor: "bg-[hsl(215,15%,45%)]",
          activeBars: 1,
        };
    }
  };

  const details = getQualityDetails();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${details.bgColor} ${details.borderColor} ${details.color} ${className}`}
      title={`Connection: ${details.label}`}
      role="status"
      aria-label={`Connection quality: ${details.label}`}
    >
      {/* 3-bar cellular/wifi signal icon */}
      <div className="flex items-end gap-[2px] h-3 w-3 justify-center py-0.5" aria-hidden="true">
        <span
          className={`w-[2.5px] rounded-full transition-all ${
            details.activeBars >= 1 ? details.barColor : "bg-white/20"
          } h-[40%]`}
        />
        <span
          className={`w-[2.5px] rounded-full transition-all ${
            details.activeBars >= 2 ? details.barColor : "bg-white/20"
          } h-[70%]`}
        />
        <span
          className={`w-[2.5px] rounded-full transition-all ${
            details.activeBars >= 3 ? details.barColor : "bg-white/20"
          } h-[100%]`}
        />
      </div>

      {showLabel && <span className="text-[11px] leading-none">{details.label}</span>}
    </div>
  );
}

/**
 * Visual indicator showing connection quality (Excellent, Good, Poor, Lost)
 * using LiveKit's built-in WebRTC connection quality tracking.
 */
export function ConnectionQualityIndicator({
  participant: propParticipant,
  showLabel = false,
  className = "",
}: ConnectionQualityIndicatorProps) {
  const contextParticipant = useMaybeParticipantContext();
  const { localParticipant } = useLocalParticipant();
  const participant = propParticipant ?? contextParticipant ?? localParticipant;

  if (!participant) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-[hsl(220,15%,16%)] border-[hsl(220,15%,22%)] text-[hsl(215,15%,55%)] ${className}`}
        title="Connection: Connecting..."
        role="status"
        aria-label="Connection quality: Connecting..."
      >
        <div className="flex items-end gap-[2px] h-3 w-3 justify-center py-0.5" aria-hidden="true">
          <span className="w-[2.5px] rounded-full transition-all bg-[hsl(215,15%,45%)] h-[40%]" />
          <span className="w-[2.5px] rounded-full transition-all bg-white/20 h-[70%]" />
          <span className="w-[2.5px] rounded-full transition-all bg-white/20 h-[100%]" />
        </div>
        {showLabel && <span className="text-[11px] leading-none">Connecting...</span>}
      </div>
    );
  }

  return (
    <ActiveIndicator
      participant={participant}
      showLabel={showLabel}
      className={className}
    />
  );
}
