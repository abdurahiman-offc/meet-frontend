import test from "node:test";
import assert from "node:assert/strict";

import { EnhancementController } from "../enhancement-controller";
import { PerformanceMonitor } from "../performance-monitor";
import { VideoStats, BASELINE_ENHANCEMENT_PARAMS } from "../types";

test("EnhancementController - baseline when reset", () => {
  const controller = new EnhancementController();
  const current = controller.getCurrentParams();
  assert.equal(current.brightness, 0.0);
  assert.equal(current.contrast, 1.0);
  assert.equal(current.saturation, 1.0);
  assert.equal(current.sharpen, 0.0);
});

test("EnhancementController - Dark room with low highlights lifts brightness smoothly", () => {
  const controller = new EnhancementController(0.3);

  const darkStats: VideoStats = {
    meanLuma: 0.18, // Underexposed scene
    lumaStdDev: 0.12,
    highlightRatio: 0.01,
    shadowRatio: 0.40,
    sharpness: 0.20,
    noiseEstimate: 0.01, // Clean sensor
    timestamp: 1000,
  };

  // Run a few updates to simulate EMA settling
  let params = controller.getCurrentParams();
  for (let i = 0; i < 5; i++) {
    params = controller.update(darkStats);
  }

  // Brightness should have lifted conservatively
  assert.ok(params.brightness > 0.01, `Expected brightness > 0.01, got ${params.brightness}`);
  assert.ok(params.brightness <= 0.08, `Expected brightness <= 0.08, got ${params.brightness}`);
  // Contrast should have slightly increased
  assert.ok(params.contrast >= 1.0, `Expected contrast >= 1.0, got ${params.contrast}`);
  assert.ok(params.contrast <= 1.08, `Expected contrast <= 1.08, got ${params.contrast}`);
  // Saturation should have slightly boosted for underexposure
  assert.ok(params.saturation >= 1.0 && params.saturation <= 1.04);
});

test("EnhancementController - High highlight clipping prevents brightness increase", () => {
  const controller = new EnhancementController();

  const clippingStats: VideoStats = {
    meanLuma: 0.35,
    lumaStdDev: 0.25,
    highlightRatio: 0.15, // Bright backlight / window clipping
    shadowRatio: 0.10,
    sharpness: 0.40,
    noiseEstimate: 0.01,
    timestamp: 1000,
  };

  const params = controller.update(clippingStats);
  assert.equal(params.brightness, 0.0, "Must not brighten scene with highlight clipping");
});

test("EnhancementController - Soft image with low noise receives mild sharpening", () => {
  const controller = new EnhancementController(0.5);

  const softCleanStats: VideoStats = {
    meanLuma: 0.50,
    lumaStdDev: 0.18,
    highlightRatio: 0.02,
    shadowRatio: 0.02,
    sharpness: 0.15, // Soft focus
    noiseEstimate: 0.008, // Very low noise
    timestamp: 1000,
  };

  let params = controller.getCurrentParams();
  for (let i = 0; i < 5; i++) {
    params = controller.update(softCleanStats);
  }

  assert.ok(params.sharpen > 0.02, `Expected sharpening > 0.02, got ${params.sharpen}`);
  assert.ok(params.sharpen <= 0.15, `Expected sharpening <= 0.15, got ${params.sharpen}`);
});

test("EnhancementController - Soft image with high noise strictly avoids sharpening", () => {
  const controller = new EnhancementController(0.5);

  const softNoisyStats: VideoStats = {
    meanLuma: 0.30,
    lumaStdDev: 0.15,
    highlightRatio: 0.01,
    shadowRatio: 0.10,
    sharpness: 0.15, // Soft
    noiseEstimate: 0.04, // High sensor noise
    timestamp: 1000,
  };

  for (let i = 0; i < 5; i++) {
    controller.update(softNoisyStats);
  }
  const params = controller.getCurrentParams();

  assert.equal(params.sharpen, 0.0, "Must not sharpen noisy images");
});

test("EnhancementController - Well-balanced image remains near-zero enhancement", () => {
  const controller = new EnhancementController();

  const goodStats: VideoStats = {
    meanLuma: 0.52,
    lumaStdDev: 0.20,
    highlightRatio: 0.02,
    shadowRatio: 0.03,
    sharpness: 0.45,
    noiseEstimate: 0.01,
    timestamp: 1000,
  };

  const params = controller.update(goodStats);
  assert.equal(params.brightness, 0.0);
  assert.equal(params.contrast, 1.0);
  assert.equal(params.saturation, 1.0);
  assert.equal(params.sharpen, 0.0);
});

test("PerformanceMonitor - stays healthy during normal frame processing", () => {
  let fallbackReason: string | undefined;

  const monitor = new PerformanceMonitor({
    maxProcessingMs: 12,
    maxSlowFramesThreshold: 10,
    onFallbackNeeded: (reason) => {
      fallbackReason = reason;
    },
  });

  // Record 30 fast frames (e.g. 1.5ms)
  for (let i = 0; i < 30; i++) {
    monitor.recordFrame(1.5);
  }

  const health = monitor.getHealth();
  assert.equal(health.enabled, true);
  assert.equal(health.supported, true);
  assert.ok(health.processingMs < 3.0);
  assert.equal(fallbackReason, undefined);
  monitor.destroy();
});

test("PerformanceMonitor - triggers fallback when GPU latency persistently exceeds budget", () => {
  let fallbackReason: string | undefined;

  const monitor = new PerformanceMonitor({
    maxProcessingMs: 8,
    maxSlowFramesThreshold: 5,
    onFallbackNeeded: (reason) => {
      fallbackReason = reason;
    },
  });

  // Record 6 excessively slow frames (e.g. 25ms per frame)
  for (let i = 0; i < 6; i++) {
    monitor.recordFrame(25.0);
  }

  const health = monitor.getHealth();
  assert.equal(health.enabled, false);
  assert.ok(fallbackReason !== undefined);
  assert.ok(fallbackReason.includes("High GPU latency"));
  monitor.destroy();
});

test("PerformanceMonitor - triggers fallback on WebGL context loss", () => {
  let fallbackReason: string | undefined;

  const monitor = new PerformanceMonitor({
    onFallbackNeeded: (reason) => {
      fallbackReason = reason;
    },
  });

  monitor.notifyContextLost();
  const health = monitor.getHealth();
  assert.equal(health.enabled, false);
  assert.ok(fallbackReason !== undefined);
  assert.ok(fallbackReason.includes("context was lost"));
  monitor.destroy();
});
