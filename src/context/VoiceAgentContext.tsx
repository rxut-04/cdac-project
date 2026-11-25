import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { AGENT_ID } from "@/lib/elevenlabs";
import type { LiquidGlassOrbState } from "@/components/liquid-glass-orb";

export const MAX_CREDITS = 1000;
const STORAGE_KEY = "mygit_voice_credits_used";
const RESET_TIMESTAMP_KEY = "mygit_voice_credits_last_reset";

export const RATE_LIMIT_TONES = [
  {
    id: "polite",
    toneName: "Warm & Apologetic",
    message:
      "Oh, so sorry! We just hit our 1,000 credit demo limit for today, but I had a great time chatting with you! Feel free to copy the mygit install command right on the page and start pushing!",
    shortText: "Demo capped (1k)",
    audioUrl: "/audio/rate-limit-polite.mp3",
    pitch: 1.05,
    rate: 1.05,
  },
  {
    id: "playful",
    toneName: "Playful & Friendly Apology",
    message:
      "Oops, my bad! Looks like our 1,000 credit demo quota just maxed out! I would love to keep talking, but go ahead and install mygit on your laptop and try it out!",
    shortText: "Demo maxed (1k)",
    audioUrl: "/audio/rate-limit-playful.mp3",
    pitch: 1.15,
    rate: 1.06,
  },
  {
    id: "professional",
    toneName: "Polite & Gracious Apology",
    message:
      "So sorry about that! Our interactive demo credits just ran out for this session, but you were wonderful to talk to! Explore the mygit dashboard and documentation anytime.",
    shortText: "Credits used (1k)",
    audioUrl: "/audio/rate-limit-professional.mp3",
    pitch: 1.0,
    rate: 1.02,
  },
  {
    id: "casual",
    toneName: "Casual & Warm Apology",
    message:
      "Aww, sorry to cut our chat short, but that wraps up our 1,000 credit voice demo! Check out everything mygit can do right below.",
    shortText: "1k limit reached",
    audioUrl: "/audio/rate-limit-casual.mp3",
    pitch: 1.04,
    rate: 1.04,
  },
  {
    id: "architect",
    toneName: "Enthusiastic Blueprint Apology",
    message:
      "Looks like we just touched our 1,000 credit session ceiling! You can explore all of mygit byte-compatible Git features right here on the platform.",
    shortText: "Session limit (1k)",
    audioUrl: "/audio/rate-limit-architect.mp3",
    pitch: 1.02,
    rate: 1.05,
  },
  {
    id: "enthusiastic",
    toneName: "Energetic & Cheerful Apology",
    message:
      "Oh no, our 1,000 credit demo limit has officially been reached! Thank you so much for chatting with me today — happy coding with mygit!",
    shortText: "Thanks! (1k limit)",
    audioUrl: "/audio/rate-limit-enthusiastic.mp3",
    pitch: 1.12,
    rate: 1.08,
  },
];

let lastToneIndex = -1;

export function getNextRateLimitTone() {
  let nextIndex: number;
  do {
    nextIndex = Math.floor(Math.random() * RATE_LIMIT_TONES.length);
  } while (nextIndex === lastToneIndex && RATE_LIMIT_TONES.length > 1);
  lastToneIndex = nextIndex;
  return RATE_LIMIT_TONES[nextIndex];
}

function getStoredCredits(): number {
  if (typeof window === "undefined") return 0;
  try {
    const lastReset = parseInt(localStorage.getItem(RESET_TIMESTAMP_KEY) || "0", 10);
    const now = Date.now();
    if (!lastReset || now - lastReset > 24 * 60 * 60 * 1000) {
      localStorage.setItem(STORAGE_KEY, "0");
      localStorage.setItem(RESET_TIMESTAMP_KEY, now.toString());
      return 0;
    }
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function saveStoredCredits(credits: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, Math.round(credits).toString());
  } catch {
    // Ignore storage errors
  }
}

