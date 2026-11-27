"use client";
import React, { useState, useEffect } from "react";
import FigmaBrandHero from "@/components/ui/figma-brand-hero";
import { FolderGit2, GitBranch, LogIn, UserPlus, X, Sun, Moon } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";
import CompareUILib, { type ComparisonData } from "@/components/ui/shadcn-studio-compare-07";
import WordmarkFooter from "@/components/ui/wordmark-footer";
import { InstallSection } from "@/components/ui/install-section";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MobileNav } from "@/components/ui/navbar";
import { LiquidGlassLogo, type LiquidGlassLogoHandle } from "@/components/liquid-glass-logo";
import { ElevenLabsOrb } from "@/components/ui/elevenlabs-orb";
import { cn } from "@/lib/utils";

const mygitComparisonData: ComparisonData = {
  column1Header: {
    icon: (
      <div className="w-7 h-7 rounded-lg bg-[#c8ff29] dark:bg-[#b8ff3c] flex items-center justify-center shadow-xs">
        <FolderGit2 className="w-4 h-4 text-neutral-950" />
      </div>
    ),
    title: "mygit",
  },
  column2Header: {
    icon: (
      <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border border-neutral-300 dark:border-neutral-700">
        <GitBranch className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
      </div>
    ),
    title: "Git + GitHub / Cloud",
  },
  column3Header: "The Advantage for You",
  features: [
    {
      name: "Byte-Level Compatibility",
      column1: "100% byte-compatible SHA-1 loose objects (blob, tree, commit). Validated by git cat-file & git fsck.",
      column2: "Standard Git object store format.",
      column3: "Zero vendor lock-in. Real Git tools can inspect and read your mygit repos directly.",
    },
    {
      name: "Self-Hosted Platform",
      column1: "Integrated lightweight FastAPI + SQLite bare repository server and web UI.",
      column2: "Heavyweight setup (GitHub Enterprise, GitLab, or Gitea with complex dependencies).",
      column3: "Spin up a full personal GitHub on any machine with a single python command in seconds.",
    },
    {
      name: "Interactive REPL Shell",
      column1: "Built-in MyGitShell with colored branch prompt, autocompletion, and direct CLI execution.",
      column2: "Requires external shell scripts (starship, oh-my-zsh) and repetitive process spawns.",
      column3: "Persistent context-aware session that boosts developer speed and command visibility.",
    },
    {
      name: "Merge Engine & LCA",
      column1: "Automated 3-way BFS merge base (Lowest Common Ancestor) with conflict marker generation.",
      column2: "Complex recursive/ort merge heuristics.",
      column3: "Deterministic, auditable merges with zero hidden automagic behavior.",
    },
    {
      name: "Staging Index Format",
      column1: "Human-readable text-based index v1 with explicit octal mode tracking (100644, 100755, 120000).",
      column2: "Binary DIRCACHE format requiring specialized binary parsers.",
      column3: "Trivial to inspect, debug, and script without reverse-engineering binary structs.",
    },
    {
      name: "Implementation Footprint",
      column1: "Pure Python 3.11+ stdlib core engine. Clean, modular, and dependency-free.",
      column2: "Large legacy C codebase compiled with platform-specific native binaries.",
      column3: "Easy to learn, extend, audit, and integrate into modern Python / DevOps pipelines.",
    },
    {
      name: "Data Sovereignty & Privacy",
      column1: "100% local-first and self-hosted. Zero telemetry, tracking, or cloud surveillance.",
      column2: "Subject to commercial terms, rate limits, paywalled features, and cloud outages.",
      column3: "Absolute code ownership and full air-gap offline readiness for sensitive codebases.",
    },
    {
      name: "Sync Protocol",
      column1: "Direct HTTP JSON ref query + zlib object stream with bearer token security.",
      column2: "Smart Git transfer protocol (packfiles, sideband channels).",
      column3: "Simple, robust synchronization that works behind proxies without SSH key struggles.",
    },
  ],
};

