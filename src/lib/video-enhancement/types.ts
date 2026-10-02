/**
 * Video Enhancement Pipeline V1 - Types & Interfaces
 *
 * Implements client-side automatic camera quality enhancement:
 * - Brightness, Contrast, Saturation, and Soft-Sharpening
 * - Low-resolution frame analysis (~160x90 @ ~1 Hz)
 * - Temporal smoothing (EMA) and hysteresis
 * - WebGL rendering pipeline with automatic fallback to raw track
 */

export interface VideoStats {
  /** Mean perceptual luminance [0.0, 1.0] (Y = 0.2126R + 0.7152G + 0.0722B) */
  meanLuma: number;
  /** Luminance standard deviation [0.0, 1.0], representing image contrast */
  lumaStdDev: number;
  /** Proportion of pixels in the highlight clip region (Y > 0.88) [0.0, 1.0] */
  highlightRatio: number;
  /** Proportion of pixels in the shadow crush region (Y < 0.12) [0.0, 1.0] */
  shadowRatio: number;
  /** Edge gradient sharpness metric (higher = sharper) */
  sharpness: number;
  /** Estimated high-frequency noise metric in smooth/shadow areas [0.0, 1.0] */
  noiseEstimate: number;
  /** Timestamp when stats were captured */
  timestamp: number;
}

export interface EnhancementParams {
  /** Brightness offset [-0.05, 0.10], baseline 0.0 */
  brightness: number;
  /** Contrast multiplier [0.95, 1.15], baseline 1.0 */
  contrast: number;
  /** Color saturation multiplier [0.95, 1.10], baseline 1.0 */
  saturation: number;
  /** Unsharp mask / Laplacian sharpening intensity [0.0, 0.20], baseline 0.0 */
  sharpen: number;
  /** Optional denoise factor for future expansion [0.0, 1.0], baseline 0.0 */
  denoise: number;
}

export interface ProcessingHealth {
  /** True if WebGL and required extensions are available */
  supported: boolean;
  /** Current average frame processing duration in milliseconds */
  processingMs: number;
  /** Total frames dropped or missed during processing */
  droppedFrames: number;
  /** Real-time rendered frame rate */
  fps: number;
  /** Whether the enhancement processor is actively publishing processed frames */
  enabled: boolean;
  /** Reason for falling back to raw camera track, if any */
  fallbackReason?: string;
}

export interface VideoEnhancementConfig {
  /** Interval between frame analyses in ms (default: 1000ms = 1Hz) */
  analysisIntervalMs: number;
  /** Downscaled width for the analysis canvas (default: 160) */
  analysisWidth: number;
  /** Downscaled height for the analysis canvas (default: 90) */
  analysisHeight: number;
  /** Exponential moving average smoothing factor alpha [0.05, 0.5] (default: 0.25) */
  emaAlpha: number;
  /** Maximum allowable processing time per frame in ms before considering fallback (default: 12ms) */
  maxProcessingMs: number;
  /** Whether automatic parameter selection is enabled */
  autoEnhance: boolean;
  /** Enable debug console logging */
  debug: boolean;
}

export const DEFAULT_ENHANCEMENT_CONFIG: VideoEnhancementConfig = {
  analysisIntervalMs: 1000,
  analysisWidth: 160,
  analysisHeight: 90,
  emaAlpha: 0.25,
  maxProcessingMs: 12,
  autoEnhance: true,
  debug: false,
};

export const BASELINE_ENHANCEMENT_PARAMS: Readonly<EnhancementParams> = {
  brightness: 0.0,
  contrast: 1.0,
  saturation: 1.0,
  sharpen: 0.0,
  denoise: 0.0,
};
