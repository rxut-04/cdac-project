"use client";
import React from "react";
import { LiquidGlassOrb } from "@/components/liquid-glass-orb";
import { useVoiceAgent } from "@/context/VoiceAgentContext";

export interface ElevenLabsOrbProps {
  className?: string;
}

export function ElevenLabsOrb({ className = "" }: ElevenLabsOrbProps) {
  const {
    isActivated,
    startSession,
    stopSession,
    currentState,
    stateLabel,
    errorMessage,
    isSpeaking,
    audioLevel,
  } = useVoiceAgent();

  const label = errorMessage || stateLabel;

  const handleClick = () => {
    if (isActivated) {
      void stopSession();
    } else {
      void startSession();
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {label && (
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
          {label}
        </span>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        title={
          isActivated
            ? isSpeaking
              ? "Assistant is speaking (Click to end)"
              : "Listening to your voice (Click to end)"
            : "Click to talk with mygit AI"
        }
        aria-label={label ? `Voice assistant: ${label}` : "Start voice conversation"}
        className="relative size-9 rounded-full overflow-hidden shrink-0 shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 ring-1 ring-neutral-300 dark:ring-neutral-700/80 bg-neutral-100 dark:bg-neutral-900"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] pointer-events-none scale-[0.155] origin-center">
          <LiquidGlassOrb
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
            state={currentState}
            thinkingAnimation="ripples"
            searchingAnimation="lens"
            preserveWhites={true}
            animateEntrance={false}
            size={250}
            audioLevel={audioLevel}
          />
        </div>
      </div>
    </div>
  );
}
