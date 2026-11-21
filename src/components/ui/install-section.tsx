"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Command,
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
      <div className="text-center space-y-3 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md text-xs font-mono text-neutral-600 dark:text-neutral-400 shadow-xs">
          <span className="size-1.5 rounded-full bg-[#c8ff29] dark:bg-[#b8ff3c]" />
          <span>Standalone Distribution</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
          Install the Engine Locally
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Run one command to install <code className="font-mono text-neutral-900 dark:text-neutral-200 font-medium">mygit</code>,
          register your system environment variables, and start initializing isolated repositories immediately.
        </p>
      </div>

      {/* Main Terminal Installer Card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        {/* Minimalist OS Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4 mb-6">
          <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <button
              type="button"
              onClick={() => setOs("windows")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                os === "windows"
                  ? "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <Terminal className="size-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>Windows (PowerShell)</span>
            </button>

            <button
              type="button"
              onClick={() => setOs("unix")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                os === "unix"
                  ? "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <Command className="size-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>macOS & Linux (curl)</span>
            </button>
          </div>

          <a
            href={os === "windows" ? "/install.ps1" : "/install.sh"}
            download={os === "windows" ? "install.ps1" : "install.sh"}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Download className="size-3.5 text-neutral-400" />
            <span>Raw script</span>
          </a>
        </div>

        {/* Command Box */}
        <div className="space-y-2.5">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {os === "windows"
              ? "Run in Windows PowerShell. Automatically appends mygit to your User PATH:"
              : "Run in your shell. Automatically installs to ~/.local/bin/mygit:"}
          </p>

          <div className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-950/80 px-4 py-3 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
            <span className="truncate pr-4 select-all">{currentCmd}</span>

            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer text-xs font-medium shadow-2xs"
              aria-label="Copy command"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-[#b8ff3c]" />
                  <span className="text-emerald-600 dark:text-[#b8ff3c] font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimalist Feature Points */}
        <div className="mt-6 pt-5 border-t border-neutral-200/80 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60">
            <div className="p-1.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 shrink-0">
              <Cpu className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">Auto PATH Config</h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                Configures Windows User Environment variables automatically.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60">
            <div className="p-1.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 shrink-0">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">Zero Admin Rights</h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                Installs inside <code className="font-mono">%LOCALAPPDATA%</code> without UAC elevation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60">
            <div className="p-1.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 shrink-0">
              <FolderGit2 className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">Local & Cloud Sync</h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                Seamless <code className="font-mono">mygit login</code> with user-isolated Neon storage.
              </p>
            </div>
          </div>
        </div>

        {/* Minimalist Terminal Walkthrough */}
        <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#0c0d11] p-4 sm:p-5 font-mono text-xs leading-relaxed text-neutral-300 shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/80">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-neutral-700" />
              <div className="size-2 rounded-full bg-neutral-700" />
              <div className="size-2 rounded-full bg-neutral-700" />
              <span className="text-[11px] text-neutral-500 ml-2 font-sans font-medium">terminal preview</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">mygit v0.1.0</span>
          </div>

          <div className="space-y-3 text-[11px] sm:text-xs">
            <div>
              <span className="text-neutral-500">PS C:\&gt;</span> <span className="text-white font-medium">mygit login</span>
              <div className="text-neutral-400 text-[11px] mt-0.5 pl-3 border-l border-neutral-800">
                Email: oraut860@gmail.com<br />
                Password: ••••••••<br />
                <span className="text-neutral-300">✓ Authenticated as 'omraut' (User ID: 4)</span>
              </div>
            </div>

            <div>
              <span className="text-neutral-500">PS C:\&gt;</span> <span className="text-white font-medium">mygit init my-app</span>
              <div className="text-neutral-400 text-[11px] mt-0.5 pl-3 border-l border-neutral-800">
                Initialized empty mygit repository in C:\my-app\.mygit\
              </div>
            </div>

            <div>
              <span className="text-neutral-500">PS C:\my-app&gt;</span> <span className="text-white font-medium">mygit add . && mygit commit -m "Initial commit"</span>
              <div className="text-neutral-400 text-[11px] mt-0.5 pl-3 border-l border-neutral-800">
                [main (root-commit) 4a8b1c9] Initial commit (2 files changed, 48 insertions)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
