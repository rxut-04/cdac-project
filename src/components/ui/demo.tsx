"use client";
import React, { useState, useEffect } from "react";
import FigmaBrandHero from "@/components/ui/figma-brand-hero";
import { FolderGit2, LogIn, UserPlus, X, Sun, Moon } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";

export default function DemoOne({
  onSignIn,
  onSignUp,
}: {
  onSignIn?: () => void;
  onSignUp?: () => void;
}) {
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
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

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#f8f9f5] dark:bg-[#07090e] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1b202c_1px,transparent_1px),linear-gradient(to_bottom,#1b202c_1px,transparent_1px)] bg-[size:24px_24px] text-neutral-900 dark:text-neutral-100 transition-colors duration-300 overflow-x-hidden">
      
      {/* Minimalist Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-6 sm:px-12 py-3.5 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#c8ff29] dark:bg-[#b8ff3c] flex items-center justify-center">
            <FolderGit2 className="w-4.5 h-4.5 text-neutral-950" />
          </div>
          <span className="text-lg font-black tracking-tight text-neutral-950 dark:text-white">mygit</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <a href="#repos" className="hover:text-neutral-950 dark:hover:text-[#b8ff3c] transition-colors">
            Repositories
          </a>
          <a href="#pulls" className="hover:text-neutral-950 dark:hover:text-[#b8ff3c] transition-colors">
            Pull Requests
          </a>
          <a href="#engine" className="hover:text-neutral-950 dark:hover:text-[#b8ff3c] transition-colors">
            CLI Engine
          </a>
          <a href="#docs" className="hover:text-neutral-950 dark:hover:text-[#b8ff3c] transition-colors">
            Docs
          </a>
        </nav>

        {/* Navbar Actions: Theme Toggle & Quick Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-neutral-300/80 dark:border-neutral-700/80 bg-neutral-100/70 dark:bg-neutral-900/70 hover:bg-neutral-200/80 dark:hover:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 shadow-xs transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#b8ff3c] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700 transition-transform hover:-rotate-12" />
            )}
          </button>

          <LiquidButton
            size="sm"
            onClick={handleSignIn}
            className="!rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100/70 dark:bg-neutral-900/70 border border-neutral-300/80 dark:border-neutral-700/80 hover:bg-neutral-200/80"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </LiquidButton>
          <AntiMetalButton
            onClick={handleSignUp}
            className="!h-8 !w-28 !rounded-xl text-xs font-bold"
            accentFrom="#c8ff29"
            accentTo="#b8ff3c"
            label="Sign Up"
          />
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <FigmaBrandHero
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
        />
      </main>

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
