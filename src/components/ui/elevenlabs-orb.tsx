"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  LiquidGlassOrb,
  type LiquidGlassOrbHandle,
  type LiquidGlassOrbState,
} from "@/components/liquid-glass-orb";

export interface ElevenLabsOrbProps {
  apiKey?: string;
  voiceId?: string;
  className?: string;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
    length: number;
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function buildReply(userText: string): string {
  const q = userText.toLowerCase();

  if (q.includes("install") || q.includes("windows") || q.includes("linux") || q.includes("mac") || q.includes("setup")) {
    return "To install mygit on Windows PowerShell, run: irm https://velvety-druid-dccd85.netlify.app/install.ps1 | iex. On Linux or macOS, run: curl -fsSL https://velvety-druid-dccd85.netlify.app/install.sh | bash.";
  }
  if (q.includes("login") || q.includes("google") || q.includes("token") || q.includes("auth")) {
    return "Run mygit login in your terminal and enter your email and password. If you signed in with Google on the web, generate a Personal Access Token from your dashboard and use mygit login with your token. You only need to log in once per machine.";
  }
  if (q.includes("push") || q.includes("repo") || q.includes("create")) {
    return "First create your repository from the mygit dashboard, then run mygit remote add origin followed by your repository URL, and push with mygit push origin main.";
  }
  if (q.includes("pull request") || q.includes("pr") || q.includes("issue") || q.includes("merge")) {
    return "mygit supports branches, three-way merge with lowest common ancestor conflict detection, pull requests, and issue tracking directly from your repository dashboard.";
  }
  if (q.includes("what is") || q.includes("about") || q.includes("platform") || q.includes("mygit")) {
    return "mygit is a byte-compatible distributed Git platform. It stores standard SHA-1 blobs, trees, and commits that work with genuine Git tools, paired with an interactive REPL shell and web dashboard.";
  }
  if (q.includes("bye") || q.includes("stop") || q.includes("exit") || q.includes("thanks") || q.includes("thank you")) {
    return "Happy coding! Click the orb anytime if you need help with mygit.";
  }

  return "You can ask me how to install mygit on Windows, Linux, or Mac, how to authenticate with mygit login, or how to create and push your first repository.";
}

export function ElevenLabsOrb({
  apiKey = "sk_73579988aac7e4e1d130566fab67bf2e94f1f6edb6032b14",
  voiceId = "cBTYF7NiJbR8Bvmdeuse",
  className = "",
}: ElevenLabsOrbProps) {
  const [orbState, setOrbState] = useState<LiquidGlassOrbState>("idle");
  const [statusLabel, setStatusLabel] = useState<string>("");

  const orbRef = useRef<LiquidGlassOrbHandle>(null);
  const activeRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const rafRef = useRef<number | null>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);

  const stopMeter = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const runAnalyserMeter = useCallback(
    (analyser: AnalyserNode) => {
      stopMeter();
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!activeRef.current) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const level = Math.min(1, Math.max(0.12, avg / 110));
        orbRef.current?.setAudioLevel(level);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [stopMeter],
  );

