"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { LiquidGlassOrb, type LiquidGlassOrbHandle, type LiquidGlassOrbState } from "@/components/liquid-glass-orb";
import { Volume2, VolumeX, Copy, Check, Terminal, Sparkles, X } from "lucide-react";

export interface ElevenLabsOrbProps {
  apiKey?: string;
  agentId?: string;
  className?: string;
}

export function ElevenLabsOrb({
  apiKey = "sk_73579988aac7e4e1d130566fab67bf2e94f1f6edb6032b14",
  agentId = "cBTYF7NiJbR8Bvmdeuse",
  className = "",
}: ElevenLabsOrbProps) {
  const [orbState, setOrbState] = useState<LiquidGlassOrbState>("idle");
  const [audioLevel, setAudioLevel] = useState<number>(0.15);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showBubble, setShowBubble] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const orbRef = useRef<LiquidGlassOrbHandle>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const winCmd = "irm https://velvety-druid-dccd85.netlify.app/install.ps1 | iex";
  const linuxCmd = "curl -fsSL https://velvety-druid-dccd85.netlify.app/install.sh | bash";

  const copyToClipboard = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
    setOrbState("idle");
    setAudioLevel(0.15);
    orbRef.current?.setAudioLevel(0.15);
  }, []);

  const startVoice = async () => {
    try {
      setOrbState("thinking");
      setShowBubble(true);

      // Lazy initialize AudioContext & audio element
      if (!audioRef.current) {
        const audio = new Audio("/mygit_agent_speech.mp3");
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        audio.onended = () => {
          stopAudio();
          setTimeout(() => setShowBubble(false), 3000);
        };
      }

      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }

      if (audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }

      await audioRef.current.play();
      setIsPlaying(true);
      setOrbState("speaking");

      // Real-time audio waveform visualizer loop driving the LiquidGlassOrb
      const analyser = analyserRef.current;
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          // Normalize to 0.1 .. 0.95 range for vivid liquid orb waves
          const normalized = Math.min(1.0, Math.max(0.1, average / 128.0));
          setAudioLevel(normalized);
          orbRef.current?.setAudioLevel(normalized);

          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      }
    } catch (err) {
      console.error("ElevenLabs audio play error:", err);
      stopAudio();
    }
  };

  const toggleVoice = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startVoice();
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Orb Trigger Button */}
      <button
        type="button"
        onClick={toggleVoice}
        className="relative group p-0.5 rounded-full cursor-pointer focus:outline-hidden hover:scale-105 active:scale-95 transition-all select-none"
        title={isPlaying ? "Mute ElevenLabs Voice Agent" : "Listen to mygit Voice Agent (ElevenLabs)"}
        aria-label="ElevenLabs AI Voice Assistant"
      >
        <div
          className={`relative w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full overflow-hidden flex items-center justify-center shadow-xs transition-all ${
            isPlaying
              ? "ring-2 ring-[#c8ff29] dark:ring-[#b8ff3c] shadow-[0_0_15px_rgba(184,255,60,0.4)]"
              : "border border-neutral-300/80 dark:border-neutral-700/80 hover:border-neutral-400 dark:hover:border-neutral-600"
          } bg-neutral-950 shrink-0`}
        >
          <LiquidGlassOrb
            ref={orbRef}
            baseColor="#ffffff"
            colorA="#000000"
            colorB="#4d4d4d"
            colorC="#a9a9a9"
            seed={145}
            startTime={18}
            speed={1.5}
            distortion={0.8}
            clusterCount={7.2}
            clusterIntensity={3}
            clusterSize={22.5}
            scale={0.23}
            spotSize={1.15}
            rotation={0}
            softness={0.31}
            relief={2.94}
            refraction={0.65}
            roughness={0}
            reflection={1.3}
            caustics={0}
            dispersion={1}
            colorDistribution={0}
            grain={0.3}
            grainSize={1}
            paused={false}
            animateDistortion={true}
            grainMode="fine"
            flowType="drift"
            state={orbState}
            thinkingAnimation="ripples"
            searchingAnimation="lens"
            preserveWhites={true}
            animateEntrance={true}
            size={38}
            audioLevel={audioLevel}
            className="!w-full !h-full"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Center Voice Icon Indicator when playing */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[0.5px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8ff3c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8ff29]"></span>
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Floating Interactive Speech Popover */}
      {showBubble && (
        <div className="absolute right-0 top-12 z-50 w-[310px] sm:w-[350px] p-3.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#7db510] dark:text-[#b8ff3c]" />
              <span className="text-xs font-bold text-neutral-950 dark:text-white tracking-tight">
                mygit AI Voice Assistant
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-[#c8ff29]/20 dark:bg-[#b8ff3c]/20 text-[#608d0a] dark:text-[#b8ff3c] font-semibold">
                ElevenLabs
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowBubble(false)}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
            {isPlaying
              ? "Speaking about mygit byte compatibility, parallel packfile indexing, and how to install the CLI directly on your laptop..."
              : "Click the orb anytime to listen to the overview and quick installation commands."}
          </p>

          <div className="space-y-2">
            {/* Windows Command */}
            <div className="flex flex-col gap-1 p-2 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Windows PowerShell
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(winCmd, "win")}
                  className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  {copiedCmd === "win" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-[10px] font-mono text-neutral-900 dark:text-neutral-100 truncate select-all bg-white/70 dark:bg-neutral-950/70 p-1.5 rounded-md border border-neutral-200/50 dark:border-neutral-800/50">
                {winCmd}
              </code>
            </div>

            {/* Linux / macOS Command */}
            <div className="flex flex-col gap-1 p-2 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Linux & macOS
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(linuxCmd, "linux")}
                  className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  {copiedCmd === "linux" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-[10px] font-mono text-neutral-900 dark:text-neutral-100 truncate select-all bg-white/70 dark:bg-neutral-950/70 p-1.5 rounded-md border border-neutral-200/50 dark:border-neutral-800/50">
                {linuxCmd}
              </code>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
            <button
              type="button"
              onClick={toggleVoice}
              className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-rose-500 font-bold">Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#7db510] dark:text-[#b8ff3c]" />
                  <span>Play Intro Again</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-neutral-400 font-mono">
              Agent: {agentId.slice(0, 8)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
