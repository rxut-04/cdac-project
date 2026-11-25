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

function buildReply(userText: string): string {
  const q = userText.toLowerCase();

  if (
    q.includes("install") ||
    q.includes("windows") ||
    q.includes("linux") ||
    q.includes("mac") ||
    q.includes("setup") ||
    q.includes("command")
  ) {
    return "Super easy! On Windows PowerShell, run: irm https://velvety-druid-dccd85.netlify.app/install.ps1 | iex. Or on Linux and Mac, run: curl -fsSL https://velvety-druid-dccd85.netlify.app/install.sh | bash. You'll be ready in seconds!";
  }
  if (
    q.includes("login") ||
    q.includes("google") ||
    q.includes("token") ||
    q.includes("auth")
  ) {
    return "Just run mygit login in your terminal and enter your email and password! If you signed in with Google on the web, grab a Personal Access Token from your dashboard and paste it into mygit login. Once logged in, you're set for every repo.";
  }
  if (q.includes("push") || q.includes("repo") || q.includes("create")) {
    return "First, create your repository right from the mygit dashboard. Then link your remote with mygit remote add origin, and push cleanly using mygit push origin main!";
  }
  if (
    q.includes("pull request") ||
    q.includes("pr") ||
    q.includes("issue") ||
    q.includes("merge")
  ) {
    return "mygit handles branches, three-way merges with lowest common ancestor conflict detection, pull requests, and issue tracking — all synced seamlessly with your dashboard!";
  }
  if (
    q.includes("what is") ||
    q.includes("about") ||
    q.includes("platform") ||
    q.includes("mygit")
  ) {
    return "mygit is a byte-compatible distributed Git platform built for speed and clarity. Every SHA-1 blob, tree, and commit works with real Git tools, paired with an interactive REPL shell and modern web dashboard.";
  }
  if (
    q.includes("bye") ||
    q.includes("stop") ||
    q.includes("exit") ||
    q.includes("thanks") ||
    q.includes("thank you")
  ) {
    return "Awesome, happy coding! Click the orb anytime you want to chat.";
  }

  return "I'm listening! Ask me how to install mygit on Windows, Linux, or Mac, how to log in, or how to push your first repository.";
}

function getSupportedMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
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
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const rafRef = useRef<number | null>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);

  const stopMeter = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopRecorder = useCallback(() => {
    const rec = recorderRef.current;
    if (rec) {
      recorderRef.current = null;
      rec.ondataavailable = null;
      rec.onstop = null;
      rec.onerror = null;
      if (rec.state !== "inactive") {
        try {
          rec.stop();
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  const stopSession = useCallback(() => {
    activeRef.current = false;
    stopMeter();
    stopRecorder();

    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
      abortCtrlRef.current = null;
    }
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.onended = null;
        activeSourceRef.current.stop();
      } catch {
        // Ignore
      }
      activeSourceRef.current = null;
    }
    if (micSourceRef.current) {
      try {
        micSourceRef.current.disconnect();
      } catch {
        // Ignore
      }
      micSourceRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    setOrbState("idle");
    setStatusLabel("");
    orbRef.current?.setAudioLevel(0.15);
  }, [stopMeter, stopRecorder]);

  const runOutputMeter = useCallback(
    (analyser: AnalyserNode) => {
      stopMeter();
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!activeRef.current) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const level = Math.min(1, Math.max(0.12, avg / 105));
        orbRef.current?.setAudioLevel(level);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [stopMeter],
  );

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
      runOutputMeter(analyser);

      await new Promise<void>((resolve) => {
        source.onended = () => {
          activeSourceRef.current = null;
          stopMeter();
          resolve();
        };
        source.start(0);
      });
    },
    [runOutputMeter, stopMeter],
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
            voice_settings: {
              stability: 0.32,
              similarity_boost: 0.8,
              style: 0.55,
              use_speaker_boost: true,
            },
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

  const transcribeAudio = useCallback(
    async (blob: Blob): Promise<string> => {
      const ctrl = new AbortController();
      abortCtrlRef.current = ctrl;

      const form = new FormData();
      form.append("model_id", "scribe_v1");
      form.append("language_code", "en");
      form.append("file", blob, "voice.webm");

      const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "xi-api-key": apiKey,
        },
        body: form,
      });

      if (!res.ok) {
        throw new Error(`ElevenLabs STT failed (${res.status})`);
      }

      const data = (await res.json()) as { text?: string };
      return (data.text ?? "").trim();
    },
    [apiKey],
  );

  const startListening = useCallback(() => {
    if (!activeRef.current || !micStreamRef.current || !audioCtxRef.current) return;

    stopMeter();
    stopRecorder();

    setOrbState("listening");
    setStatusLabel("Listening");

    const stream = micStreamRef.current;
    const ctx = audioCtxRef.current;

    if (!micSourceRef.current) {
      micSourceRef.current = ctx.createMediaStreamSource(stream);
    }
    const micAnalyser = ctx.createAnalyser();
    micAnalyser.fftSize = 512;
    micSourceRef.current.connect(micAnalyser);

    const mimeType = getSupportedMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;

    const chunks: BlobPart[] = [];
    let hasSpoken = false;
    let speechStartMs = 0;
    let lastSpeechMs = performance.now();
    const recordStartMs = performance.now();
    let finishing = false;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      stopMeter();
      if (!activeRef.current) return;

      if (!hasSpoken || chunks.length === 0) {
        // No speech detected in window; seamlessly start a fresh listening window
        startListening();
        return;
      }

      const audioBlob = new Blob(chunks, { type: mimeType || "audio/webm" });
      if (audioBlob.size < 1500) {
        startListening();
        return;
      }

      void (async () => {
        try {
          setOrbState("thinking");
          setStatusLabel("Thinking");
          const transcript = await transcribeAudio(audioBlob);
          if (!activeRef.current) return;

          if (!transcript || transcript.replace(/[^\w]/g, "").length < 2) {
            startListening();
            return;
          }

          const reply = buildReply(transcript);
          const shouldEndAfter = /\b(bye|goodbye|stop|exit|quit)\b/i.test(
            transcript,
          );

          await speakWithElevenLabs(reply);
          if (!activeRef.current) return;

          if (shouldEndAfter) {
            stopSession();
          } else {
            startListening();
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          console.error("Voice turn error:", err);
          if (activeRef.current) {
            startListening();
          }
        }
      })();
    };

    recorder.start(200);

    // Voice Activity Detection + live mic orb animation loop
    const timeData = new Uint8Array(micAnalyser.fftSize);
    const SPEECH_THRESHOLD = 0.02;
    const SILENCE_HANGOVER_MS = 1200;
    const MAX_UTTERANCE_MS = 10000;
    const IDLE_ROLLOVER_MS = 15000;

    const vadTick = () => {
      if (!activeRef.current || finishing || recorderRef.current !== recorder) return;

      micAnalyser.getByteTimeDomainData(timeData);
      let sumSq = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / timeData.length);
      orbRef.current?.setAudioLevel(Math.min(1, Math.max(0.12, rms * 6)));

      const now = performance.now();
      if (rms > SPEECH_THRESHOLD) {
        if (!hasSpoken) {
          hasSpoken = true;
          speechStartMs = now;
        }
        lastSpeechMs = now;
      }

      const shouldStopAfterSpeech =
        hasSpoken &&
        (now - lastSpeechMs > SILENCE_HANGOVER_MS ||
          now - speechStartMs > MAX_UTTERANCE_MS);
      const shouldRolloverIdle =
        !hasSpoken && now - recordStartMs > IDLE_ROLLOVER_MS;

      if (shouldStopAfterSpeech || shouldRolloverIdle) {
        finishing = true;
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(vadTick);
    };

    rafRef.current = requestAnimationFrame(vadTick);
  }, [
    stopMeter,
    stopRecorder,
    transcribeAudio,
    speakWithElevenLabs,
    stopSession,
  ]);

  const startSession = async () => {
    try {
      activeRef.current = true;
      setOrbState("thinking");
      setStatusLabel("Connecting...");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
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
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const res = await fetch("/mygit_agent_speech.mp3");
      if (!res.ok) throw new Error("Failed to load greeting audio");
      const buf = await res.arrayBuffer();
      await playAudioBuffer(buf);

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
        aria-label={
          statusLabel
            ? `Voice assistant: ${statusLabel}`
            : "Start voice conversation"
        }
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
