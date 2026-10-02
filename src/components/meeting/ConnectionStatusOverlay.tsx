"use client";

import { useConnectionState } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import Link from "next/link";

interface ConnectionStatusOverlayProps {
  onRetry?: () => void;
}

/**
 * Overlay component displayed when the LiveKit WebRTC connection is reconnecting
 * or disconnected, providing immediate feedback and recovery actions.
 */
export function ConnectionStatusOverlay({ onRetry }: ConnectionStatusOverlayProps) {
  const connectionState = useConnectionState();

  if (connectionState === ConnectionState.Connected) {
    return null;
  }

  const isReconnecting =
    connectionState === ConnectionState.Reconnecting ||
    (connectionState as string) === "signalReconnecting";

  if (isReconnecting) {
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
    const handleRetry = () => {
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    };

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
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
            >
              Retry
            </button>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[hsl(220,20%,18%)] hover:bg-[hsl(220,20%,22%)] text-white rounded-xl font-medium text-sm transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
