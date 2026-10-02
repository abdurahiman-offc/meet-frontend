/**
 * Video Enhancement Pipeline
 *
 * Master orchestrator implementing LiveKit's TrackProcessor interface:
 * - Ingests the raw camera MediaStreamTrack
 * - Runs VideoAnalyzer (~1/sec, 160x90) for image metrics
 * - Updates EnhancementController (temporal EMA smoothing & hysteresis)
 * - Drives WebGLVideoProcessor (per-pixel shader at ~30 FPS)
 * - Monitored by PerformanceMonitor (automatic fallback on slow devices)
 * - Exposes processed MediaStreamTrack for publishing via LiveKit
 */

import { Track, TrackProcessor, VideoProcessorOptions, LocalVideoTrack } from "livekit-client";
import {
  VideoStats,
  EnhancementParams,
  ProcessingHealth,
  VideoEnhancementConfig,
  DEFAULT_ENHANCEMENT_CONFIG,
  BASELINE_ENHANCEMENT_PARAMS,
} from "./types";
import { VideoAnalyzer } from "./video-analyzer";
import { EnhancementController } from "./enhancement-controller";
import { WebGLVideoProcessor } from "./webgl-processor";
import { PerformanceMonitor } from "./performance-monitor";

export class VideoEnhancementPipeline
  implements TrackProcessor<Track.Kind.Video, VideoProcessorOptions>
{
  public readonly name = "video-enhancer";
  public processedTrack?: MediaStreamTrack;

  private config: VideoEnhancementConfig;
  private analyzer: VideoAnalyzer | null = null;
  private controller: EnhancementController;
  private processor: WebGLVideoProcessor | null = null;
  private performanceMonitor: PerformanceMonitor;

  private rawTrack: MediaStreamTrack | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private ownsVideoElement = false;
  private localTrackRef: LocalVideoTrack | null = null;

  private analysisTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private isAutoEnabled = true;

  // External event listeners
  public onStatsUpdate?: (stats: VideoStats) => void;
  public onParamsUpdate?: (params: EnhancementParams) => void;
  public onHealthUpdate?: (health: ProcessingHealth) => void;
  public onFallback?: (reason: string) => void;

  constructor(customConfig?: Partial<VideoEnhancementConfig>) {
    this.config = { ...DEFAULT_ENHANCEMENT_CONFIG, ...customConfig };
    this.controller = new EnhancementController(this.config.emaAlpha);
    this.isAutoEnabled = this.config.autoEnhance;

    this.performanceMonitor = new PerformanceMonitor({
      maxProcessingMs: this.config.maxProcessingMs,
      onFallbackNeeded: (reason) => {
        this.handleFallback(reason);
      },
      onHealthUpdate: (health) => {
        this.onHealthUpdate?.(health);
      },
    });
  }

  /**
   * LiveKit TrackProcessor Lifecycle: init()
   */
  public async init(opts: VideoProcessorOptions): Promise<void> {
    this.rawTrack = opts.track;
    this.localTrackRef = (opts.localTrack as LocalVideoTrack) || null;

    // Check device support for WebGL & canvas.captureStream
    if (!WebGLVideoProcessor.isSupported()) {
      this.performanceMonitor.setSupported(
        false,
        "WebGL or canvas.captureStream is not supported on this browser/device"
      );
      this.processedTrack = undefined;
      return;
    }

    try {
      // 1. Obtain/Create HTMLVideoElement playing the raw track
      if (opts.element instanceof HTMLVideoElement) {
        this.videoElement = opts.element;
        this.ownsVideoElement = false;
      } else {
        this.videoElement = document.createElement("video");
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
        this.videoElement.muted = true;
        this.videoElement.srcObject = new MediaStream([this.rawTrack]);
        this.ownsVideoElement = true;
      }

      await this.ensureVideoPlaying(this.videoElement);

      // Determine track resolution
      const settings = this.rawTrack.getSettings ? this.rawTrack.getSettings() : {};
      const width = settings.width || 1280;
      const height = settings.height || 720;

      // 2. Initialize WebGL Processor
      this.processor = new WebGLVideoProcessor();
      this.processor.onFrameProcessed = (ms) => {
        this.performanceMonitor.recordFrame(ms);
      };
      this.processor.onContextLost = () => {
        this.performanceMonitor.notifyContextLost();
      };

      const success = this.processor.init(this.videoElement, width, height);
      if (!success) {
        this.performanceMonitor.setSupported(
          false,
          "Failed to initialize WebGL shader program"
        );
        this.processedTrack = undefined;
        return;
      }

      const outputTrack = this.processor.getProcessedTrack();
      if (!outputTrack) {
        this.performanceMonitor.setSupported(
          false,
          "Could not capture output MediaStreamTrack from WebGL canvas"
        );
        this.processedTrack = undefined;
        return;
      }

      this.processedTrack = outputTrack;

      // 3. Initialize low-resolution VideoAnalyzer (~160x90)
      this.analyzer = new VideoAnalyzer(
        this.config.analysisWidth,
        this.config.analysisHeight
      );

      // 4. Start periodic 1Hz analysis loop
      this.startAnalysisLoop();

      // 5. Start performance supervisor
      this.performanceMonitor.start();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown initialization failure";
      console.error("[VideoEnhancer] Initialization failed:", err);
      this.performanceMonitor.setSupported(false, msg);
      this.processedTrack = undefined;
    }
  }

  /**
   * LiveKit TrackProcessor Lifecycle: restart()
   */
  public async restart(opts: VideoProcessorOptions): Promise<void> {
    await this.destroy();
    this.isDestroyed = false;
    await this.init(opts);
  }

  /**
   * Periodic analysis loop (~1000ms / 1 Hz)
   */
  private startAnalysisLoop(): void {
    if (this.analysisTimer) clearInterval(this.analysisTimer);

    this.analysisTimer = setInterval(() => {
      this.runAnalysisCycle();
    }, this.config.analysisIntervalMs);

    // Initial warm-up analysis
    setTimeout(() => {
      this.runAnalysisCycle();
    }, 200);
  }

  private runAnalysisCycle(): void {
    if (this.isDestroyed || !this.videoElement || !this.analyzer || !this.processor) {
      return;
    }

    if (!this.isAutoEnabled) {
      return;
    }

    const stats = this.analyzer.analyze(this.videoElement);
    if (!stats) return;

    this.onStatsUpdate?.(stats);

    // Update enhancement controller (EMA + hysteresis)
    const params = this.controller.update(stats);
    this.onParamsUpdate?.(params);

    // Upload uniforms to GPU shader
    this.processor.setParams(params);
  }

  /**
   * Graceful fallback: stop processor and restore raw camera track
   */
  private handleFallback(reason: string): void {
    console.warn("[VideoEnhancer] Safe fallback triggered:", reason);
    this.onFallback?.(reason);

    // Seamlessly swap back to the raw camera track
    if (this.localTrackRef && typeof this.localTrackRef.stopProcessor === "function") {
      this.localTrackRef.stopProcessor().catch((err: unknown) => {
        console.error("[VideoEnhancer] Error stopping processor during fallback:", err);
      });
    }
  }

  /**
   * Toggle automatic enhancement on/off
   */
  public setAutoEnhance(enabled: boolean): void {
    this.isAutoEnabled = enabled;
    if (!enabled && this.processor) {
      // Revert shader to baseline (1:1 passthrough)
      this.controller.reset();
      this.processor.setParams(BASELINE_ENHANCEMENT_PARAMS);
      this.onParamsUpdate?.(BASELINE_ENHANCEMENT_PARAMS);
    }
  }

  /**
   * Manual override of parameters (useful for A/B testing or debug UI)
   */
  public setManualParams(params: Partial<EnhancementParams>): void {
    this.isAutoEnabled = false;
    const current = this.controller.getCurrentParams();
    const merged: EnhancementParams = {
      ...current,
      ...params,
    };
    if (this.processor) {
      this.processor.setParams(merged);
    }
    this.onParamsUpdate?.(merged);
  }

  public getStats(): VideoStats | null {
    return this.controller.getSmoothedStats();
  }

  public getParams(): EnhancementParams {
    return this.controller.getCurrentParams();
  }

  public getHealth(): ProcessingHealth {
    return this.performanceMonitor.getHealth();
  }

  private async ensureVideoPlaying(video: HTMLVideoElement): Promise<void> {
    if (video.readyState >= 2 && !video.paused) return;
    try {
      await video.play();
    } catch {
      // Autoplay with muted is usually allowed, retry once
      video.muted = true;
      try {
        await video.play();
      } catch {
        // Will continue rendering once stream frames arrive
      }
    }
  }

  /**
   * LiveKit TrackProcessor Lifecycle: destroy()
   */
  public async destroy(): Promise<void> {
    this.isDestroyed = true;

    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }

    if (this.analyzer) {
      this.analyzer.destroy();
      this.analyzer = null;
    }

    if (this.processor) {
      this.processor.destroy();
      this.processor = null;
    }

    this.performanceMonitor.destroy();

    if (this.ownsVideoElement && this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      this.videoElement = null;
    }

    this.processedTrack = undefined;
    this.rawTrack = null;
    this.localTrackRef = null;
  }
}
