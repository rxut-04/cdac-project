"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Command,
  ArrowRight,
  Cpu,
  FolderGit2,
} from "lucide-react";

export function InstallSection() {
  const [os, setOs] = useState<"windows" | "unix">("windows");
  const [copied, setCopied] = useState(false);

  const getOrigin = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://mygit.netlify.app";
  };

  const origin = getOrigin();
  const windowsCmd = `irm ${origin}/install.ps1 | iex`;
  const unixCmd = `curl -fsSL ${origin}/install.sh | bash`;

  const currentCmd = os === "windows" ? windowsCmd : unixCmd;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className="w-full max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm text-xs font-mono text-neutral-600 dark:text-neutral-300 shadow-xs">
          <span className="size-2 rounded-full bg-[#9dff3a] animate-pulse" />
          <span>Zero-Dependency Automated Installation</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
          Download & Run Anywhere in Seconds
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          One command downloads the <code className="text-[#84e022] dark:text-[#9dff3a] font-mono">mygit</code> engine,
          automatically configures your Windows or Unix <code className="text-[#84e022] dark:text-[#9dff3a] font-mono">PATH</code> environment variables,
          and connects to your isolated cloud workspace.
        </p>
      </div>

      {/* Main Terminal Installer Card */}
      <div className="relative rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white/90 dark:bg-[#0c0e12]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-32 -right-32 size-64 rounded-full bg-[#9dff3a]/10 blur-3xl pointer-events-none" />

        {/* OS Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800/80 pb-5 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOs("windows")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                os === "windows"
                  ? "bg-[#9dff3a] text-neutral-950 shadow-md font-bold scale-[1.02]"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              }`}
            >
              <Terminal className="size-4" />
              <span>Windows (PowerShell)</span>
            </button>

            <button
              type="button"
              onClick={() => setOs("unix")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                os === "unix"
                  ? "bg-[#9dff3a] text-neutral-950 shadow-md font-bold scale-[1.02]"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              }`}
            >
              <Command className="size-4" />
              <span>macOS & Linux (curl)</span>
            </button>
          </div>

          <a
            href={os === "windows" ? "/install.ps1" : "/install.sh"}
            download={os === "windows" ? "install.ps1" : "install.sh"}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#7ecc24] dark:text-[#9dff3a] hover:underline cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Download raw script</span>
          </a>
        </div>

        {/* Command Box */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {os === "windows"
              ? "Paste this one-liner into Windows PowerShell. It installs mygit and adds it to your User PATH automatically:"
              : "Paste this one-liner into Terminal (bash/zsh). It installs to ~/.local/bin/mygit and updates your PATH:"}
          </p>

          <div className="group relative flex items-center justify-between rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-950 p-4 font-mono text-xs sm:text-sm text-[#9dff3a] shadow-inner">
            <span className="truncate pr-4 select-all">{currentCmd}</span>

            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 hover:text-white hover:border-[#9dff3a]/50 transition-all cursor-pointer"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-[#9dff3a]" />
                  <span className="text-xs font-sans font-semibold text-[#9dff3a]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-4 text-neutral-400 group-hover:text-white" />
                  <span className="text-xs font-sans font-semibold">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Badges Row */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/50">
            <div className="p-1.5 rounded-lg bg-[#9dff3a]/15 text-[#7ecc24] dark:text-[#9dff3a] shrink-0">
              <Cpu className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Auto Windows PATH</h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                Writes to Windows User Registry. Run <code className="font-mono">mygit</code> immediately in any terminal.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/50">
            <div className="p-1.5 rounded-lg bg-[#9dff3a]/15 text-[#7ecc24] dark:text-[#9dff3a] shrink-0">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Zero Admin Rights</h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                Installs cleanly in per-user directory (<code className="font-mono">%LOCALAPPDATA%</code>). No UAC prompts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/50">
            <div className="p-1.5 rounded-lg bg-[#9dff3a]/15 text-[#7ecc24] dark:text-[#9dff3a] shrink-0">
              <FolderGit2 className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">User Isolated Cloud</h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                Built-in <code className="font-mono">mygit login</code> authenticates against your cloud database.
              </p>
            </div>
          </div>
        </div>

        {/* Live Terminal Flow Preview */}
        <div className="mt-8 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-[#07090c] p-5 font-mono text-xs sm:text-[13px] leading-relaxed shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-red-500/80" />
              <div className="size-2.5 rounded-full bg-yellow-500/80" />
              <div className="size-2.5 rounded-full bg-green-500/80" />
              <span className="text-[11px] text-neutral-400 ml-2 font-sans font-medium">Terminal Session</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">mygit CLI v0.1.0</span>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[#9dff3a] font-bold">PS C:\workspace&gt;</span>{" "}
              <span className="text-white">mygit login</span>
              <div className="text-neutral-400 text-[11px] mt-0.5 pl-3 border-l border-neutral-800">
                Email: oraut860@gmail.com<br />
                Password: ••••••••<br />
                <span className="text-[#9dff3a]">✓ Authenticated successfully as 'omraut' (User ID: 4)</span><br />
                <span className="text-neutral-500">✓ Token saved securely to ~/.mygit/credentials</span>
              </div>
            </div>

            <div>
              <span className="text-[#9dff3a] font-bold">PS C:\workspace&gt;</span>{" "}
              <span className="text-white">mygit init my-project</span>
              <div className="text-neutral-400 text-[11px] mt-0.5 pl-3 border-l border-neutral-800">
                Initialized empty mygit repository in C:\workspace\my-project\.mygit\
              </div>
            </div>

            <div>
              <span className="text-[#9dff3a] font-bold">PS C:\workspace\my-project&gt;</span>{" "}
              <span className="text-white">mygit add . && mygit commit -m "Byte-compatible initial commit"</span>
              <div className="text-neutral-400 text-[11px] mt-0.5 pl-3 border-l border-neutral-800">
                [main (root-commit) 4a8b1c9] Byte-compatible initial commit<br />
                <span className="text-neutral-500"> 3 files changed, 94 insertions(+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