export default function DemoOne({
  onSignIn,
  onSignUp,
  onDashboard,
}: {
  onSignIn?: () => void;
  onSignUp?: () => void;
  onDashboard?: () => void;
}) {
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const logoRef = React.useRef<LiquidGlassLogoHandle>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mygit-theme");
      if (saved === "light" || saved === "dark") return saved;
      if (document.documentElement.classList.contains("dark")) return "dark";
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("mygit-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.documentElement.style.colorScheme = nextTheme;
      localStorage.setItem("mygit-theme", nextTheme);
      return nextTheme;
    });
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      setAuthModal("login");
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      setAuthModal("signup");
    }
  };

  const navigationLinks = [
    {
      name: "Menu",
      items: [
        { href: "#install", label: "Install CLI", active: true },
        { href: "#compare", label: "Compare" },
        { href: "#dashboard", label: "Dashboard" },
        { href: "#docs", label: "Documentation" },
      ],
    },
    {
      name: "Platform",
      items: [
        { href: "#dashboard", label: "Repositories" },
        { href: "#dashboard", label: "Pull Requests" },
        { href: "#dashboard", label: "Issues" },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#f8f9f5] dark:bg-[#07090e] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1b202c_1px,transparent_1px),linear-gradient(to_bottom,#1b202c_1px,transparent_1px)] bg-[size:24px_24px] text-neutral-900 dark:text-neutral-100 transition-colors duration-300 overflow-x-hidden">
      
      {/* Modern Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 lg:px-12 py-3 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center justify-start gap-3">
          <MobileNav nav={navigationLinks} />

          {/* Brand Logo (Left) */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center group select-none cursor-pointer shrink-0"
            title="mygit"
          >
            <img
              src="/logos/mygit.png"
              alt="mygit"
              className="h-11 sm:h-12 w-auto object-contain block"
            />
          </a>
        </div>

        {/* Center Desktop Navigation Menu */}
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList className="gap-1">
            {navigationLinks[0].items.map((link, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink
                  asChild
                  href={link.href}
                  data-active={link.active}
                  className="whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                  onClick={(e) => {
                    if (link.href === "#dashboard") {
                      e.preventDefault();
                      if (onDashboard) onDashboard();
                      else window.location.hash = "#dashboard";
                    }
                  }}
                >
                  <a href={link.href}>{link.label}</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Action: ElevenLabs Voice Orb AI & Theme Toggle (Right Only) */}
        <div className="flex flex-1 items-center justify-end gap-2.5">
          {/* ElevenLabs Voice Orb */}
          <ElevenLabsOrb />

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-300/80 dark:border-neutral-700/80 bg-neutral-100/70 dark:bg-neutral-900/70 hover:bg-neutral-200/80 dark:hover:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 shadow-xs transition-all cursor-pointer ml-1"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#b8ff3c] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700 transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content: Hero + Comparison Section */}
      <main className="flex-1 flex flex-col items-center w-full px-4 sm:px-8 py-6 sm:py-12 space-y-16 sm:space-y-24">
        <FigmaBrandHero
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
        />

        {/* Windows / macOS / Linux CLI Download & Auto-Environment Installer */}
        <div id="install" className="w-full flex justify-center scroll-mt-24">
          <InstallSection />
        </div>

        {/* Comparison Section (mygit vs Git & Cloud) */}
        <div id="compare" className="w-full flex justify-center scroll-mt-24">
          <CompareUILib data={mygitComparisonData} />
        </div>
      </main>

      {/* Modern Wordmark Footer */}
      <WordmarkFooter
        name="mygit"
        legalName="mygit Open Source VCS Engine"
        year={2026}
        description="A Git-compatible version control engine & self-hosted code collaboration platform built with byte-level precision in Python."
        status="All nodes & object store operational"
        email="hello@mygit.dev"
        columns={[
          {
            title: "Product",
            links: [
              { label: "CLI Engine", href: "#engine" },
              { label: "Architecture Compare", href: "#compare" },
              { label: "Object Database", href: "#objects" },
              { label: "Documentation", href: "#docs" },
            ],
          },
          {
            title: "Platform",
            links: [
              { label: "Repositories", href: "#repos" },
              { label: "Pull Requests", href: "#pulls" },
              { label: "Developer Dashboard", href: "#dashboard" },
              { label: "REST Sync Protocol", href: "#api" },
            ],
          },
          {
            title: "Ecosystem",
            links: [
              { label: "GitHub Repository", href: "https://github.com/rxut-04/cdac-project.git" },
              { label: "VCS Specification", href: "#spec" },
              { label: "Security Policy", href: "#security" },
              { label: "License & Terms", href: "#license" },
            ],
          },
        ]}
        credit={{
          label: "Built for byte-compatible Git",
          href: "https://github.com/rxut-04/cdac-project",
        }}
      />

      {/* Interactive Modal for Login & Sign Up */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-950 dark:hover:text-white p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#c8ff29] dark:bg-[#b8ff3c] flex items-center justify-center">
                <FolderGit2 className="w-5 h-5 text-neutral-950" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
                  {authModal === "login" ? "Sign in to mygit" : "Create your account"}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {authModal === "login"
                    ? "Access your Git repositories"
                    : "Get started with mygit in seconds"}
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              method="POST"
              action={authModal === "login" ? "http://localhost:8000/login" : "http://localhost:8000/register"}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. linus_torvalds"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#b8ff3c] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#b8ff3c] transition-colors"
                />
              </div>

              {authModal === "signup" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    required
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#b8ff3c] transition-colors"
                  />
                </div>
              )}

              <LiquidButton
                type="submit"
                size="lg"
                className="w-full !rounded-xl bg-[#c8ff29] dark:bg-[#b8ff3c] hover:bg-[#b5f01e] text-neutral-950 font-black text-sm shadow-md transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {authModal === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </LiquidButton>

              <div className="text-center pt-2 text-xs text-neutral-500 dark:text-neutral-400">
                {authModal === "login" ? (
                  <span>
                    New to mygit?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthModal("signup")}
                      className="text-neutral-950 dark:text-[#b8ff3c] font-bold hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthModal("login")}
                      className="text-neutral-950 dark:text-[#b8ff3c] font-bold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
