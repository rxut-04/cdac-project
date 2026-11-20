"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, ArrowRight, Terminal, Copy, Check } from "lucide-react";

export interface FigmaBrandHeroProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export default function FigmaBrandHero({ onSignIn, onSignUp }: FigmaBrandHeroProps) {
  // State to trigger an instant re-render/replay of all animations on click
  const [animationKey, setAnimationKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  const copyCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("pip install mygit-vcs && mygit init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      key={animationKey}
      className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-8 px-6 sm:px-12 -translate-y-4 sm:-translate-y-6"
    >
      {/* Ambient Background Glow */}
      <div className="absolute w-72 h-72 bg-[#b8ff3c]/25 dark:bg-[#b8ff3c]/15 rounded-full blur-3xl pointer-events-none -top-12" />

      {/* Top Pill - Personal GitHub Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4 flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 shadow-xs select-none"
      >
        <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
        <span>Personal GitHub Platform · Byte-Compatible VCS</span>
      </motion.div>

      {/* Main Bold Stack */}
      <div className="flex flex-col items-center font-black tracking-tighter text-3xl sm:text-5xl md:text-6xl text-neutral-950 dark:text-white leading-[0.9] text-center select-none z-10">
        <motion.span
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          YOUR CODE
        </motion.span>
        <motion.span
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          DESERVES A
        </motion.span>

        {/* Highlighted Bounding Box Row with 4 Figma handles */}
        <div className="relative my-2 px-3 py-1">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="absolute inset-0 bg-[#c8ff29] dark:bg-[#b8ff3c] origin-left border border-neutral-900 dark:border-neutral-900 shadow-xs"
          />

          {/* 4 Figma-style Corner Handles */}
          {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map(
            (pos, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute ${pos} w-2 h-2 bg-white dark:bg-neutral-900 border border-neutral-900 dark:border-neutral-100 z-20`}
              />
            )
          )}
          <span className="relative z-10 text-neutral-950">WORLD-CLASS</span>
        </div>

        <motion.span
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          DISTRIBUTED
        </motion.span>
        <motion.span
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          GIT PLATFORM.
        </motion.span>
      </div>

      {/* Multiplayer Cursor 1 (Top Right) - Sarah Merging PR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: [0, 8, -4, 0],
          y: [0, -6, 3, 0],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute right-2 sm:right-6 top-6 sm:top-8 z-30 flex items-center pointer-events-none scale-90 sm:scale-100"
      >
        <svg className="w-4 h-4 text-indigo-600 fill-indigo-600 drop-shadow -rotate-12" viewBox="0 0 24 24">
          <path d="M5.653 3.125a1 1 0 0 1 1.34-1.34l14.5 9.5a1 1 0 0 1 .046 1.705l-6.046 4.031-2.915 5.83a1 1 0 0 1-1.745.18l-3.5-5.5-5.228-2.614a1 1 0 0 1-.107-1.792l14.002-9.335z" />
        </svg>
        <div className="ml-1 px-2.5 py-0.5 rounded-md rounded-tl-none bg-indigo-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap">
          <span>Sarah</span>
          <span className="text-[8px] opacity-75 font-normal">Merging PR #42</span>
        </div>
      </motion.div>

      {/* Multiplayer Cursor 2 (Bottom Left) - Alex Pushing main */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: [0, -8, 6, 0],
          y: [0, 8, -4, 0],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] },
          x: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
        }}
        className="absolute left-2 sm:left-6 bottom-24 sm:bottom-28 z-30 flex items-center pointer-events-none scale-90 sm:scale-100"
      >
        <svg className="w-4 h-4 text-emerald-500 fill-emerald-500 drop-shadow -rotate-12" viewBox="0 0 24 24">
          <path d="M5.653 3.125a1 1 0 0 1 1.34-1.34l14.5 9.5a1 1 0 0 1 .046 1.705l-6.046 4.031-2.915 5.83a1 1 0 0 1-1.745.18l-3.5-5.5-5.228-2.614a1 1 0 0 1-.107-1.792l14.002-9.335z" />
        </svg>
        <div className="ml-1 px-2.5 py-0.5 rounded-md rounded-tl-none bg-emerald-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap">
          <span>Alex</span>
          <span className="text-[8px] opacity-75 font-normal">Pushing main</span>
        </div>
      </motion.div>

      {/* The Two Prominent Action Buttons: Sign Up & Sign In */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md z-20"
      >
        {/* Sign Up Button (Primary) */}
        <button
          onClick={onSignUp}
          className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#c8ff29] dark:bg-[#b8ff3c] hover:bg-[#b5f01e] text-neutral-950 font-black text-sm border border-neutral-900 shadow-lg shadow-[#b8ff3c]/20 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer group select-none"
        >
          <UserPlus className="w-4 h-4 text-neutral-950 group-hover:scale-110 transition-transform" />
          <span>Sign Up</span>
          <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Sign In Button (Secondary) */}
        <button
          onClick={onSignIn}
          className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-800 text-neutral-950 dark:text-white font-bold text-sm border border-neutral-300 dark:border-neutral-700 shadow-md backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer group select-none"
        >
          <LogIn className="w-4 h-4 text-neutral-950 dark:text-[#b8ff3c] group-hover:translate-x-0.5 transition-transform" />
          <span>Sign In</span>
        </button>
      </motion.div>

      {/* One-Click Terminal Install Pill */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 backdrop-blur-md text-xs font-mono text-neutral-800 dark:text-neutral-300 shadow-xs z-20"
      >
        <Terminal className="w-3.5 h-3.5 text-[#88c408] dark:text-[#b8ff3c]" />
        <span>pip install mygit-vcs &amp;&amp; mygit init</span>
        <button
          onClick={copyCommand}
          className="ml-1 p-1 hover:text-neutral-950 dark:hover:text-white text-neutral-400 transition-colors cursor-pointer"
          title="Copy command"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </motion.div>

      {/* Bottom Action Badge (Triggers Replay) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.78, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleReplay}
        className="mt-5 px-5 py-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-[#c8ff29] dark:hover:bg-[#b8ff3c] text-[10px] font-black tracking-widest uppercase text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-950 shadow-xs transition-all cursor-pointer select-none"
        title="Click to replay animation"
      >
        BUILD. COMMIT. PUSH. ⟳
      </motion.div>
    </div>
  );
}