interface VoiceAgentContextValue {
  isActivated: boolean;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  currentState: LiquidGlassOrbState;
  stateLabel: string;
  errorMessage: string | null;
  isSpeaking: boolean;
  audioLevel: number;
  usedCredits: number;
  remainingCredits: number;
  maxCredits: number;
  isRateLimited: boolean;
  isLocalLimitMode: boolean;
  currentToneNotice: string | null;
  resetCredits: () => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(null);

function VoiceAgentProviderInner({ children }: { children: React.ReactNode }) {
  const [isActivated, setIsActivated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usedCredits, setUsedCredits] = useState(getStoredCredits);
  const [isRateLimited, setIsRateLimited] = useState(
    () => getStoredCredits() >= MAX_CREDITS,
  );
  const [currentToneNotice, setCurrentToneNotice] = useState<string | null>(null);

  const [isLocalLimitMode, setIsLocalLimitMode] = useState(false);
  const [localIsSpeaking, setLocalIsSpeaking] = useState(false);
  const [localAudioLevel, setLocalAudioLevel] = useState(0.42);
  const [liveAudioLevel, setLiveAudioLevel] = useState(0.42);

  const pendingCutoffRef = useRef(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const vadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLocalSpeakingRef = useRef(false);

  const stopActiveAudio = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {
        // Ignore
      }
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const cleanupLocalAudio = useCallback(() => {
    stopActiveAudio();
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    isLocalSpeakingRef.current = false;
    setLocalIsSpeaking(false);
    setIsLocalLimitMode(false);
  }, [stopActiveAudio]);

  const resetCredits = useCallback(() => {
    cleanupLocalAudio();
    saveStoredCredits(0);
    setUsedCredits(0);
    setIsRateLimited(false);
    setErrorMessage(null);
    setCurrentToneNotice(null);
    pendingCutoffRef.current = false;
  }, [cleanupLocalAudio]);

  const startLocalAssistantLoop = useCallback(
    async (initialTone?: (typeof RATE_LIMIT_TONES)[number]) => {
      cleanupLocalAudio();
      setIsLocalLimitMode(true);
      setIsActivated(true);

      const toneToSpeak = initialTone || getNextRateLimitTone();
      setCurrentToneNotice(toneToSpeak.shortText);
      setErrorMessage(null);

      const fallbackSpeak = (tone: (typeof RATE_LIMIT_TONES)[number]) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          setLocalIsSpeaking(false);
          isLocalSpeakingRef.current = false;
          return;
        }
        const utterance = new SpeechSynthesisUtterance(tone.message);
        utterance.pitch = tone.pitch;
        utterance.rate = tone.rate;
        utterance.onend = () => {
          setLocalIsSpeaking(false);
          isLocalSpeakingRef.current = false;
          setLocalAudioLevel(0.42);
        };
        utterance.onerror = () => {
          setLocalIsSpeaking(false);
          isLocalSpeakingRef.current = false;
          setLocalAudioLevel(0.42);
        };
        window.speechSynthesis.speak(utterance);
      };

      const triggerToneResponse = (
        specificTone?: (typeof RATE_LIMIT_TONES)[number],
      ) => {
        stopActiveAudio();
        const tone = specificTone || getNextRateLimitTone();
        setCurrentToneNotice(tone.shortText);

        setLocalIsSpeaking(true);
        isLocalSpeakingRef.current = true;

        try {
          const audio = new Audio(tone.audioUrl);
          activeAudioRef.current = audio;

          audio.onended = () => {
            setLocalIsSpeaking(false);
            isLocalSpeakingRef.current = false;
            setLocalAudioLevel(0.42);
            activeAudioRef.current = null;
          };

          audio.onerror = () => {
            fallbackSpeak(tone);
          };

          audio.play().catch(() => {
            fallbackSpeak(tone);
          });
        } catch {
          fallbackSpeak(tone);
        }
      };

      triggerToneResponse(toneToSpeak);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let hasSpoken = false;
        let silenceStart = 0;

        vadIntervalRef.current = setInterval(() => {
          if (isLocalSpeakingRef.current) {
            setLocalAudioLevel(0.72 + Math.random() * 0.18);
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;

          const normalizedVol = Math.min(1, Math.max(0.38, avg / 55));
          setLocalAudioLevel(normalizedVol);

          if (avg > 18) {
            hasSpoken = true;
            silenceStart = 0;
          } else if (hasSpoken) {
            if (silenceStart === 0) {
              silenceStart = Date.now();
            } else if (Date.now() - silenceStart > 1100) {
              hasSpoken = false;
              silenceStart = 0;
              triggerToneResponse();
            }
          }
        }, 50);
      } catch (err) {
        console.warn("Local mic VAD setup warning:", err);
      }
    },
    [cleanupLocalAudio, stopActiveAudio],
  );

  const conversation = useConversation({
    onConnect: () => {
      setErrorMessage(null);
      try {
        conversation.sendContextualUpdate(
          "The user is on mygit — a byte-compatible distributed Git platform. If they ask how to install mygit, tell them Windows PowerShell: irm https://velvety-druid-dccd85.netlify.app/install.ps1 | iex, or Linux/macOS: curl -fsSL https://velvety-druid-dccd85.netlify.app/install.sh | bash. Keep your tone calm, warm, and energetic.",
        );
      } catch {
        // Ignore if contextual update isn't ready
      }
    },
    onDisconnect: () => {
      if (!pendingCutoffRef.current && !isLocalLimitMode) {
        setIsActivated(false);
      }
    },
    onMessage: (payload) => {
      const msg = payload as {
        source?: string;
        role?: string;
        message?: string;
      };
      const isAi = msg?.source === "ai" || msg?.role === "agent";
      if (isAi && msg?.message) {
        const charCount = msg.message.length;
        setUsedCredits((prev) => {
          const updated = prev + charCount;
          saveStoredCredits(updated);
          if (updated >= MAX_CREDITS) {
            setIsRateLimited(true);
            pendingCutoffRef.current = true;
          }
          return updated;
        });
      }
    },
    onError: (err) => {
      console.warn("ElevenLabs conversation warning/error:", err);
    },
  });

