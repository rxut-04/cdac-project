"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, ArrowRight, Terminal, Copy, Check } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export interface FigmaBrandHeroProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export default function FigmaBrandHero({ onSignIn, onSignUp }: FigmaBrandHeroProps) {
  const [copied, setCopied] = useState(false);

  const copyCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("pip install mygit-vcs && mygit init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 px-6 sm:px-12 -translate-y-4">
      {/* Main Bold Stack */}
      <div className="flex flex-col items-center font-black tracking-tighter text-4xl sm:text-6xl md:text-7xl text-neutral-950 dark:text-white leading-[0.9] text-center select-none z-10">
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

      {/* The Two Liquid Glass Action Buttons */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md z-20"
      >
        {/* Sign Up Button (Primary) with Liquid Glass Effect */}
        <LiquidButton
          size="lg"
          onClick={onSignUp}
          className="w-full sm:w-1/2 !rounded-2xl font-black text-sm text-neutral-950 dark:text-neutral-950 bg-[#c8ff29] dark:bg-[#b8ff3c] hover:bg-[#b5f01e] border border-neutral-900 shadow-lg shadow-[#b8ff3c]/20 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-neutral-950" />
          <span>Sign Up</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </LiquidButton>

        {/* Sign In Button (Secondary) with Liquid Glass Effect */}
        <LiquidButton
          size="lg"
          onClick={onSignIn}
          className="w-full sm:w-1/2 !rounded-2xl font-bold text-sm text-neutral-900 dark:text-white bg-white/85 dark:bg-neutral-900/85 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-md backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          <span>Sign In</span>
        </LiquidButton>
      </motion.div>

      {/* Minimalist Terminal Pill */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-700 dark:text-neutral-300 shadow-xs select-none z-20"
      >
        <Terminal className="w-3.5 h-3.5 text-neutral-500" />
        <span>pip install mygit-vcs</span>
        <button
          onClick={copyCommand}
          className="ml-1 p-0.5 hover:text-neutral-950 dark:hover:text-white text-neutral-400 transition-colors cursor-pointer"
          title="Copy command"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </motion.div>
    </div>
  );
}