  const stopSession = useCallback(() => {
    activeRef.current = false;
    stopMeter();

    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
      abortCtrlRef.current = null;
    }
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.onended = null;
        activeSourceRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      activeSourceRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    setOrbState("idle");
    setStatusLabel("");
    orbRef.current?.setAudioLevel(0.15);
  }, [stopMeter]);

  const playAudioBuffer = useCallback(
    async (arrayBuffer: ArrayBuffer): Promise<void> => {
      if (!activeRef.current || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      const decoded = await ctx.decodeAudioData(arrayBuffer);
      if (!activeRef.current) return;

      const source = ctx.createBufferSource();
      source.buffer = decoded;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.78;

      source.connect(analyser);
      analyser.connect(ctx.destination);
      activeSourceRef.current = source;

      setOrbState("speaking");
      setStatusLabel("Speaking");
      runAnalyserMeter(analyser);

      await new Promise<void>((resolve) => {
        source.onended = () => {
          activeSourceRef.current = null;
          stopMeter();
          resolve();
        };
        source.start(0);
      });
    },
    [runAnalyserMeter, stopMeter],
  );

  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      if (!activeRef.current) return;
      setOrbState("thinking");
      setStatusLabel("Thinking");

      const ctrl = new AbortController();
      abortCtrlRef.current = ctrl;

      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_flash_v2_5",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`ElevenLabs TTS failed (${res.status})`);
      }

      const buf = await res.arrayBuffer();
      await playAudioBuffer(buf);
    },
    [apiKey, voiceId, playAudioBuffer],
  );

  const startListening = useCallback(() => {
    if (!activeRef.current) return;

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    // Drive orb with live microphone volume while listening
    if (micStreamRef.current && audioCtxRef.current) {
      try {
        const micSource = audioCtxRef.current.createMediaStreamSource(micStreamRef.current);
        const micAnalyser = audioCtxRef.current.createAnalyser();
        micAnalyser.fftSize = 128;
        micSource.connect(micAnalyser);
        runAnalyserMeter(micAnalyser);
      } catch {
        // Fallback if stream analyser fails
      }
    }

    if (!SpeechRecognitionCtor) {
      // Browser doesn't support SpeechRecognition; stay idle after speaking
      stopSession();
      return;
    }

    setOrbState("listening");
    setStatusLabel("Listening");

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    let handledResult = false;

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (!last || !last.isFinal) return;
      const transcript = last[0]?.transcript?.trim();
      if (!transcript || !activeRef.current) return;

      handledResult = true;
      try {
        recognition.stop();
      } catch {
        // Ignore
      }

      const reply = buildReply(transcript);
      const shouldEndAfter =
        /\b(bye|goodbye|stop|exit|quit)\b/i.test(transcript);

      void (async () => {
        try {
          await speakWithElevenLabs(reply);
          if (!activeRef.current) return;
          if (shouldEndAfter) {
            stopSession();
          } else {
            startListening();
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          console.error("ElevenLabs reply error:", err);
          stopSession();
        }
      })();
    };

    recognition.onerror = (event) => {
      if (!activeRef.current) return;
      if (event.error === "no-speech" && !handledResult) {
        // Restart listening silently if user paused
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        stopSession();
        setOrbState("error");
        setStatusLabel("Mic blocked");
        setTimeout(() => {
          setOrbState("idle");
          setStatusLabel("");
        }, 2500);
      }
    };

    recognition.onend = () => {
      if (!activeRef.current || handledResult) return;
      // Continue listening seamlessly until user stops or speaks
      try {
        recognition.start();
      } catch {
        // Ignore if already started
      }
    };

    try {
      recognition.start();
    } catch {
      // Ignore start race
    }
  }, [runAnalyserMeter, speakWithElevenLabs, stopSession]);

  const startSession = async () => {
    try {
      activeRef.current = true;
      setOrbState("thinking");
      setStatusLabel("Connecting...");

      // Request microphone permission for two-way voice
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!activeRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStreamRef.current = stream;
      } catch (micErr) {
        const name = (micErr as Error)?.name;
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          activeRef.current = false;
          setOrbState("error");
          setStatusLabel("Mic blocked");
          setTimeout(() => {
            setOrbState("idle");
            setStatusLabel("");
          }, 2500);
          return;
        }
        // If no physical mic device exists, continue with one-way voice greeting
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      // Play cached ElevenLabs greeting generated with voiceId for instant response
      const res = await fetch("/mygit_agent_speech.mp3");
      if (!res.ok) throw new Error("Failed to load greeting audio");
      const buf = await res.arrayBuffer();
      await playAudioBuffer(buf);

      // Transition into two-way listening if still active and mic available
      if (activeRef.current) {
        if (micStreamRef.current) {
          startListening();
        } else {
          stopSession();
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("ElevenLabs session error:", err);
      stopSession();
      setOrbState("error");
      setStatusLabel("Error");
      setTimeout(() => {
        setOrbState("idle");
        setStatusLabel("");
      }, 2500);
    }
  };

  const handleClick = () => {
    if (activeRef.current) {
      stopSession();
    } else {
      void startSession();
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopSession]);

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {statusLabel && (
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 select-none whitespace-nowrap">
          {statusLabel}
        </span>
      )}

      <button
        type="button"
        onClick={handleClick}
        className="relative p-0.5 rounded-full cursor-pointer focus:outline-hidden hover:scale-105 active:scale-95 transition-transform select-none"
        title={activeRef.current ? "Click to stop" : "Click to talk with mygit"}
        aria-label={statusLabel ? `Voice assistant: ${statusLabel}` : "Start voice conversation"}
      >
        <div className="relative w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full overflow-hidden flex items-center justify-center bg-neutral-950 shrink-0">
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
            audioLevel={0.15}
            className="!w-full !h-full"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </button>
    </div>
  );
}
