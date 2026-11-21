"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Terminal, Copy, Check, Command } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";

export interface FigmaBrandHeroProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export default function FigmaBrandHero({ onSignIn, onSignUp }: FigmaBrandHeroProps) {
  const [os, setOs] = useState<"win" | "linux">("win");
  const [copied, setCopied] = useState(false);

  const winCmd = "irm https://velvety-druid-dccd85.netlify.app/install.ps1 | iex";
  const linuxCmd = "curl -fsSL https://velvety-druid-dccd85.netlify.app/install.sh | bash";
  const activeCmd = os === "win" ? winCmd : linuxCmd;

  const copyCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(activeCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100svh-90px)] pt-2 pb-8 sm:pt-4 sm:pb-12 px-4 sm:px-12">
      {/* Main Bold Stack */}
      <div className="flex flex-col items-center font-black tracking-tighter text-3xl sm:text-6xl md:text-7xl text-neutral-950 dark:text-white leading-[0.9] text-center select-none z-10 mt-0">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          YOUR CODE
        </motion.span>
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          DESERVES A
        </motion.span>

        {/* Highlighted Bounding Box Row */}
        <div className="relative my-2 px-3 py-1">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="absolute inset-0 bg-[#c8ff29] dark:bg-[#b8ff3c] origin-left border border-neutral-900 shadow-xs"
          />

          {/* 4 Corner Handles */}
          {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map(
            (pos, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute ${pos} w-2 h-2 bg-white dark:bg-neutral-900 border border-neutral-900 dark:border-neutral-100 z-20`}
              />
            )
          )}
          <span className="relative z-10 text-neutral-950">WORLD-CLASS</span>
        </div>

        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          DISTRIBUTED
        </motion.span>
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          GIT PLATFORM.
        </motion.span>
      </div>

      {/* Minimalist Terminal Pill with Windows & Linux tabs: Right after Hero's H1 headline stack */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 sm:mt-6 flex flex-col items-center gap-2 select-none z-20 max-w-[94vw] sm:max-w-none"
      >
        {/* OS switcher tabs */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800/60 border border-neutral-300/60 dark:border-neutral-700/60 text-[11px] font-medium backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setOs("win")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              os === "win"
                ? "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-2xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Terminal className="w-3 h-3 text-neutral-500" />
            <span>Windows (PowerShell)</span>
          </button>
          <button
            type="button"
            onClick={() => setOs("linux")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              os === "linux"
                ? "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-2xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Command className="w-3 h-3 text-neutral-500" />
            <span>Linux & macOS (curl)</span>
          </button>
        </div>

        {/* Command Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-200 shadow-xs max-w-[92vw] sm:max-w-none overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-neutral-400 font-bold shrink-0">&gt;_</span>
          <span className="whitespace-nowrap font-medium">{activeCmd}</span>
          <button
            onClick={copyCommand}
            className="ml-1 p-1 hover:text-neutral-950 dark:hover:text-white text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all cursor-pointer shrink-0"
            title="Copy command"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-[#b8ff3c]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </motion.div>

      {/* Action Buttons: Half-width on mobile side-by-side, fixed width on sm+ */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 sm:mt-7 flex flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-[340px] sm:max-w-md z-20"
      >
        {/* Sign Up Button (AntiMetalButton theme, half width on mobile) */}
        <AntiMetalButton
          onClick={onSignUp}
          className="w-1/2 sm:w-44 !h-11 !rounded-xl text-xs sm:text-sm font-bold shadow-lg cursor-pointer"
          accentFrom="#c8ff29"
          accentTo="#b8ff3c"
          label="Sign Up"
        />

        {/* Sign In Button (Liquid Glass Button, half width on mobile) */}
        <LiquidButton
          size="lg"
          onClick={onSignIn}
          className="w-1/2 sm:w-44 !h-11 !rounded-xl font-bold text-xs sm:text-sm text-neutral-900 dark:text-white bg-white/85 dark:bg-neutral-900/85 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-md backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        >
          <LogIn className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-neutral-700 dark:text-neutral-300" />
          <span>Sign In</span>
        </LiquidButton>
      </motion.div>
    </div>
  );
}
