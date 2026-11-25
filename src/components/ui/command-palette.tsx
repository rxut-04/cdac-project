"use client";
import React, { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FolderGit2,
  Terminal,
  Copy,
  Sun,
  Mic,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { useVoiceAgent } from "@/context/VoiceAgentContext";

export interface CommandPaletteProps {
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
}

export function CommandPalette({
  onNavigateHome,
  onNavigateDashboard,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const { isActivated, startSession, stopSession } = useVoiceAgent();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("mygit-theme", next);
    setOpen(false);
  };

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search (Cmd+K)..." />
      <CommandList>
        <CommandEmpty>No matching commands found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              onNavigateHome();
              setOpen(false);
            }}
          >
            <Home className="mr-2 size-4" />
            <span>Go to Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onNavigateDashboard();
              setOpen(false);
            }}
          >
            <LayoutDashboard className="mr-2 size-4" />
            <span>Open Repositories Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onNavigateHome();
              setOpen(false);
              setTimeout(() => {
                document.getElementById("install")?.scrollIntoView({ behavior: "smooth" });
              }, 80);
            }}
          >
            <Terminal className="mr-2 size-4" />
            <span>Jump to Install CLI &amp; mygit Bash</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Install Commands">
          <CommandItem
            onSelect={() =>
              copyCmd(
                "irm https://the-only-git-platform-you-need.netlify.app/install.ps1 | iex",
              )
            }
          >
            <Copy className="mr-2 size-4" />
            <span>Copy Windows PowerShell Install Command</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              copyCmd(
                "curl -fsSL https://the-only-git-platform-you-need.netlify.app/install.sh | bash",
              )
            }
          >
            <Copy className="mr-2 size-4" />
            <span>Copy Linux &amp; macOS Install Command</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              copyCmd("mygit login")
            }
          >
            <FolderGit2 className="mr-2 size-4" />
            <span>Copy CLI Login Command (mygit login)</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              if (isActivated) {
                void stopSession();
              } else {
                void startSession();
              }
              setOpen(false);
            }}
          >
            <Mic className="mr-2 size-4" />
            <span>{isActivated ? "Stop AI Voice Assistant" : "Talk to mygit AI Voice Orb"}</span>
          </CommandItem>
          <CommandItem onSelect={toggleTheme}>
            <Sun className="mr-2 size-4" />
            <span>Toggle Light / Dark Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