  // Live audio envelope polling from @elevenlabs/react conversation
  useEffect(() => {
    if (!isActivated || isLocalLimitMode) return;
    const id = setInterval(() => {
      try {
        const vol = conversation.isSpeaking
          ? conversation.getOutputVolume()
          : conversation.getInputVolume();
        setLiveAudioLevel(Math.min(1, Math.max(0.35, vol * 1.45)));
      } catch {
        setLiveAudioLevel(conversation.isSpeaking ? 0.78 : 0.42);
      }
    }, 50);
    return () => clearInterval(id);
  }, [isActivated, isLocalLimitMode, conversation]);

  // Wait until the AI finishes speaking before transitioning to zero-credit mode
  useEffect(() => {
    if (
      pendingCutoffRef.current &&
      !conversation.isSpeaking &&
      conversation.status === "connected"
    ) {
      pendingCutoffRef.current = false;
      (async () => {
        try {
          await conversation.endSession();
        } catch {
          // Ignore
        }
        void startLocalAssistantLoop();
      })();
    }
  }, [
    conversation.isSpeaking,
    conversation.status,
    conversation,
    startLocalAssistantLoop,
  ]);

  const startSession = useCallback(async () => {
    const current = getStoredCredits();
    if (current >= MAX_CREDITS) {
      setIsRateLimited(true);
      void startLocalAssistantLoop();
      return;
    }

    setIsActivated(true);
    setErrorMessage(null);
    pendingCutoffRef.current = false;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices?.getUserMedia
      ) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "websocket",
      });
    } catch (err) {
      console.warn("Microphone or session initialization:", err);
      const name = (err as Error)?.name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorMessage("Mic blocked");
        setTimeout(() => setErrorMessage(null), 2500);
      }
      setIsActivated(false);
    }
  }, [conversation, startLocalAssistantLoop]);

  const stopSession = useCallback(async () => {
    pendingCutoffRef.current = false;
    cleanupLocalAudio();
    try {
      await conversation.endSession();
    } catch {
      // Ignore
    }
    setIsActivated(false);
    setErrorMessage(null);
  }, [conversation, cleanupLocalAudio]);

  useEffect(() => {
    return () => {
      cleanupLocalAudio();
    };
  }, [cleanupLocalAudio]);

  const effectiveIsSpeaking = isLocalLimitMode
    ? localIsSpeaking
    : conversation.isSpeaking;

  const currentState: LiquidGlassOrbState = !isActivated
    ? "idle"
    : isLocalLimitMode
      ? localIsSpeaking
        ? "speaking"
        : "listening"
      : conversation.status === "connecting"
        ? "searching"
        : conversation.isSpeaking
          ? "speaking"
          : "listening";

  const stateLabel = !isActivated
    ? ""
    : isLocalLimitMode
      ? localIsSpeaking
        ? "Speaking"
        : "Listening"
      : conversation.status === "connecting"
        ? "Connecting..."
        : conversation.isSpeaking
          ? "Speaking"
          : "Listening";

  const audioLevel = !isActivated
    ? 0.42
    : isLocalLimitMode
      ? localAudioLevel
      : liveAudioLevel;

  const value = useMemo<VoiceAgentContextValue>(
    () => ({
      isActivated,
      startSession,
      stopSession,
      currentState,
      stateLabel,
      errorMessage,
      isSpeaking: effectiveIsSpeaking,
      audioLevel,
      usedCredits,
      remainingCredits: Math.max(0, MAX_CREDITS - usedCredits),
      maxCredits: MAX_CREDITS,
      isRateLimited,
      isLocalLimitMode,
      currentToneNotice,
      resetCredits,
    }),
    [
      isActivated,
      startSession,
      stopSession,
      currentState,
      stateLabel,
      errorMessage,
      effectiveIsSpeaking,
      audioLevel,
      usedCredits,
      isRateLimited,
      isLocalLimitMode,
      currentToneNotice,
      resetCredits,
    ],
  );

  return (
    <VoiceAgentContext.Provider value={value}>
      {children}
    </VoiceAgentContext.Provider>
  );
}

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConversationProvider>
      <VoiceAgentProviderInner>{children}</VoiceAgentProviderInner>
    </ConversationProvider>
  );
}

export function useVoiceAgent() {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error("useVoiceAgent must be used within a VoiceAgentProvider");
  }
  return context;
}
