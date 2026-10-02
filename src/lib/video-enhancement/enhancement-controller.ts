/**
 * Enhancement Controller
 *
 * Translates low-resolution statistical measurements (VideoStats) into
 * conservative, visually stable WebGL fragment shader uniforms (EnhancementParams).
 *
 * Implements:
 * - Rule-based conservative parameter selection
 * - Exponential Moving Average (EMA) temporal smoothing
 * - Deadband hysteresis to prevent parameter hunting and brightness pumping
 * - Safe clamping to spec limits (Brightness 0.0-0.08, Contrast 1.0-1.08, Saturation 1.0-1.04, Sharpen 0.0-0.15)
 */

import {
  VideoStats,
  EnhancementParams,
  BASELINE_ENHANCEMENT_PARAMS,
} from "./types";

export class EnhancementController {
  private readonly alpha: number;
  private currentParams: EnhancementParams;
  private targetParams: EnhancementParams;
  private smoothedStats: VideoStats | null = null;

  constructor(alpha = 0.25) {
    this.alpha = Math.max(0.05, Math.min(0.5, alpha));
    this.currentParams = { ...BASELINE_ENHANCEMENT_PARAMS };
    this.targetParams = { ...BASELINE_ENHANCEMENT_PARAMS };
  }

  /**
   * Evaluates raw frame statistics and calculates new smoothed parameters.
   * Called once per analysis cycle (~1 Hz).
   */
  public update(stats: VideoStats): EnhancementParams {
    // 1. Smooth statistics using EMA
    this.smoothStats(stats);
    const s = this.smoothedStats!;

    // 2. Compute conservative raw target parameters
    const rawTarget = this.computeTargetParams(s);

    // 3. Apply Deadband Hysteresis to raw target
    // Small fluctuations (< deadband) are ignored to avoid parameter hunting
    const deadband = 0.015;
    if (Math.abs(rawTarget.brightness - this.targetParams.brightness) > deadband) {
      this.targetParams.brightness = rawTarget.brightness;
    }
    if (Math.abs(rawTarget.contrast - this.targetParams.contrast) > deadband) {
      this.targetParams.contrast = rawTarget.contrast;
    }
    if (Math.abs(rawTarget.saturation - this.targetParams.saturation) > deadband) {
      this.targetParams.saturation = rawTarget.saturation;
    }
    if (Math.abs(rawTarget.sharpen - this.targetParams.sharpen) > deadband * 1.5) {
      this.targetParams.sharpen = rawTarget.sharpen;
    }

    // 4. Temporal Exponential Moving Average on the actual applied parameters
    // This guarantees smooth, natural transitions over ~3-4 seconds with no flicker
    this.currentParams = {
      brightness: this.lerp(this.currentParams.brightness, this.targetParams.brightness, this.alpha),
      contrast: this.lerp(this.currentParams.contrast, this.targetParams.contrast, this.alpha),
      saturation: this.lerp(this.currentParams.saturation, this.targetParams.saturation, this.alpha),
      sharpen: this.lerp(this.currentParams.sharpen, this.targetParams.sharpen, this.alpha),
      denoise: 0.0,
    };

    return { ...this.currentParams };
  }

  /**
   * Reset parameters back to clean baseline
   */
  public reset(): void {
    this.currentParams = { ...BASELINE_ENHANCEMENT_PARAMS };
    this.targetParams = { ...BASELINE_ENHANCEMENT_PARAMS };
    this.smoothedStats = null;
  }

  public getCurrentParams(): EnhancementParams {
    return { ...this.currentParams };
  }

  public getSmoothedStats(): VideoStats | null {
    return this.smoothedStats ? { ...this.smoothedStats } : null;
  }

  /**
   * Core Adaptive Decision Rules (Section 15):
   */
  private computeTargetParams(s: VideoStats): EnhancementParams {
    let targetBrightness = 0.0;
    let targetContrast = 1.0;
    let targetSaturation = 1.0;
    let targetSharpen = 0.0;

    // Rule 1: Brightness & Exposure Correction
    // If the image is dark (meanLuma < 0.40) and highlights are not clipping (highlightRatio < 0.05)
    if (s.meanLuma < 0.40 && s.highlightRatio < 0.05) {
      // Proportionally lift brightness up to 0.075
      const deficit = (0.40 - s.meanLuma) / 0.40;
      targetBrightness = Math.min(0.075, deficit * 0.08);

      // If shadow ratio is high, mild saturation boost restores color washed out in shadows
      if (s.shadowRatio > 0.20) {
        targetSaturation = 1.02;
      }
    } else if (s.highlightRatio > 0.08) {
      // High highlight clipping -> strictly prevent brightening to avoid blowing out faces/windows
      targetBrightness = 0.0;
    }

    // Rule 2: Contrast Correction
    // Low contrast scene (lumaStdDev < 0.16) benefits from mild contrast expansion
    if (s.lumaStdDev < 0.16) {
      const contrastDeficit = (0.16 - s.lumaStdDev) / 0.16;
      targetContrast = 1.0 + Math.min(0.07, contrastDeficit * 0.08);
    } else if (s.lumaStdDev > 0.22) {
      // Contrast is already strong, do not over-process
      targetContrast = 1.0;
    }

    // Rule 3: Sharpness & Noise Guard
    // Only sharpen if image is soft (sharpness < 0.40) AND noise is safely low (noiseEstimate < 0.02)
    // Never amplify sensor noise in low-light conditions!
    if (s.noiseEstimate >= 0.025) {
      // Noisy frame: strictly disable sharpening
      targetSharpen = 0.0;
    } else if (s.sharpness < 0.35 && s.noiseEstimate < 0.018) {
      // Soft image with clean sensor: apply very mild sharpening [0.04 - 0.12]
      const softness = (0.35 - s.sharpness) / 0.35;
      targetSharpen = Math.min(0.12, softness * 0.15);
    }

    // Rule 4: Mild Saturation for pale/underexposed conditions
    if (s.meanLuma >= 0.40 && s.meanLuma <= 0.60 && s.lumaStdDev >= 0.16) {
      // Already well-balanced image -> keep near-zero enhancement
      targetSaturation = 1.0;
    }

    // Strict clamping to V1 safe ranges
    return {
      brightness: Math.max(0.0, Math.min(0.08, targetBrightness)),
      contrast: Math.max(1.0, Math.min(1.08, targetContrast)),
      saturation: Math.max(1.0, Math.min(1.04, targetSaturation)),
      sharpen: Math.max(0.0, Math.min(0.15, targetSharpen)),
      denoise: 0.0,
    };
  }

  private smoothStats(raw: VideoStats): void {
    if (!this.smoothedStats) {
      this.smoothedStats = { ...raw };
      return;
    }

    const a = this.alpha;
    this.smoothedStats = {
      meanLuma: this.lerp(this.smoothedStats.meanLuma, raw.meanLuma, a),
      lumaStdDev: this.lerp(this.smoothedStats.lumaStdDev, raw.lumaStdDev, a),
      highlightRatio: this.lerp(this.smoothedStats.highlightRatio, raw.highlightRatio, a),
      shadowRatio: this.lerp(this.smoothedStats.shadowRatio, raw.shadowRatio, a),
      sharpness: this.lerp(this.smoothedStats.sharpness, raw.sharpness, a),
      noiseEstimate: this.lerp(this.smoothedStats.noiseEstimate, raw.noiseEstimate, a),
      timestamp: raw.timestamp,
    };
  }

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }
}
