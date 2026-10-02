/**
 * Performance Monitor
 *
 * Continuously measures GPU render duration, frame rate, and dropped frames.
 * Decides when to safely fall back to the raw camera track if device capabilities
 * or thermal throttling cause performance degradation.
 */

import { ProcessingHealth } from "./types";

export interface PerformanceMonitorOptions {
  /** Maximum allowable processing time per frame in ms (default: 12ms) */
  maxProcessingMs?: number;
  /** Max consecutive slow frames before triggering fallback (default: 90 frames ~ 3s at 30fps) */
  maxSlowFramesThreshold?: number;
  /** Callback triggered when a fallback condition is met */
  onFallbackNeeded?: (reason: string) => void;
  /** Callback on periodic health update */
  onHealthUpdate?: (health: ProcessingHealth) => void;
}

export class PerformanceMonitor {
  private readonly maxProcessingMs: number;
  private readonly maxSlowFramesThreshold: number;
  private readonly onFallbackNeeded?: (reason: string) => void;
  private readonly onHealthUpdate?: (health: ProcessingHealth) => void;

  private isSupported = true;
  private isEnabled = true;
  private fallbackReason?: string;

  // Frame timing metrics
  private frameDurations: number[] = [];
  private consecutiveSlowFrames = 0;
  private totalDroppedFrames = 0;
  private frameCount = 0;
  private lastFpsTimestamp = 0;
  private currentFps = 30;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: PerformanceMonitorOptions = {}) {
    this.maxProcessingMs = options.maxProcessingMs ?? 12;
    this.maxSlowFramesThreshold = options.maxSlowFramesThreshold ?? 90;
    this.onFallbackNeeded = options.onFallbackNeeded;
    this.onHealthUpdate = options.onHealthUpdate;

    this.lastFpsTimestamp = typeof performance !== "undefined" ? performance.now() : 0;
  }

  public start(): void {
    if (typeof window === "undefined") return;

    this.healthCheckInterval = setInterval(() => {
      this.evaluateHealth();
    }, 1000);
  }

  /**
   * Called by WebGLVideoProcessor after rendering each frame with duration in ms
   */
  public recordFrame(durationMs: number): void {
    this.frameCount++;
    this.frameDurations.push(durationMs);
    if (this.frameDurations.length > 60) {
      this.frameDurations.shift();
    }

    if (durationMs > this.maxProcessingMs) {
      this.consecutiveSlowFrames++;
      if (this.consecutiveSlowFrames >= this.maxSlowFramesThreshold && this.isEnabled) {
        this.triggerFallback(
          `High GPU latency: average frame took ${durationMs.toFixed(1)}ms (threshold: ${this.maxProcessingMs}ms)`
        );
      }
    } else {
      this.consecutiveSlowFrames = Math.max(0, this.consecutiveSlowFrames - 1);
    }
  }

  public recordDroppedFrame(): void {
    this.totalDroppedFrames++;
  }

  public notifyContextLost(): void {
    this.triggerFallback("WebGL GPU context was lost by the browser");
  }

  public setSupported(supported: boolean, reason?: string): void {
    this.isSupported = supported;
    if (!supported) {
      this.triggerFallback(reason || "WebGL enhancement is not supported on this device/browser");
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getHealth(): ProcessingHealth {
    const avgDuration =
      this.frameDurations.length > 0
        ? this.frameDurations.reduce((a, b) => a + b, 0) / this.frameDurations.length
        : 0;

    return {
      supported: this.isSupported,
      processingMs: Math.round(avgDuration * 10) / 10,
      droppedFrames: this.totalDroppedFrames,
      fps: Math.round(this.currentFps),
      enabled: this.isEnabled && !this.fallbackReason,
      fallbackReason: this.fallbackReason,
    };
  }

  private evaluateHealth(): void {
    if (typeof performance === "undefined") return;

    const now = performance.now();
    const elapsed = (now - this.lastFpsTimestamp) / 1000;
    if (elapsed >= 0.9) {
      this.currentFps = this.frameCount / elapsed;
      this.frameCount = 0;
      this.lastFpsTimestamp = now;

      const health = this.getHealth();
      this.onHealthUpdate?.(health);
    }
  }

  private triggerFallback(reason: string): void {
    if (this.fallbackReason) return; // Already fallen back
    this.fallbackReason = reason;
    this.isEnabled = false;
    this.onFallbackNeeded?.(reason);
    this.onHealthUpdate?.(this.getHealth());
  }

  public resetFallback(): void {
    this.fallbackReason = undefined;
    this.consecutiveSlowFrames = 0;
    this.isEnabled = true;
  }

  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}
