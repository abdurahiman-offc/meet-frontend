/**
 * Video Analyzer
 *
 * Performs lightweight statistical analysis on a downscaled video frame (~160x90)
 * approximately once per second.
 *
 * Computes:
 * - Mean Luminance (Y = 0.2126R + 0.7152G + 0.0722B)
 * - Luminance Standard Deviation (Contrast index)
 * - Highlight Clipping Ratio (Y > 0.88)
 * - Shadow Crush Ratio (Y < 0.12)
 * - Edge Gradient Sharpness (Laplacian energy)
 * - High-frequency Noise Estimate in low-contrast zones
 */

import { VideoStats } from "./types";

export class VideoAnalyzer {
  private readonly width: number;
  private readonly height: number;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;

  constructor(width = 160, height = 90) {
    this.width = width;
    this.height = height;

    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    } else {
      this.canvas = null as unknown as HTMLCanvasElement;
      this.ctx = null;
    }
  }

  /**
   * Analyzes the current frame from an HTMLVideoElement.
   * Runs in < 0.5ms on a 160x90 canvas.
   */
  public analyze(videoElement: HTMLVideoElement): VideoStats | null {
    if (!this.ctx || !videoElement || videoElement.readyState < 2) {
      return null;
    }

    const { width, height } = this;

    try {
      // Draw downscaled frame
      this.ctx.drawImage(videoElement, 0, 0, width, height);
      const imgData = this.ctx.getImageData(0, 0, width, height);
      const data = imgData.data; // RGBA uint8 array (width * height * 4)
      const numPixels = width * height;

      // 1. First Pass: Compute Luminance, Highlights, Shadows, and Sums
      // Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
      let sumLuma = 0;
      let sumSqLuma = 0;
      let highlightCount = 0;
      let shadowCount = 0;

      // Temporary float array for 2nd pass (sharpness & noise)
      // Reusing a preallocated Float32Array to avoid GC churn
      if (!this.lumaBuffer || this.lumaBuffer.length !== numPixels) {
        this.lumaBuffer = new Float32Array(numPixels);
      }
      const luma = this.lumaBuffer;

      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        // ITU-R BT.709 perceptual luminance
        const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        luma[p] = y;

        sumLuma += y;
        sumSqLuma += y * y;

        if (y > 0.88) {
          highlightCount++;
        } else if (y < 0.12) {
          shadowCount++;
        }
      }

      const meanLuma = sumLuma / numPixels;
      // Variance = E[X^2] - (E[X])^2
      const lumaVar = Math.max(0, sumSqLuma / numPixels - meanLuma * meanLuma);
      const lumaStdDev = Math.sqrt(lumaVar);

      const highlightRatio = highlightCount / numPixels;
      const shadowRatio = shadowCount / numPixels;

      // 2. Second Pass: Sharpness (Laplacian energy) & Noise estimation
      // Using a discrete 4-connected Laplacian on non-border pixels:
      // L(x, y) = 4*Y(x, y) - Y(x-1,y) - Y(x+1,y) - Y(x,y-1) - Y(x,y+1)
      let laplacianEnergySum = 0;
      let laplacianCount = 0;

      // Noise estimation: sample variation in flat / low-gradient patches
      let flatPatchSumDiff = 0;
      let flatPatchCount = 0;

      for (let y = 1; y < height - 1; y++) {
        const row = y * width;
        const rowAbove = (y - 1) * width;
        const rowBelow = (y + 1) * width;

        for (let x = 1; x < width - 1; x++) {
          const idx = row + x;
          const center = luma[idx];
          const left = luma[idx - 1];
          const right = luma[idx + 1];
          const top = luma[rowAbove + x];
          const bottom = luma[rowBelow + x];

          // Laplacian
          const lap = Math.abs(4 * center - left - right - top - bottom);
          laplacianEnergySum += lap;
          laplacianCount++;

          // Horizontal and vertical gradient magnitudes
          const gradX = Math.abs(right - left);
          const gradY = Math.abs(bottom - top);
          const localGradient = gradX + gradY;

          // If local gradient is very low (smooth area) and not complete black
          // any micro-fluctuations represent sensor noise
          if (localGradient < 0.04 && center > 0.05 && center < 0.70) {
            flatPatchSumDiff += Math.abs(center - (left + right + top + bottom) * 0.25);
            flatPatchCount++;
          }
        }
      }

      const sharpness = laplacianCount > 0 ? (laplacianEnergySum / laplacianCount) * 10 : 0;
      const noiseEstimate =
        flatPatchCount > 20
          ? Math.min(1.0, (flatPatchSumDiff / flatPatchCount) * 25)
          : 0.0;

      return {
        meanLuma,
        lumaStdDev,
        highlightRatio,
        shadowRatio,
        sharpness,
        noiseEstimate,
        timestamp: performance.now(),
      };
    } catch {
      // In case of cross-origin or canvas security exceptions
      return null;
    }
  }

  private lumaBuffer: Float32Array | null = null;

  public destroy(): void {
    if (this.canvas) {
      this.canvas.width = 1;
      this.canvas.height = 1;
    }
    this.lumaBuffer = null;
  }
}
