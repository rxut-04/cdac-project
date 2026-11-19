"use client";

import * as React from "react";
import { useState } from "react";
import {
  Sidebar001,
  Sidebar001Content,
  Sidebar001Footer,
  Sidebar001Group,
  Sidebar001Header,
  Sidebar001Item,
  Sidebar001Section,
} from "@/components/ui/sidebar-001";
import {
  GitBranch,
  Layers,
  User,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Terminal,
  LogOut,
  Menu,
  X,
  Star,
  GitFork,
  Clock,
  Lock,
  Globe,
  Bell,
  Search,
  Sparkles,
  RefreshCw,
  FolderPlus,
} from "lucide-react";

export interface DashboardPageProps {
  userEmail?: string;
  onSignOut?: () => void;
}

type ViewState = "normal" | "loading" | "empty";

export function DashboardPage({
  userEmail = "alex@mygit.dev",
  onSignOut,
}: DashboardPageProps) {
  const [active, setActive] = useState("/dashboard");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("normal");

  const username = userEmail.split("@")[0] || "developer";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Contribution heatmap (52 weeks x 7 days)
  const heatmapData = React.useMemo(() => {
    const weeks = [];
    for (let w = 0; w < 32; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const rand = Math.sin(w * 7 + d * 3) * 10000;
        const seed = rand - Math.floor(rand);
        let level = 0;
        if (seed > 0.65) level = 1;
        if (seed > 0.8) level = 2;
        if (seed > 0.9) level = 3;
        if (seed > 0.96) level = 4;
        days.push(level);
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

  const heatMapColors = [
    "bg-foreground/5 border-foreground/5",
    "bg-[#104e27] border-[#166534]",
    "bg-[#15803d] border-[#22c55e]/40",
    "bg-[#22c55e] border-[#4ade80]",
    "bg-[#4ade80] border-[#86efac]",
  ];

  const recentRepos = [
    {
      name: "mygit-kernel",
      description: "High-performance byte-compatible git engine written in Rust with parallel packfile indexing.",
      lang: "Rust",
      langColor: "bg-orange-500",
      stars: 18,
      forks: 3,
      updated: "24m ago",
      isPrivate: false,
    },
    {
      name: "cymatic-particle-ui",
      description: "Acoustic 3D resonance visualizer, live GLSL domain warping shaders, and particle dynamics.",
      lang: "TypeScript",
      langColor: "bg-blue-400",
      stars: 12,
      forks: 2,
      updated: "2h ago",
      isPrivate: false,
    },
    {
      name: "auth-daemon",
      description: "Zero-knowledge cryptographic session validator & distributed SSH key management service.",
      lang: "Go",
      langColor: "bg-cyan-400",
      stars: 6,
      forks: 1,
      updated: "1d ago",
      isPrivate: true,
    },
    {
      name: "docs-specifications",
      description: "Protocol specs for wire protocol v2, delta compression algorithms, and CLI manual.",
      lang: "MDX",
      langColor: "bg-amber-400",
      stars: 3,
      forks: 0,
      updated: "3d ago",
      isPrivate: false,
    },
  ];

  const activityFeed = [
    {
      type: "push",
      text: "Pushed 3 commits to",
      target: "mygit-kernel:main",
      time: "24 minutes ago",
      hash: "8feca42",
    },
    {
      type: "pr",
      text: "Opened Pull Request #14:",
      target: "feat: add packfile delta compression v2",
      time: "2 hours ago",
      badge: "Needs review",
    },
    {
      type: "merge",
      text: "Merged PR #12 into",
      target: "mygit-kernel:main",
      time: "5 hours ago",
      hash: "a4204e5",
    },
    {
      type: "star",
      text: "Starred repository",
      target: "torvalds/linux",
      time: "1 day ago",
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Shell */}
      <div
        className={
          "fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out " +
          (mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        <Sidebar001 defaultWidth={240} minWidth={180} maxWidth={380} className="border-r border-border/50 bg-background h-full">
          <Sidebar001Header className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch size={18} className="text-foreground shrink-0" />
                <span className="text-base font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                  mygit
                  <span className="size-1.5 rounded-full bg-accent-pro shrink-0" />
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1 text-foreground/50 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </Sidebar001Header>

          <Sidebar001Content>
            {/* Overview (replaces Getting Started) */}
            <Sidebar001Section label="Overview">
              <Sidebar001Item
                href="/dashboard"
                label="Dashboard"
                isActive={active === "/dashboard"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/dashboard");
                  setViewState("normal");
                }}
              />
              <Sidebar001Item
                href="/activity"
                label="Activity"
                isActive={active === "/activity"}
                isNew={true}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/activity");
                }}
              />
              <Sidebar001Item
                href="/notifications"
                label="Notifications"
                isActive={active === "/notifications"}
                isNew={true}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/notifications");
                }}
              />
              <Sidebar001Item
                href="/quickstart"
                label="Quick Start"
                isActive={active === "/quickstart"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/quickstart");
                }}
              />
            </Sidebar001Section>

            {/* Repositories (replaces Components) */}
            <Sidebar001Section label="Repositories">
              <Sidebar001Item
                href="/repositories"
                label="Your Repositories"
                isActive={active === "/repositories"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/repositories");
                }}
              />
              <Sidebar001Item
                href="/starred"
                label="Starred"
                isActive={active === "/starred"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/starred");
                }}
              />
              <Sidebar001Item
                href="/new"
                label="Create New Repository"
                isActive={active === "/new"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/new");
                }}
              />
              <Sidebar001Item
                href="/import"
                label="Import Repository"
                isActive={active === "/import"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/import");
                }}
              />
              <Sidebar001Item
                href="/recent"
                label="Recent"
                isActive={active === "/recent"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/recent");
                }}
              />
            </Sidebar001Section>

            {/* Collaboration (replaces collapsible Overlays) */}
            <Sidebar001Section label="Collaboration">
              <Sidebar001Group
                label="Collaboration"
                defaultOpen={true}
                icon={<Layers />}
              >
                <Sidebar001Item
                  href="/pulls"
                  label="Pull Requests"
                  isActive={active === "/pulls"}
                  isNew={true}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/pulls");
                  }}
                />
                <Sidebar001Item
                  href="/issues"
                  label="Issues"
                  isActive={active === "/issues"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/issues");
                  }}
                />
                <Sidebar001Item
                  href="/reviews"
                  label="Reviews"
                  isActive={active === "/reviews"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/reviews");
                  }}
                />
                <Sidebar001Item
                  href="/discussions"
                  label="Discussions"
                  isActive={active === "/discussions"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/discussions");
                  }}
                />
              </Sidebar001Group>
            </Sidebar001Section>

            {/* Account (bottom collapsible group) */}
            <Sidebar001Section label="Account">
              <Sidebar001Group
                label="Account"
                defaultOpen={false}
                icon={<User />}
              >
                <Sidebar001Item
                  href="/profile"
                  label="Profile"
                  isActive={active === "/profile"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/profile");
                  }}
                />
                <Sidebar001Item
                  href="/tokens"
                  label="Access Tokens"
                  isActive={active === "/tokens"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/tokens");
                  }}
                />
                <Sidebar001Item
                  href="/ssh"
                  label="SSH Keys"
                  isActive={active === "/ssh"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/ssh");
                  }}
                />
                <Sidebar001Item
                  href="/settings"
                  label="Settings"
                  isActive={active === "/settings"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/settings");
                  }}
                />
                <Sidebar001Item
                  href="#signout"
                  label="Sign out"
                  isActive={false}
                  onClick={(e) => {
                    e.preventDefault();
                    onSignOut?.();
                  }}
                />
              </Sidebar001Group>
            </Sidebar001Section>
          </Sidebar001Content>

          <Sidebar001Footer>
            <div className="flex items-center justify-between text-xs text-foreground/40">
              <span>v1.0.0</span>
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 text-foreground/40 hover:text-accent-pro transition-colors"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </Sidebar001Footer>
        </Sidebar001>
      </div>

      {/* Main Content Area in Sidebar Theme */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background border-l border-border/50">
        {/* Top bar header */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-background">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded border border-border/50 text-foreground/60 hover:text-foreground"
            >
              <Menu className="size-4" />
            </button>
            <div className="flex items-center gap-2 text-sm text-foreground/45 font-mono">
              <span>Overview</span>
              <span>/</span>
              <span className="text-foreground font-medium">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* State Switcher Tabs */}
            <div className="hidden md:flex items-center gap-1 p-0.5 rounded-md border border-border/50 bg-foreground/5 text-xs">
              <button
                type="button"
                onClick={() => setViewState("normal")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewState === "normal"
                    ? "bg-foreground/15 text-foreground font-medium"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setViewState("empty")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewState === "empty"
                    ? "bg-foreground/15 text-foreground font-medium"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                Empty
              </button>
              <button
                type="button"
                onClick={() => setViewState("loading")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewState === "loading"
                    ? "bg-foreground/15 text-foreground font-medium"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                Loading
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground/50 w-52">
              <Search className="size-3.5" />
              <span>Search...</span>
              <kbd className="ml-auto text-[10px] font-mono opacity-50 px-1 rounded bg-foreground/10">⌘K</kbd>
            </div>

            <button
              type="button"
              onClick={() => setActive("/notifications")}
              className="relative size-8 rounded-md border border-border/50 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent-pro" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <div className="size-7 rounded-md bg-accent-pro/15 border border-accent-pro/30 text-accent-pro font-bold text-xs flex items-center justify-center uppercase">
                {username.slice(0, 2)}
              </div>
              <span className="hidden md:inline text-xs text-foreground/70 font-medium">
                {username}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 space-y-8">
          {viewState === "loading" ? (
            /* Loading State matching exact skeleton from demo */
            <div className="flex flex-col gap-4 animate-pulse max-w-4xl">
              <div className="h-5 w-32 rounded bg-foreground/8" />
              <div className="h-8 w-64 rounded bg-foreground/10" />
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-3 w-full rounded bg-foreground/6" />
                <div className="h-3 w-5/6 rounded bg-foreground/6" />
                <div className="h-3 w-4/6 rounded bg-foreground/6" />
              </div>
              <div className="h-36 w-full rounded-lg bg-foreground/5 mt-2" />
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-3 w-full rounded bg-foreground/6" />
                <div className="h-3 w-3/4 rounded bg-foreground/6" />
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="h-20 rounded-lg bg-foreground/5" />
                <div className="h-20 rounded-lg bg-foreground/5" />
                <div className="h-20 rounded-lg bg-foreground/5" />
                <div className="h-20 rounded-lg bg-foreground/5" />
              </div>
            </div>
          ) : (
            <div className="max-w-6xl space-y-8">
              {/* Top 5 blocks from specification */}
              <div className="space-y-3">
                {/* 1. Small bar at top */}
                <div className="text-xs font-mono text-foreground/40 flex items-center gap-2">
                  <span>Overview</span>
                  <span>/</span>
                  <span className="text-foreground/70 font-medium">Dashboard</span>
                </div>

                {/* 2. Large title bar */}
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Welcome back, {username}
                </h1>

                {/* 3. Three text lines (subtitle) */}
                <div className="flex flex-col gap-1 text-sm text-foreground/60 leading-relaxed">
                  <p>
                    You have <span className="text-foreground font-medium">4 repositories</span>, <span className="text-foreground font-medium">2 open pull requests</span>, and <span className="text-accent-pro font-medium">3 unread notifications</span>.
                  </p>
                  <p className="text-foreground/45">
                    All edge remote operations are healthy and synced across 3 global points of presence.
                  </p>
                  <p className="text-xs text-foreground/40 font-mono">
                    Last push was 24 minutes ago to <code className="text-foreground/70">mygit-kernel:main</code>.
                  </p>
                </div>
              </div>

              {/* 4. Large Card (Main feature block) */}
              {viewState === "empty" ? (
                /* Empty state for new users */
                <div className="p-8 rounded-lg border border-border/50 bg-foreground/5 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="size-12 rounded-full border border-border/50 bg-foreground/5 flex items-center justify-center text-foreground/50">
                    <FolderPlus className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">Create your first repository</h3>
                    <p className="text-xs text-foreground/50 max-w-sm">
                      Get started by creating a repository or push an existing git directory from your terminal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActive("/new")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent-pro text-white text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="size-3.5" />
                    <span>Create repository</span>
                  </button>
                </div>
              ) : (
                /* Contribution heatmap block */
                <div className="p-6 rounded-lg border border-border/50 bg-foreground/5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="size-4 text-accent-pro" />
                        Continuous Contribution Ledger
                      </h2>
                      <p className="text-xs text-foreground/45 mt-0.5 font-mono">
                        348 verified byte-compatible commits this year
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive("/new")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-foreground/10 text-foreground hover:bg-foreground/15 border border-border/50 transition-all self-start sm:self-auto"
                    >
                      <Plus className="size-3.5" />
                      <span>Create New Repository</span>
                    </button>
                  </div>

                  {/* Heatmap Grid */}
                  <div className="overflow-x-auto pb-1 no-scrollbar">
                    <div className="inline-flex flex-col gap-1.5 min-w-[620px]">
                      <div className="grid grid-flow-col grid-rows-7 gap-1">
                        {heatmapData.flatMap((week, wi) =>
                          week.map((level, di) => (
                            <div
                              key={`${wi}-${di}`}
                              className={`size-3 rounded-sm border transition-transform hover:scale-125 cursor-pointer ${heatMapColors[level]}`}
                              title={`Week ${wi + 1}, Day ${di + 1}: ${level * 3} commits`}
                            />
                          ))
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-foreground/40 pt-1 font-mono">
                        <span>Jan</span>
                        <span>Apr</span>
                        <span>Jul</span>
                        <span>Oct</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span>Less</span>
                          {heatMapColors.map((cls, idx) => (
                            <span key={idx} className={`size-2.5 rounded-sm border ${cls}`} />
                          ))}
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Last two text lines (Footer hint / tip) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-foreground/45 font-mono pt-1">
                <p>💡 Tip: Generate an access token to connect your terminal tool or configure <code className="text-foreground/70">git-remote-mygit</code>.</p>
                <button
                  type="button"
                  onClick={() => setActive("/tokens")}
                  className="text-foreground/60 hover:text-foreground inline-flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>Tokens settings</span>
                  <ExternalLink className="size-3" />
                </button>
              </div>

              {/* Extra sections below the card */}

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                  <p className="text-xs text-foreground/40 font-mono">Repositories</p>
                  <p className="text-2xl font-bold text-foreground">4</p>
                  <p className="text-[11px] text-emerald-400 font-mono">2 public · 2 private</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                  <p className="text-xs text-foreground/40 font-mono">Total Commits</p>
                  <p className="text-2xl font-bold text-foreground">348</p>
                  <p className="text-[11px] text-emerald-400 font-mono">+24 this week</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                  <p className="text-xs text-foreground/40 font-mono">Stars Earned</p>
                  <p className="text-2xl font-bold text-foreground">39</p>
                  <p className="text-[11px] text-emerald-400 font-mono">+5 new stargazers</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                  <p className="text-xs text-foreground/40 font-mono">Open Pull Requests</p>
                  <p className="text-2xl font-bold text-accent-pro">2</p>
                  <p className="text-[11px] text-accent-pro font-mono">Awaiting your review</p>
                </div>
              </div>

              {/* Recent Repositories & Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Repositories */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Recent Repositories</h3>
                    <button
                      type="button"
                      onClick={() => setActive("/repositories")}
                      className="text-xs text-foreground/40 hover:text-foreground font-mono"
                    >
                      View all (4) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentRepos.map((repo) => (
                      <div
                        key={repo.name}
                        className="p-4 rounded-lg border border-border/50 bg-foreground/5 hover:border-border transition-colors flex flex-col justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm text-foreground group-hover:text-foreground/80 transition-colors truncate">
                              {repo.name}
                            </h4>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-foreground/50">
                              {repo.isPrivate ? (
                                <>
                                  <Lock className="size-2.5" /> Private
                                </>
                              ) : (
                                <>
                                  <Globe className="size-2.5" /> Public
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/50 mt-2 line-clamp-2 leading-relaxed">
                            {repo.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-foreground/40 font-mono mt-4 pt-3 border-t border-border/30">
                          <span className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${repo.langColor}`} />
                            {repo.lang}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="size-3" />
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="size-3" />
                            {repo.forks}
                          </span>
                          <span className="ml-auto flex items-center gap-1">
                            <Clock className="size-3" />
                            {repo.updated}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Activity</h3>
                  <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-4">
                    {activityFeed.map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs">
                        <div className="size-1.5 rounded-full bg-accent-pro mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-foreground/70 leading-snug">
                            {item.text} <span className="font-medium text-foreground">{item.target}</span>
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-foreground/40">
                            <span>{item.time}</span>
                            {item.hash && (
                              <span className="px-1 py-0.2 rounded bg-foreground/10 text-foreground/70">
                                {item.hash}
                              </span>
                            )}
                            {item.badge && (
                              <span className="px-1 py-0.2 rounded bg-accent-pro/15 text-accent-pro border border-accent-pro/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Start Checklist & CLI Snippet Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Quick start checklist */}
                <div className="p-5 rounded-lg border border-border/50 bg-foreground/5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Quick Start Checklist
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 p-2.5 rounded border border-border/30 bg-background/50 text-xs">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span className="line-through text-foreground/40">Create developer account</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded border border-border/30 bg-background/50 text-xs">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span className="line-through text-foreground/40">Generate Ed25519 SSH Authentication Key</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded border border-accent-pro/30 bg-accent-pro/5 text-xs font-medium">
                      <Circle className="size-3.5 text-accent-pro shrink-0" />
                      <span className="text-foreground">Install the mygit CLI binary</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded border border-border/30 bg-background/50 text-xs text-foreground/50">
                      <Circle className="size-3.5 text-foreground/30 shrink-0" />
                      <span>Push your first repository to <code className="text-foreground/70">origin main</code></span>
                    </div>
                  </div>
                </div>

                {/* CLI snippet box */}
                <div className="p-5 rounded-lg border border-border/50 bg-foreground/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Terminal className="size-4 text-foreground/70" />
                      CLI Commands
                    </h3>
                    <span className="text-[11px] font-mono text-foreground/40">v1.0.0</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: "Authenticate CLI", cmd: "mygit auth login --email " + userEmail },
                      { label: "Clone repository", cmd: "mygit clone mygit://mygit.dev/" + username + "/mygit-kernel.git" },
                      { label: "Add remote & push", cmd: "git remote add mygit mygit://mygit.dev/" + username + "/mygit-kernel.git && git push mygit main" },
                    ].map((item) => (
                      <div key={item.label} className="p-2.5 rounded border border-border/40 bg-background/80 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-foreground/40 font-mono">
                          <span>{item.label}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.cmd)}
                            className="text-foreground/50 hover:text-foreground flex items-center gap-1 transition-colors"
                          >
                            {copiedCmd === item.cmd ? (
                              <>
                                <Check className="size-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="text-xs font-mono text-foreground/90 block overflow-x-auto whitespace-pre py-0.5">
                          $ {item.cmd}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
