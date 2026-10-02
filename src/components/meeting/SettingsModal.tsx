"use client";

import { useState } from "react";
import { useMediaDeviceSelect } from "@livekit/components-react";
import { UseVideoEnhancementReturn } from "@/hooks/useVideoEnhancement";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enhancement?: UseVideoEnhancementReturn;
}

/**
 * Google Meet style Audio & Video settings modal dialog:
 * - Audio: Microphone device select, live test meter, Speaker device select with test chime
 * - Video: Camera device select, Send & Receive resolution controls, WebGL Enhancement
 */
export function SettingsModal({ isOpen, onClose, enhancement }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"audio" | "video" | "general">("audio");

  // Device selectors from LiveKit
  const {
    devices: audioInputs,
    activeDeviceId: activeAudioInput,
    setActiveMediaDevice: setActiveAudioInput,
  } = useMediaDeviceSelect({ kind: "audioinput" });

  const {
    devices: videoInputs,
    activeDeviceId: activeVideoInput,
    setActiveMediaDevice: setActiveVideoInput,
  } = useMediaDeviceSelect({ kind: "videoinput" });

  const {
    devices: audioOutputs,
    activeDeviceId: activeAudioOutput,
    setActiveMediaDevice: setActiveAudioOutput,
  } = useMediaDeviceSelect({ kind: "audiooutput" });

  const [sendResolution, setSendResolution] = useState("720p");
  const [receiveResolution, setReceiveResolution] = useState("720p");
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);

  // Play a soft test chime using Web Audio API
  const playTestChime = () => {
    try {
      setIsPlayingTestSound(true);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => setIsPlayingTestSound(false), 600);
    } catch {
      setIsPlayingTestSound(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-[#202124] rounded-2xl w-full max-w-lg border border-[#3c4043]/60 shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3c4043]/40">
          <h3 className="text-white font-medium text-lg">Settings</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#3c4043] flex items-center justify-center text-[#9aa0a6] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body with Side Tabs */}
        <div className="flex flex-1 min-h-[320px]">
          {/* Tabs Column */}
          <div className="w-36 sm:w-44 border-r border-[#3c4043]/40 p-2 space-y-1">
            <button
              onClick={() => setActiveTab("audio")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "audio"
                  ? "bg-[#3c4043] text-white"
                  : "text-[#9aa0a6] hover:text-white hover:bg-[#3c4043]/30"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              <span>Audio</span>
            </button>

            <button
              onClick={() => setActiveTab("video")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "video"
                  ? "bg-[#3c4043] text-white"
                  : "text-[#9aa0a6] hover:text-white hover:bg-[#3c4043]/30"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span>Video</span>
            </button>

            <button
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "general"
                  ? "bg-[#3c4043] text-white"
                  : "text-[#9aa0a6] hover:text-white hover:bg-[#3c4043]/30"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>General</span>
            </button>
          </div>

          {/* Tab Content Column */}
          <div className="flex-1 p-5 space-y-5 overflow-y-auto text-xs text-[#bdc1c6]">
            {activeTab === "audio" && (
              <>
                {/* Microphone Select */}
                <div className="space-y-1.5">
                  <label className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider block">
                    Microphone
                  </label>
                  <select
                    value={activeAudioInput || ""}
                    onChange={(e) => setActiveAudioInput(e.target.value)}
                    className="w-full bg-[#28292c] border border-[#3c4043] rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#8ab4f8] focus:outline-none"
                  >
                    {audioInputs.length === 0 ? (
                      <option value="">Default Microphone</option>
                    ) : (
                      audioInputs.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Speakers Select */}
                <div className="space-y-1.5">
                  <label className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider block">
                    Speakers
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={activeAudioOutput || ""}
                      onChange={(e) => setActiveAudioOutput(e.target.value)}
                      className="flex-1 bg-[#28292c] border border-[#3c4043] rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#8ab4f8] focus:outline-none"
                    >
                      {audioOutputs.length === 0 ? (
                        <option value="">Default Speakers</option>
                      ) : (
                        audioOutputs.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Speaker ${d.deviceId.slice(0, 5)}`}
                          </option>
                        ))
                      )}
                    </select>

                    <button
                      onClick={playTestChime}
                      disabled={isPlayingTestSound}
                      className="px-3.5 py-2.5 rounded-xl bg-[#3c4043] hover:bg-[#474a4d] text-white text-xs font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-[#8ab4f8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                      </svg>
                      <span>{isPlayingTestSound ? "Testing..." : "Test"}</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "video" && (
              <>
                {/* Camera Select */}
                <div className="space-y-1.5">
                  <label className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider block">
                    Camera
                  </label>
                  <select
                    value={activeVideoInput || ""}
                    onChange={(e) => setActiveVideoInput(e.target.value)}
                    className="w-full bg-[#28292c] border border-[#3c4043] rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#8ab4f8] focus:outline-none"
                  >
                    {videoInputs.length === 0 ? (
                      <option value="">Default Camera</option>
                    ) : (
                      videoInputs.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Send Resolution */}
                <div className="space-y-1.5">
                  <label className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider block">
                    Send resolution (maximum)
                  </label>
                  <select
                    value={sendResolution}
                    onChange={(e) => setSendResolution(e.target.value)}
                    className="w-full bg-[#28292c] border border-[#3c4043] rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#8ab4f8] focus:outline-none"
                  >
                    <option value="720p">High definition (720p)</option>
                    <option value="360p">Standard definition (360p)</option>
                  </select>
                </div>

                {/* Receive Resolution */}
                <div className="space-y-1.5">
                  <label className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider block">
                    Receive resolution (maximum)
                  </label>
                  <select
                    value={receiveResolution}
                    onChange={(e) => setReceiveResolution(e.target.value)}
                    className="w-full bg-[#28292c] border border-[#3c4043] rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#8ab4f8] focus:outline-none"
                  >
                    <option value="720p">High definition (720p)</option>
                    <option value="360p">Standard definition (360p)</option>
                  </select>
                </div>

                {/* Video Enhancement Section (WebGL) */}
                <div className="pt-2 border-t border-[#3c4043]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">✨</span>
                        <p className="text-white text-xs font-semibold">Video Lighting & Contrast</p>
                      </div>
                      <p className="text-[#9aa0a6] text-[11px] mt-0.5">
                        Automatically correct underexposure and soft focus using WebGL GPU
                      </p>
                    </div>
                    {enhancement && (
                      <button
                        type="button"
                        onClick={() => enhancement.toggleEnhancement()}
                        disabled={!enhancement.isSupported}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          enhancement.isEnabled ? "bg-[#8ab4f8]" : "bg-[#5f6368]"
                        } ${!enhancement.isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#202124] shadow ring-0 transition duration-200 ease-in-out ${
                            enhancement.isEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Fallback Notice */}
                  {enhancement?.fallbackReason && (
                    <div className="p-2.5 rounded-xl bg-[#fbbc04]/10 border border-[#fbbc04]/30 text-[#fbbc04] text-[11px] flex items-start gap-2">
                      <span className="text-xs">⚠️</span>
                      <div>
                        <p className="font-semibold">Raw Camera Fallback Active</p>
                        <p className="text-[#fbbc04]/80 text-[10px] mt-0.5">{enhancement.fallbackReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Live Enhancement Metrics & A/B Comparison */}
                  {enhancement?.isEnabled && !enhancement?.fallbackReason && (
                    <div className="p-3 rounded-xl bg-[#28292c] border border-[#3c4043]/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#8ab4f8] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8ab4f8] animate-pulse" />
                          Auto-Enhancement Active
                        </span>
                        <button
                          type="button"
                          onClick={() => enhancement.toggleABMode()}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                            enhancement.isABMode
                              ? "bg-[#fbbc04]/20 border-[#fbbc04] text-[#fbbc04]"
                              : "bg-[#3c4043]/40 border-[#3c4043] text-[#e8eaed] hover:bg-[#3c4043]"
                          }`}
                        >
                          {enhancement.isABMode ? "Showing Raw (A/B)" : "Test A/B Comparison"}
                        </button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-1.5 rounded-lg bg-[#202124] border border-[#3c4043]/30">
                          <span className="text-[#9aa0a6] block">Luminance / Exposure</span>
                          <span className="text-white font-medium">
                            {enhancement.stats
                              ? `${Math.round(enhancement.stats.meanLuma * 100)}% (${
                                  enhancement.stats.meanLuma < 0.35
                                    ? "Dark"
                                    : enhancement.stats.meanLuma > 0.65
                                    ? "Bright"
                                    : "Balanced"
                                })`
                              : "Analyzing..."}
                          </span>
                        </div>

                        <div className="p-1.5 rounded-lg bg-[#202124] border border-[#3c4043]/30">
                          <span className="text-[#9aa0a6] block">Contrast (StdDev)</span>
                          <span className="text-white font-medium">
                            {enhancement.stats
                              ? `${(enhancement.stats.lumaStdDev * 100).toFixed(1)}%`
                              : "Analyzing..."}
                          </span>
                        </div>

                        <div className="p-1.5 rounded-lg bg-[#202124] border border-[#3c4043]/30">
                          <span className="text-[#9aa0a6] block">Applied Corrections</span>
                          <span className="text-[#81c995] font-medium">
                            B: +{(enhancement.params.brightness * 100).toFixed(0)}% • C: x{enhancement.params.contrast.toFixed(2)} • S: +{(enhancement.params.sharpen * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="p-1.5 rounded-lg bg-[#202124] border border-[#3c4043]/30">
                          <span className="text-[#9aa0a6] block">GPU Processing</span>
                          <span className="text-white font-medium">
                            {enhancement.health.processingMs > 0
                              ? `${enhancement.health.processingMs}ms • ${enhancement.health.fps} FPS`
                              : "< 1ms • 30 FPS"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#28292c] border border-[#3c4043]/40">
                  <div>
                    <p className="font-medium text-white">Send diagnostic logs</p>
                    <p className="text-[#9aa0a6] text-[11px]">Help Google improve Meet performance</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#8ab4f8]" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#28292c] border border-[#3c4043]/40">
                  <div>
                    <p className="font-medium text-white">Keyboard shortcuts</p>
                    <p className="text-[#9aa0a6] text-[11px]">Ctrl+D (Mic) &bull; Ctrl+E (Camera)</p>
                  </div>
                  <span className="text-[#81c995] font-semibold text-[11px]">Enabled</span>
                </div>

                {/* Legal & Policy Section */}
                <div className="pt-2 border-t border-[#3c4043]/40 space-y-2">
                  <span className="text-[#9aa0a6] text-[11px] font-semibold uppercase tracking-wider block">
                    Privacy & Compliance
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#28292c] hover:bg-[#3c4043] border border-[#3c4043]/50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-white group-hover:text-[#8ab4f8] text-[11px] font-medium flex items-center gap-1">
                        Privacy Policy
                        <svg className="w-3 h-3 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </span>
                      <span className="text-[#8ab4f8] text-[10px]">&rarr;</span>
                    </a>

                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#28292c] hover:bg-[#3c4043] border border-[#3c4043]/50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-white group-hover:text-[#8ab4f8] text-[11px] font-medium flex items-center gap-1">
                        Terms of Service
                        <svg className="w-3 h-3 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </span>
                      <span className="text-[#8ab4f8] text-[10px]">&rarr;</span>
                    </a>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#28292c]/80 border border-[#3c4043]/30 text-[10px] space-y-0.5 text-[#9aa0a6]">
                    <p><strong className="text-white">Developer:</strong> Abdurahiman</p>
                    <p><strong className="text-white">Support:</strong> <a href="mailto:abdurahimanoffc@gmail.com" className="text-[#8ab4f8] hover:underline">abdurahimanoffc@gmail.com</a> &bull; <a href="tel:+919544499352" className="text-[#8ab4f8] hover:underline">+91 9544499352</a></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#3c4043]/40 bg-[#28292c]">
          <div className="flex items-center gap-2.5 text-[11px] text-[#9aa0a6]">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Privacy</a>
            <span>&bull;</span>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Terms</a>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
