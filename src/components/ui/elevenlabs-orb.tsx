"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Conversation } from "@elevenlabs/client";
import {
  LiquidGlassOrb,
  type LiquidGlassOrbHandle,
  type LiquidGlassOrbState,
} from "@/components/liquid-glass-orb";

export interface ElevenLabsOrbProps {
  agentId?: string;
  className?: string;
}

const STATUS_TEXT: Partial<Record<LiquidGlassOrbState, string>> = {
  thinking: "Connecting...",
  listening: "Listening",
  speaking: "Speaking",
  searching: "Searching",
  error: "Mic error",
};

export function ElevenLabsOrb({
  agentId = "cBTYF7NiJbR8Bvmdeuse",
  className = "",
}: ElevenLabsOrbProps) {
  const [orbState, setOrbState] = useState<LiquidGlassOrbState>("idle");
  const [isActive, setIsActive] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string>("");

  const orbRef = useRef<LiquidGlassOrbHandle>(null);
  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const rafRef = useRef<number | null>(null);
  const modeRef = useRef<"listening" | "speaking">("listening");

  const stopVolumeLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startVolumeLoop = useCallback(() => {
    stopVolumeLoop();
    const tick = () => {
      const conv = conversationRef.current;
      if (conv) {
        const raw =
          modeRef.current === "speaking" ? conv.getOutputVolume() : conv.getInputVolume();
        const level = Math.min(1, Math.max(0.12, raw * 1.4));
        orbRef.current?.setAudioLevel(level);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopVolumeLoop]);

  const endConversation = useCallback(async () => {
    stopVolumeLoop();
    const conv = conversationRef.current;
    conversationRef.current = null;
    setIsActive(false);
    setOrbState("idle");
    setStatusLabel("");
    orbRef.current?.setAudioLevel(0.15);
    if (conv) {
      try {
        await conv.endSession();
      } catch {
        // Ignore cleanup errors if already closed
      }
    }
  }, [stopVolumeLoop]);

  const startConversation = async () => {
    try {
      setIsActive(true);
      setOrbState("thinking");
      setStatusLabel("Connecting...");

      const conversation = await Conversation.startSession({
        agentId,
        connectionType: "websocket",
        onConnect: () => {
          modeRef.current = "listening";
          setOrbState("listening");
          setStatusLabel("Listening");
          startVolumeLoop();
        },
        onDisconnect: () => {
          stopVolumeLoop();
          conversationRef.current = null;
          setIsActive(false);
          setOrbState("idle");
          setStatusLabel("");
          orbRef.current?.setAudioLevel(0.15);
        },
        onModeChange: ({ mode }) => {
          modeRef.current = mode === "speaking" ? "speaking" : "listening";
          const nextState: LiquidGlassOrbState =
            mode === "speaking" ? "speaking" : "listening";
          setOrbState(nextState);
          setStatusLabel(STATUS_TEXT[nextState] ?? "");
        },
        onError: (message) => {
          console.error("ElevenLabs conversation error:", message);
          stopVolumeLoop();
          conversationRef.current = null;
          setIsActive(false);
          setOrbState("error");
          setStatusLabel("Error");
          setTimeout(() => {
            setOrbState("idle");
            setStatusLabel("");
          }, 2500);
        },
      });

      conversationRef.current = conversation;
    } catch (err) {
      console.error("Failed to start ElevenLabs session:", err);
      stopVolumeLoop();
      conversationRef.current = null;
      setIsActive(false);
      setOrbState("error");
      setStatusLabel("Mic blocked");
      setTimeout(() => {
        setOrbState("idle");
        setStatusLabel("");
      }, 2500);
    }
  };

  const handleClick = () => {
    if (isActive || conversationRef.current) {
      void endConversation();
    } else {
      void startConversation();
    }
  };

  useEffect(() => {
    return () => {
      void endConversation();
    };
  }, [endConversation]);

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
        title={isActive ? "Click to end voice conversation" : "Click to talk with mygit AI"}
        aria-label={isActive ? `Voice assistant: ${statusLabel || orbState}` : "Start voice conversation"}
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
