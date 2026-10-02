"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Track, LocalVideoTrack } from "livekit-client";
import {
  VideoEnhancementPipeline,
  VideoStats,
  EnhancementParams,
  ProcessingHealth,
  BASELINE_ENHANCEMENT_PARAMS,
} from "@/lib/video-enhancement";

export interface UseVideoEnhancementReturn {
  /** Whether video enhancement is currently enabled and active */
  isEnabled: boolean;
  /** Whether the current device supports WebGL processing */
  isSupported: boolean;
  /** Latest frame statistics from the 1Hz analyzer */
  stats: VideoStats | null;
  /** Currently applied shader parameters (EMA smoothed) */
  params: EnhancementParams;
  /** Performance metrics (GPU processing ms, FPS, dropped frames) */
  health: ProcessingHealth;
  /** Reason for falling back to raw camera track, if any */
  fallbackReason: string | undefined;
  /** Toggle enhancement on or off */
  toggleEnhancement: (enabled?: boolean) => Promise<void>;
  /** Toggle A/B comparison mode (temporarily reverts shader to 1:1 baseline) */
  toggleABMode: () => void;
  /** Whether A/B comparison mode is active (showing unenhanced baseline) */
  isABMode: boolean;
}

export function useVideoEnhancement(): UseVideoEnhancementReturn {
  const { localParticipant } = useLocalParticipant();

  const pipelineRef = useRef<VideoEnhancementPipeline | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const [isABMode, setIsABMode] = useState(false);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [params, setParams] = useState<EnhancementParams>({ ...BASELINE_ENHANCEMENT_PARAMS });
  const [health, setHealth] = useState<ProcessingHealth>({
    supported: true,
    processingMs: 0,
    droppedFrames: 0,
    fps: 30,
    enabled: true,
  });
  const [fallbackReason, setFallbackReason] = useState<string | undefined>(undefined);

  // Initialize pipeline instance once
  useEffect(() => {
    const pipeline = new VideoEnhancementPipeline();
    pipelineRef.current = pipeline;

    pipeline.onStatsUpdate = (s) => setStats(s);
    pipeline.onParamsUpdate = (p) => setParams(p);
    pipeline.onHealthUpdate = (h) => {
      setHealth(h);
      setIsSupported(h.supported);
    };
    pipeline.onFallback = (reason) => {
      setFallbackReason(reason);
      setIsEnabled(false);
    };

    return () => {
      pipeline.destroy();
      pipelineRef.current = null;
    };
  }, []);

  // Attach pipeline to local camera video track
  useEffect(() => {
    if (!localParticipant || !pipelineRef.current) return;

    let isCancelled = false;

    const attachProcessor = async () => {
      const pipeline = pipelineRef.current;
      if (!pipeline) return;

      // Find local camera track
      const pub = localParticipant.getTrackPublication(Track.Source.Camera);
      const videoTrack = pub?.track as LocalVideoTrack | undefined;

      if (!videoTrack || !isEnabled) {
        if (videoTrack?.getProcessor() === pipeline) {
          try {
            await videoTrack.stopProcessor();
          } catch {
            // Ignore teardown errors
          }
        }
        return;
      }

      // If already attached, no-op
      if (videoTrack.getProcessor() === pipeline) return;

      try {
        await videoTrack.setProcessor(pipeline);
        if (!isCancelled) {
          setFallbackReason(undefined);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to attach video processor";
        console.warn("[useVideoEnhancement] Failed to attach processor:", err);
        if (!isCancelled) {
          setFallbackReason(errorMsg);
          setIsEnabled(false);
        }
      }
    };

    attachProcessor();

    // Listen to local camera track publications/unpublications
    const handleTrackPublished = () => attachProcessor();
    const handleTrackUnpublished = () => attachProcessor();

    localParticipant.on("trackPublished", handleTrackPublished);
    localParticipant.on("trackUnpublished", handleTrackUnpublished);

    return () => {
      isCancelled = true;
      localParticipant.off("trackPublished", handleTrackPublished);
      localParticipant.off("trackUnpublished", handleTrackUnpublished);
    };
  }, [localParticipant, isEnabled, localParticipant?.isCameraEnabled]);

  // Toggle enhancement
  const toggleEnhancement = useCallback(
    async (explicitState?: boolean) => {
      const nextState = explicitState !== undefined ? explicitState : !isEnabled;
      setIsEnabled(nextState);

      const pub = localParticipant?.getTrackPublication(Track.Source.Camera);
      const videoTrack = pub?.track as LocalVideoTrack | undefined;

      if (!nextState && videoTrack?.getProcessor()) {
        try {
          await videoTrack.stopProcessor();
        } catch {
          // Ignore
        }
      }
    },
    [isEnabled, localParticipant]
  );

  // Toggle A/B comparison mode (temporarily sets shader to 1:1 baseline without unpublishing)
  const toggleABMode = useCallback(() => {
    if (!pipelineRef.current) return;

    setIsABMode((prev) => {
      const next = !prev;
      if (next) {
        // Switch to raw baseline params (no processing)
        pipelineRef.current?.setAutoEnhance(false);
      } else {
        // Resume automatic adaptive enhancement
        pipelineRef.current?.setAutoEnhance(true);
      }
      return next;
    });
  }, []);

  return {
    isEnabled,
    isSupported,
    stats,
    params,
    health,
    fallbackReason,
    toggleEnhancement,
    toggleABMode,
    isABMode,
  };
}
