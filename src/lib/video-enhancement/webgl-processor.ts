/**
 * WebGL Video Processor
 *
 * Implements GPU-accelerated per-pixel video enhancement via a fragment shader:
 * - Brightness, Contrast, Saturation, and Unsharp Mask Sharpening
 * - Reusable textures and buffers (zero per-frame allocations)
 * - Zero CPU readbacks (NO readPixels/getImageData in the render loop)
 * - Outputs a high-performance MediaStreamTrack via canvas.captureStream()
 * - Supports requestVideoFrameCallback with requestAnimationFrame fallback
 * - Handles WebGL context loss gracefully
 */

import { EnhancementParams, BASELINE_ENHANCEMENT_PARAMS } from "./types";

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_sharpen;

varying vec2 v_texCoord;

void main() {
  vec4 center = texture2D(u_image, v_texCoord);
  vec3 rgb = center.rgb;

  // 1. Mild Unsharp Masking (only if sharpening > 0.001)
  if (u_sharpen > 0.001) {
    vec2 onePixel = vec2(1.0, 1.0) / u_resolution;
    vec3 left   = texture2D(u_image, v_texCoord - vec2(onePixel.x, 0.0)).rgb;
    vec3 right  = texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)).rgb;
    vec3 top    = texture2D(u_image, v_texCoord - vec2(0.0, onePixel.y)).rgb;
    vec3 bottom = texture2D(u_image, v_texCoord + vec2(0.0, onePixel.y)).rgb;

    // 4-point discrete 2D Laplacian kernel
    vec3 laplacian = (center.rgb * 4.0) - (left + right + top + bottom);
    rgb = rgb + (laplacian * u_sharpen);
  }

  // 2. Brightness adjustment (additive offset)
  rgb = rgb + vec3(u_brightness);

  // 3. Contrast adjustment (scaled around midpoint 0.5)
  rgb = (rgb - vec3(0.5)) * u_contrast + vec3(0.5);

  // 4. Saturation adjustment (perceptual BT.709 luma mix)
  float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  rgb = mix(vec3(luma), rgb, u_saturation);

  // Strict clamp to valid RGB range [0.0, 1.0]
  gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), center.a);
}
`;

export class WebGLVideoProcessor {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  // Shader Uniform Locations
  private uImageLoc: WebGLUniformLocation | null = null;
  private uResLoc: WebGLUniformLocation | null = null;
  private uBrightnessLoc: WebGLUniformLocation | null = null;
  private uContrastLoc: WebGLUniformLocation | null = null;
  private uSaturationLoc: WebGLUniformLocation | null = null;
  private uSharpenLoc: WebGLUniformLocation | null = null;

  // State
  private width = 1280;
  private height = 720;
  private isRunning = false;
  private videoElement: HTMLVideoElement | null = null;
  private processedTrack: MediaStreamTrack | null = null;
  private currentParams: EnhancementParams = { ...BASELINE_ENHANCEMENT_PARAMS };
  private rVFCId: number | null = null;
  private rAFId: number | null = null;

  // Diagnostics callback
  public onFrameProcessed?: (durationMs: number) => void;
  public onContextLost?: () => void;

  public static isSupported(): boolean {
    if (typeof document === "undefined") return false;
    try {
      const c = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl")) &&
        typeof c.captureStream === "function"
      );
    } catch {
      return false;
    }
  }

  /**
   * Initializes WebGL context, shaders, buffers, and texture.
   */
  public init(videoElement: HTMLVideoElement, width = 1280, height = 720): boolean {
    this.videoElement = videoElement;
    this.width = width;
    this.height = height;

    try {
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      const gl =
        this.canvas.getContext("webgl", {
          alpha: false,
          depth: false,
          stencil: false,
          antialias: false,
          preserveDrawingBuffer: false,
          powerPreference: "default",
        }) ||
        (this.canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

      if (!gl) {
        return false;
      }
      this.gl = gl;

      // Handle context lost
      this.canvas.addEventListener(
        "webglcontextlost",
        (e) => {
          e.preventDefault();
          this.isRunning = false;
          this.onContextLost?.();
        },
        false
      );

      // Create shaders & program
      const vertShader = this.createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
      const fragShader = this.createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
      if (!vertShader || !fragShader) return false;

      const program = gl.createProgram();
      if (!program) return false;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("WebGL program link failed:", gl.getProgramInfoLog(program));
        return false;
      }
      this.program = program;
      gl.useProgram(program);

      // Uniform Locations
      this.uImageLoc = gl.getUniformLocation(program, "u_image");
      this.uResLoc = gl.getUniformLocation(program, "u_resolution");
      this.uBrightnessLoc = gl.getUniformLocation(program, "u_brightness");
      this.uContrastLoc = gl.getUniformLocation(program, "u_contrast");
      this.uSaturationLoc = gl.getUniformLocation(program, "u_saturation");
      this.uSharpenLoc = gl.getUniformLocation(program, "u_sharpen");

      // Set Resolution
      gl.uniform2f(this.uResLoc, this.width, this.height);
      this.applyUniforms(this.currentParams);

      // Fullscreen Quad Geometry (2 Triangles)
      const aPositionLoc = gl.getAttribLocation(program, "a_position");
      this.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      // Positions: [-1,-1] to [1,1]
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
           1.0,  1.0,
        ]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(aPositionLoc);
      gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

      // Texture Coordinates (Y flipped to match HTML video top-down coords)
      const aTexCoordLoc = gl.getAttribLocation(program, "a_texCoord");
      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          0.0, 1.0,
          1.0, 1.0,
          0.0, 0.0,
          0.0, 0.0,
          1.0, 1.0,
          1.0, 0.0,
        ]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(aTexCoordLoc);
      gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);

      // Reusable 2D Texture
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Viewport setup
      gl.viewport(0, 0, this.width, this.height);

      // Capture output stream at 30 fps
      const stream = this.canvas.captureStream(30);
      const tracks = stream.getVideoTracks();
      if (!tracks || tracks.length === 0) {
        return false;
      }
      this.processedTrack = tracks[0];

      // Start the rendering loop
      this.isRunning = true;
      this.scheduleNextFrame();

      return true;
    } catch (err) {
      console.error("WebGL Video Processor init error:", err);
      return false;
    }
  }

  /**
   * Updates shader uniforms.
   */
  public setParams(params: EnhancementParams): void {
    this.currentParams = { ...params };
    if (this.gl && this.program) {
      this.gl.useProgram(this.program);
      this.applyUniforms(this.currentParams);
    }
  }

  public getProcessedTrack(): MediaStreamTrack | null {
    return this.processedTrack;
  }

  private applyUniforms(p: EnhancementParams): void {
    if (!this.gl) return;
    this.gl.uniform1f(this.uBrightnessLoc, p.brightness);
    this.gl.uniform1f(this.uContrastLoc, p.contrast);
    this.gl.uniform1f(this.uSaturationLoc, p.saturation);
    this.gl.uniform1f(this.uSharpenLoc, p.sharpen);
  }

  private scheduleNextFrame = (): void => {
    if (!this.isRunning) return;

    const el = this.videoElement as (HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: (now: number, metadata: Record<string, unknown>) => void) => number;
    }) | null;

    if (el && typeof el.requestVideoFrameCallback === "function") {
      this.rVFCId = el.requestVideoFrameCallback(this.onVideoFrame);
    } else {
      this.rAFId = requestAnimationFrame(this.onAnimationFrame);
    }
  };

  private onVideoFrame = (): void => {
    this.renderFrame();
    this.scheduleNextFrame();
  };

  private onAnimationFrame = (): void => {
    this.renderFrame();
    this.scheduleNextFrame();
  };

  /**
   * Renders single video frame through WebGL shader.
   * Runs strictly on GPU with no CPU readbacks.
   */
  private renderFrame(): void {
    if (!this.gl || !this.videoElement || this.videoElement.readyState < 2) {
      return;
    }

    const start = performance.now();
    const gl = this.gl;

    try {
      // 1. Upload video frame to preallocated texture
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.videoElement
      );

      // 2. Draw Quad (executes vertex + fragment shaders)
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const duration = performance.now() - start;
      this.onFrameProcessed?.(duration);
    } catch {
      // Ignore transient errors when frame isn't ready
    }
  }

  private createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public destroy(): void {
    this.isRunning = false;

    const el = this.videoElement as (HTMLVideoElement & {
      cancelVideoFrameCallback?: (id: number) => void;
    }) | null;

    if (this.rVFCId !== null && el && typeof el.cancelVideoFrameCallback === "function") {
      el.cancelVideoFrameCallback(this.rVFCId);
      this.rVFCId = null;
    }
    if (this.rAFId !== null) {
      cancelAnimationFrame(this.rAFId);
      this.rAFId = null;
    }

    if (this.processedTrack) {
      this.processedTrack.stop();
      this.processedTrack = null;
    }

    if (this.gl) {
      if (this.texture) this.gl.deleteTexture(this.texture);
      if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
      if (this.texCoordBuffer) this.gl.deleteBuffer(this.texCoordBuffer);
      if (this.program) this.gl.deleteProgram(this.program);
      this.gl = null;
    }

    this.canvas = null;
    this.videoElement = null;
  }
}
