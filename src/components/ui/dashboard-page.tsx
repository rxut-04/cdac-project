"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { repoApi } from "@/lib/api";
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
  Filter,
  Tag,
  MessageSquare,
  Key,
  Shield,
  Trash2,
  HelpCircle,
  Sliders,
  CheckCheck,
  Inbox,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Mail,
  GitPullRequest,
  AlertCircle,
  FileCode2,
  Download,
  Share2,
} from "lucide-react";

export interface DashboardPageProps {
  userEmail?: string;
  onSignOut?: () => void;
}

export function DashboardPage({
  userEmail = "alex@mygit.dev",
  onSignOut,
}: DashboardPageProps) {
  const [active, setActive] = useState("/dashboard");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const storedUser = authApi.getStoredUser();
  const username = storedUser?.username || userEmail.split("@")[0] || "user";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // -------------------------------------------------------------
  // DATA STORES & STATE
  // -------------------------------------------------------------

  // Repositories State
  const [repos, setRepos] = useState([
    {
      id: "1",
      name: "mygit-kernel",
      description: "High-performance byte-compatible git engine written in Rust with parallel packfile indexing.",
      lang: "Rust",
      langColor: "bg-orange-500",
      stars: 18,
      forks: 3,
      isStarred: true,
      updated: "24m ago",
      isPrivate: false,
      lastAction: "Pushed 24 minutes ago",
    },
    {
      id: "2",
      name: "cymatic-particle-ui",
      description: "Acoustic 3D resonance visualizer, live GLSL domain warping shaders, and particle dynamics.",
      lang: "TypeScript",
      langColor: "bg-blue-400",
      stars: 12,
      forks: 2,
      isStarred: true,
      updated: "2h ago",
      isPrivate: false,
      lastAction: "Pushed 2 hours ago",
    },
    {
      id: "3",
      name: "auth-daemon",
      description: "Zero-knowledge cryptographic session validator & distributed SSH key management service.",
      lang: "Go",
      langColor: "bg-cyan-400",
      stars: 6,
      forks: 1,
      isStarred: false,
      updated: "1d ago",
      isPrivate: true,
      lastAction: "Opened 1 day ago",
    },
    {
      id: "4",
      name: "docs-specifications",
      description: "Protocol specs for wire protocol v2, delta compression algorithms, and CLI manual.",
      lang: "MDX",
      langColor: "bg-amber-400",
      stars: 3,
      forks: 0,
      isStarred: false,
      updated: "3d ago",
      isPrivate: false,
      lastAction: "Pushed 3 days ago",
    },
  ]);

  // Sync repositories from Spring Boot backend (Neon PostgreSQL)
  useEffect(() => {
    let isMounted = true;
    repoApi
      .list()
      .then((backendRepos) => {
        if (!isMounted) return;
        if (Array.isArray(backendRepos)) {
          const mapped = backendRepos.map((r) => ({
            id: String(r.id),
            name: r.name,
            description: r.description || "No description provided.",
            lang: "Rust",
            langColor: "bg-orange-500",
            stars: 0,
            forks: 0,
            isStarred: false,
            updated: "Just now",
            isPrivate: r.isPrivate,
            lastAction: "Created in Neon Cloud",
          }));
          setRepos(mapped);
        }
      })
      .catch((err) => {
        console.debug("Backend repo sync error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      type: "pr",
      repo: "mygit-kernel",
      message: "Torvalds requested changes on PR #14: 'packfile delta compression v2'",
      time: "24m ago",
      unread: true,
      category: "review",
    },
    {
      id: "n2",
      type: "mention",
      repo: "cymatic-particle-ui",
      message: "@sarah mentioned you in issue #9: 'Shader pipeline stalls on WebGL 1 fallback'",
      time: "1h ago",
      unread: true,
      category: "mentioned",
    },
    {
      id: "n3",
      type: "security",
      repo: "auth-daemon",
      message: "Automated scan verified zero dependency vulnerabilities in Ed25519 module",
      time: "3h ago",
      unread: true,
      category: "all",
    },
    {
      id: "n4",
      type: "pr",
      repo: "mygit-kernel",
      message: "PR #12: 'boundary checks on loose object unpacker' merged by CI runner",
      time: "5h ago",
      unread: false,
      category: "all",
    },
    {
      id: "n5",
      type: "star",
      repo: "mygit-kernel",
      message: "@kesslau starred your repository mygit-kernel",
      time: "1d ago",
      unread: false,
      category: "all",
    },
  ]);

  // Pull Requests State
  const [pullRequests, setPullRequests] = useState([
    {
      id: 14,
      title: "feat: add packfile delta compression v2 with streaming unpacker",
      repo: "mygit-kernel",
      author: username,
      status: "Open",
      comments: 6,
      time: "2 hours ago",
      type: "created",
      needsReview: true,
    },
    {
      id: 11,
      title: "refactor: optimize memory pool allocation during loose object hashing",
      repo: "cymatic-particle-ui",
      author: "kesslau",
      status: "Open",
      comments: 3,
      time: "4 hours ago",
      type: "review_requested",
      needsReview: true,
    },
    {
      id: 12,
      title: "fix: boundary checks on loose object unpacker buffer underflow",
      repo: "mygit-kernel",
      author: username,
      status: "Merged",
      comments: 8,
      time: "5 hours ago",
      type: "created",
      needsReview: false,
    },
    {
      id: 7,
      title: "perf: vector SIMD implementation for SHA-1 and SHA-256 rolling hash",
      repo: "auth-daemon",
      author: "torvalds",
      status: "Closed",
      comments: 12,
      time: "2 days ago",
      type: "assigned",
      needsReview: false,
    },
  ]);

  // Issues State
  const [issues, setIssues] = useState([
    {
      id: 28,
      title: "Crash on corrupted pack index v2 with truncated checksum trailer",
      repo: "mygit-kernel",
      author: "alex",
      status: "Open",
      labels: ["bug", "priority-high"],
      comments: 4,
      time: "3 hours ago",
      type: "assigned",
    },
    {
      id: 24,
      title: "Support Apple Silicon hardware accelerated SHA-256 instructions",
      repo: "mygit-kernel",
      author: "alex",
      status: "Open",
      labels: ["enhancement", "performance"],
      comments: 7,
      time: "1 day ago",
      type: "created",
    },
    {
      id: 19,
      title: "Documentation: specify wire protocol v2 handshake negotiation flow",
      repo: "docs-specifications",
      author: "sophie",
      status: "Open",
      labels: ["documentation"],
      comments: 2,
      time: "2 days ago",
      type: "mentioned",
    },
    {
      id: 15,
      title: "WebSocket transport reconnection backoff policy jitter",
      repo: "cymatic-particle-ui",
      author: "alex",
      status: "Closed",
      labels: ["bug"],
      comments: 9,
      time: "4 days ago",
      type: "created",
    },
  ]);

  // Tokens State
  const [tokens, setTokens] = useState([
    {
      id: "t1",
      name: "macbook-terminal-cli",
      scopes: ["repo:read", "repo:write"],
      created: "Nov 12, 2026",
      lastUsed: "24m ago",
      expires: "90 days",
      tokenString: "mygit_pat_8feca4291034279b35c91b3b",
    },
    {
      id: "t2",
      name: "github-actions-sync-agent",
      scopes: ["repo:read"],
      created: "Oct 28, 2026",
      lastUsed: "2h ago",
      expires: "30 days",
      tokenString: "mygit_pat_91034279b35c91b3b8feca42",
    },
  ]);

  // SSH Keys State
  const [sshKeys, setSshKeys] = useState([
    {
      id: "k1",
      title: "Personal M3 Max MacBook",
      fingerprint: "SHA256:7f2b15f61cc746508213e5a668644b67",
      added: "Nov 01, 2026",
      lastUsed: "24m ago",
    },
    {
      id: "k2",
      title: "Linux Devbox Workstation",
      fingerprint: "SHA256:8feca4204e5ba11a6ed8b1173f9db734",
      added: "Oct 15, 2026",
      lastUsed: "2d ago",
    },
  ]);

  // Discussions State
  const [discussions] = useState([
    {
      id: "d1",
      title: "RFC: Implementing streaming delta compression for zero-copy git clone",
      category: "Ideas",
      author: username,
      replies: 14,
      lastActivity: "1h ago",
    },
    {
      id: "d2",
      title: "How to configure custom SSH ports for self-hosted edge mirrors?",
      category: "Q&A",
      author: "marcus_dev",
      replies: 8,
      lastActivity: "4h ago",
    },
    {
      id: "d3",
      title: "v1.1.0 Roadmap Announcement: Rust Kernel delta unpacker & WASM support",
      category: "Announcements",
      author: "mygit-team",
      replies: 29,
      lastActivity: "1d ago",
    },
  ]);

  // Contribution heatmap (52 weeks x 7 days)
  const heatmapData = useMemo(() => {
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

  // -------------------------------------------------------------
  // REPOSITORIES FILTERS & CRUD
  // -------------------------------------------------------------
  const [repoSearch, setRepoSearch] = useState("");
  const [repoTypeFilter, setRepoTypeFilter] = useState("all");
  const [repoLangFilter, setRepoLangFilter] = useState("all");
  const [repoSort, setRepoSort] = useState("updated");

  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
          r.description.toLowerCase().includes(repoSearch.toLowerCase());
        const matchesType =
          repoTypeFilter === "all"
            ? true
            : repoTypeFilter === "public"
            ? !r.isPrivate
            : r.isPrivate;
        const matchesLang =
          repoLangFilter === "all" ? true : r.lang.toLowerCase() === repoLangFilter.toLowerCase();
        return matchesSearch && matchesType && matchesLang;
      })
      .sort((a, b) => {
        if (repoSort === "stars") return b.stars - a.stars;
        if (repoSort === "name") return a.name.localeCompare(b.name);
        return 0; // Default order
      });
  }, [repos, repoSearch, repoTypeFilter, repoLangFilter, repoSort]);

  const toggleStar = (id: string) => {
    setRepos((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isStarred: !r.isStarred, stars: r.isStarred ? r.stars - 1 : r.stars + 1 } : r
      )
    );
  };

  // -------------------------------------------------------------
  // CREATE REPO FORM STATE
  // -------------------------------------------------------------
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [initReadme, setInitReadme] = useState(true);
  const [initGitignore, setInitGitignore] = useState(false);
  const [initLicense, setInitLicense] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [createdRepoSetup, setCreatedRepoSetup] = useState<string | null>(null);

  const isDuplicateName = repos.some((r) => r.name.toLowerCase() === newRepoName.trim().toLowerCase());
  const isValidRepoName = /^[a-zA-Z0-9_.-]+$/.test(newRepoName.trim());

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim() || isDuplicateName || !isValidRepoName) return;

    try {
      const created = await repoApi.create({
        name: newRepoName.trim(),
        description: newRepoDesc.trim(),
        isPrivate: newRepoPrivate,
      });

      const newR = {
        id: String(created.id),
        name: created.name,
        description: created.description || "No description provided.",
        lang: "Rust",
        langColor: "bg-orange-500",
        stars: 0,
        forks: 0,
        isStarred: false,
        updated: "Just now",
        isPrivate: created.isPrivate,
        lastAction: "Created in Neon Cloud",
      };

      setRepos((prev) => [newR, ...prev.filter((r) => r.name !== newR.name)]);
      setCreatedRepoSetup(newR.name);
      showToast(`Repository ${newR.name} created and saved to Neon DB!`);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to create repository";
      showToast(`Error: ${msg}`);
    }
  };

  const handleDeleteRepo = async (repoName: string) => {
    if (!window.confirm(`Are you sure you want to delete repository "${repoName}" from Neon DB?`)) {
      return;
    }
    try {
      await repoApi.delete(repoName);
      setRepos((prev) => prev.filter((r) => r.name !== repoName));
      showToast(`Repository ${repoName} deleted successfully.`);
    } catch (err: any) {
      showToast(`Error deleting repository: ${err.message || err}`);
    }
  };

  // -------------------------------------------------------------
  // IMPORT REPO FORM STATE
  // -------------------------------------------------------------
  const [importUrl, setImportUrl] = useState("");
  const [importRepoName, setImportRepoName] = useState("");
  const [importingState, setImportingState] = useState<"idle" | "running" | "success" | "error">("idle");
  const [importProgress, setImportProgress] = useState(0);

  const handleStartImport = () => {
    if (!importUrl) return;
    setImportingState("running");
    setImportProgress(10);
    const interval = setInterval(() => {
      setImportProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          setImportingState("success");
          return 100;
        }
        return p + 25;
      });
    }, 400);
  };

  // -------------------------------------------------------------
  // TOKEN GENERATION STATE
  // -------------------------------------------------------------
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenExpiry, setNewTokenExpiry] = useState("30 days");
  const [newTokenScopes, setNewTokenScopes] = useState<string[]>(["repo:read", "repo:write"]);
  const [justGeneratedToken, setJustGeneratedToken] = useState<string | null>(null);

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    const generated = "mygit_pat_" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const newT = {
      id: String(Date.now()),
      name: newTokenName.trim(),
      scopes: newTokenScopes,
      created: "Just now",
      lastUsed: "Never",
      expires: newTokenExpiry,
      tokenString: generated,
    };
    setTokens((prev) => [newT, ...prev]);
    setJustGeneratedToken(generated);
    setNewTokenName("");
  };

  // -------------------------------------------------------------
  // SSH KEY STATE
  // -------------------------------------------------------------
  const [showSshModal, setShowSshModal] = useState(false);
  const [newSshTitle, setNewSshTitle] = useState("");
  const [newSshKey, setNewSshKey] = useState("");
  const isValidSsh =
    newSshKey.trim().startsWith("ssh-ed25519") ||
    newSshKey.trim().startsWith("ssh-rsa") ||
    newSshKey.trim().startsWith("ecdsa-sha2");

  const handleAddSshKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSshTitle.trim() || !isValidSsh) return;
    const keyItem = {
      id: String(Date.now()),
      title: newSshTitle.trim(),
      fingerprint: "SHA256:" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10),
      added: "Just now",
      lastUsed: "Never",
    };
    setSshKeys((prev) => [keyItem, ...prev]);
    setNewSshTitle("");
    setNewSshKey("");
    setShowSshModal(false);
    showToast("SSH key added successfully!");
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS ACTIONS
  // -------------------------------------------------------------
  const [notifTab, setNotifTab] = useState("all");
  const unreadNotifsCount = notifications.filter((n) => n.unread).length;

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("All notifications marked as read.");
  };

  const markSingleNotifRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  // -------------------------------------------------------------
  // QUICK START STATE
  // -------------------------------------------------------------
  const [quickStepsDone, setQuickStepsDone] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
  });
  const completedStepsCount = Object.values(quickStepsDone).filter(Boolean).length;

  const toggleQuickStep = (index: number) => {
    setQuickStepsDone((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // -------------------------------------------------------------
  // RENDER MAIN CONTENT VIEW SWITCHER
  // -------------------------------------------------------------
  const renderContent = () => {
    switch (active) {
      // ---------------------------------------------------------
      // 1. ACTIVITY VIEW
      // ---------------------------------------------------------
      case "/activity": {
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Activity Timeline</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Chronological event audit of your commits, pull requests, and edge pushes
                </p>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-md border border-border/50 bg-foreground/5 text-xs">
                {["All", "Pushes", "Issues", "Pull Requests", "Stars"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className="px-2.5 py-1 rounded text-xs text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors"
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Grouping */}
            <div className="space-y-6">
              {/* Today */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-foreground/40 uppercase tracking-wider">Today</span>
                <div className="space-y-2 border-l border-border/50 pl-4 ml-2">
                  <div className="p-3.5 rounded-lg border border-border/50 bg-foreground/5 flex items-start gap-3">
                    <GitBranch className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-foreground">
                        You pushed 3 commits to <span className="font-semibold">mygit-kernel:main</span>
                      </p>
                      <p className="text-xs text-foreground/45 font-mono">
                        commit <code className="text-foreground/70">8feca42</code> · 24 minutes ago
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border/50 bg-foreground/5 flex items-start gap-3">
                    <GitPullRequest className="size-4 text-accent-pro mt-0.5 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-foreground">
                        Opened Pull Request #14: <span className="font-semibold">feat: add packfile delta compression v2</span>
                      </p>
                      <p className="text-xs text-foreground/45 font-mono">mygit-kernel · 2 hours ago</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border/50 bg-foreground/5 flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-blue-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-foreground">
                        Approved Pull Request #11: <span className="font-semibold">refactor: memory pool allocator</span>
                      </p>
                      <p className="text-xs text-foreground/45 font-mono">cymatic-particle-ui · 4 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yesterday */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-foreground/40 uppercase tracking-wider">Yesterday</span>
                <div className="space-y-2 border-l border-border/50 pl-4 ml-2">
                  <div className="p-3.5 rounded-lg border border-border/50 bg-foreground/5 flex items-start gap-3">
                    <Layers className="size-4 text-purple-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-foreground">
                        Merged PR #12: <span className="font-semibold">fix: boundary checks on loose object unpacker</span>
                      </p>
                      <p className="text-xs text-foreground/45 font-mono">mygit-kernel · 1 day ago</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border/50 bg-foreground/5 flex items-start gap-3">
                    <AlertCircle className="size-4 text-amber-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-foreground">
                        Closed issue #8: <span className="font-semibold">memory leak in packfile delta cache</span>
                      </p>
                      <p className="text-xs text-foreground/45 font-mono">mygit-kernel · 1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* This week */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-foreground/40 uppercase tracking-wider">This week</span>
                <div className="space-y-2 border-l border-border/50 pl-4 ml-2">
                  <div className="p-3.5 rounded-lg border border-border/50 bg-foreground/5 flex items-start gap-3">
                    <Star className="size-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-foreground">
                        Starred repository <span className="font-semibold">torvalds/linux</span>
                      </p>
                      <p className="text-xs text-foreground/45 font-mono">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => showToast("Loaded earlier activity records.")}
                className="w-full py-2.5 rounded-lg border border-border/50 bg-foreground/5 text-xs text-foreground/70 hover:text-foreground hover:bg-foreground/10 font-mono transition-colors"
              >
                Load more activity...
              </button>
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 2. NOTIFICATIONS VIEW
      // ---------------------------------------------------------
      case "/notifications": {
        const filteredNotifs = notifications.filter((n) => {
          if (notifTab === "unread") return n.unread;
          if (notifTab === "mentioned") return n.category === "mentioned";
          if (notifTab === "review") return n.category === "review";
          return true;
        });

        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadNotifsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-accent-pro/15 text-accent-pro border border-accent-pro/30">
                      {unreadNotifsCount} unread
                    </span>
                  )}
                </h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Stay synced with pull requests, mentions, and build pipelines
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={markAllNotifsRead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors"
                >
                  <CheckCheck className="size-3.5" />
                  <span>Mark all as read</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-md border border-border/50 bg-foreground/5 text-xs w-fit">
              {[
                { id: "all", label: "All" },
                { id: "unread", label: `Unread (${unreadNotifsCount})` },
                { id: "mentioned", label: "Mentioned" },
                { id: "review", label: "Review requests" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setNotifTab(tab.id)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    notifTab === tab.id
                      ? "bg-foreground/15 text-foreground font-medium"
                      : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notifications Rows */}
            {filteredNotifs.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-border/50 bg-foreground/5 space-y-2">
                <CheckCircle2 className="size-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">You’re all caught up.</h3>
                <p className="text-xs text-foreground/45 font-mono">No notifications to display in this view.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifs.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      item.unread
                        ? "border-border/60 bg-foreground/8 shadow-sm"
                        : "border-border/30 bg-foreground/2 opacity-75"
                    }`}
                  >
                    <div className="mt-1">
                      {item.unread ? (
                        <span className="size-2 rounded-full bg-blue-500 block" title="Unread" />
                      ) : (
                        <span className="size-2 rounded-full bg-transparent border border-border/60 block" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{item.repo}</span>
                        <span className="text-[11px] text-foreground/40 font-mono">· {item.time}</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{item.message}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.unread && (
                        <button
                          type="button"
                          onClick={() => markSingleNotifRead(item.id)}
                          className="p-1.5 rounded hover:bg-foreground/10 text-foreground/50 hover:text-foreground text-xs"
                          title="Mark as read"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => showToast("Thread muted.")}
                        className="px-2 py-1 rounded hover:bg-foreground/10 text-foreground/40 hover:text-foreground text-[11px] font-mono"
                      >
                        Mute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // ---------------------------------------------------------
      // 3. QUICK START VIEW
      // ---------------------------------------------------------
      case "/quickstart": {
        const steps = [
          {
            num: 1,
            title: "Create a repository",
            desc: "Initialize a new distributed repository directly on mygit edge.",
            cmd: "mygit repo create my-project --public",
          },
          {
            num: 2,
            title: "Generate an access token",
            desc: "Create an Ed25519 or Personal Access Token for terminal authentication.",
            cmd: "mygit auth token create --name 'Terminal Token' --scopes 'repo,write'",
          },
          {
            num: 3,
            title: "Install the terminal tool",
            desc: "Download the prebuilt native CLI binary for your OS.",
            cmd: "curl -fsSL https://mygit.dev/install.sh | bash",
          },
          {
            num: 4,
            title: "Log in from the terminal",
            desc: "Configure your CLI session to talk to mygit's edge network.",
            cmd: `mygit auth login --email ${userEmail}`,
          },
          {
            num: 5,
            title: "Push your first commit",
            desc: "Set your remote URL and push your local main branch.",
            cmd: `git remote add mygit mygit://mygit.dev/${username}/my-project.git && git push mygit main`,
          },
        ];

        return (
          <div className="space-y-6 max-w-4xl">
            <div className="border-b border-border/50 pb-5 space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Developer Quick Start</h1>
              <p className="text-xs text-foreground/50 font-mono">
                Get from zero to pushing byte-compatible commits in under 3 minutes
              </p>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-foreground/60">
                  <span>Progress</span>
                  <span className="text-accent-pro font-medium">
                    {completedStepsCount} of {steps.length} completed ({Math.round((completedStepsCount / steps.length) * 100)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-pro to-emerald-400 transition-all duration-500"
                    style={{ width: `${(completedStepsCount / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-3">
              {steps.map((step) => {
                const isDone = !!quickStepsDone[step.num];
                return (
                  <div
                    key={step.num}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-foreground/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleQuickStep(step.num)}
                          className="mt-0.5 text-foreground/60 hover:text-foreground"
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          ) : (
                            <Circle className="size-4 text-foreground/30" />
                          )}
                        </button>
                        <div className="space-y-0.5">
                          <h3 className={`text-sm font-semibold ${isDone ? "line-through text-foreground/60" : "text-foreground"}`}>
                            {step.num}. {step.title}
                          </h3>
                          <p className="text-xs text-foreground/50">{step.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable command block */}
                    <div className="mt-3 pl-7">
                      <div className="p-2.5 rounded-lg border border-border/40 bg-black/60 flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre">
                          $ {step.cmd}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(step.cmd)}
                          className="text-foreground/40 hover:text-foreground shrink-0 p-1 rounded"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Troubleshooting Section */}
            <div className="p-5 rounded-xl border border-border/50 bg-foreground/5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="size-4 text-amber-400" />
                Troubleshooting & FAQ
              </h3>
              <div className="space-y-2 text-xs text-foreground/60 leading-relaxed font-mono">
                <div>
                  <p className="text-foreground font-semibold">Q: Permission denied (publickey)?</p>
                  <p className="text-foreground/50">
                    Verify your key is loaded with <code className="text-foreground/80">ssh-add -l</code> and matches the key under Account &gt; SSH Keys.
                  </p>
                </div>
                <div>
                  <p className="text-foreground font-semibold">Q: fatal: remote origin already exists?</p>
                  <p className="text-foreground/50">
                    Use <code className="text-foreground/80">git remote set-url origin &lt;url&gt;</code> or add a new remote named <code className="text-foreground/80">mygit</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 4. YOUR REPOSITORIES VIEW
      // ---------------------------------------------------------
      case "/repositories": {
        return (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Your Repositories</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Manage repositories hosted on the byte-compatible edge
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive("/new")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent-pro text-white text-xs font-medium hover:opacity-90 transition-opacity self-start sm:self-auto shadow-sm"
              >
                <Plus className="size-3.5" />
                <span>New Repository</span>
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Find a repository..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground outline-none focus:border-border transition-colors font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={repoTypeFilter}
                  onChange={(e) => setRepoTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground outline-none font-mono"
                >
                  <option value="all">Type: All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>

                <select
                  value={repoLangFilter}
                  onChange={(e) => setRepoLangFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground outline-none font-mono"
                >
                  <option value="all">Language: All</option>
                  <option value="rust">Rust</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="mdx">MDX</option>
                </select>

                <select
                  value={repoSort}
                  onChange={(e) => setRepoSort(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground outline-none font-mono"
                >
                  <option value="updated">Sort: Last updated</option>
                  <option value="name">Sort: Name</option>
                  <option value="stars">Sort: Stars</option>
                </select>
              </div>
            </div>

            {/* Repositories List */}
            {filteredRepos.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-border/50 bg-foreground/5 space-y-3">
                <FolderPlus className="size-8 text-foreground/40 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">No repositories found</h3>
                <p className="text-xs text-foreground/45 max-w-sm mx-auto font-mono">
                  {repoSearch ? "No repositories match your search query." : "You have not created any repositories yet."}
                </p>
                <button
                  type="button"
                  onClick={() => setActive("/new")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent-pro text-white text-xs font-medium"
                >
                  <Plus className="size-3.5" />
                  <span>Create your first repository</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-5 rounded-xl border border-border/50 bg-foreground/5 hover:border-border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
                          {repo.name}
                        </span>
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
                      <p className="text-xs text-foreground/60 max-w-2xl leading-relaxed">{repo.description}</p>
                      <div className="flex items-center gap-4 text-xs text-foreground/40 font-mono pt-1">
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
                        <span>Updated {repo.updated}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleStar(repo.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                          repo.isStarred
                            ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                            : "border-border/50 bg-foreground/5 text-foreground/60 hover:text-foreground"
                        }`}
                      >
                        <Star className="size-3.5 fill-current" />
                        <span>{repo.isStarred ? "Starred" : "Star"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`git clone mygit://mygit.dev/${username}/${repo.name}.git`)}
                        className="px-2.5 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground/60 hover:text-foreground font-mono transition-colors"
                        title="Copy clone URL"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRepo(repo.name)}
                        className="px-2.5 py-1.5 rounded-md border border-red-500/30 bg-red-500/5 text-xs text-red-500/70 hover:text-red-500 hover:bg-red-500/15 font-mono transition-colors"
                        title="Delete repository"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // ---------------------------------------------------------
      // 5. STARRED VIEW
      // ---------------------------------------------------------
      case "/starred": {
        const starredRepos = repos.filter((r) => r.isStarred);

        return (
          <div className="space-y-6 max-w-5xl">
            <div className="border-b border-border/50 pb-5">
              <h1 className="text-2xl font-bold text-foreground">Starred Repositories</h1>
              <p className="text-xs text-foreground/50 font-mono mt-1">
                Repositories you have bookmarked for quick access
              </p>
            </div>

            {starredRepos.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-border/50 bg-foreground/5 space-y-2">
                <Star className="size-8 text-foreground/30 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">No starred repositories</h3>
                <p className="text-xs text-foreground/45 font-mono">Star repositories to find them here later.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {starredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-5 rounded-xl border border-border/50 bg-foreground/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
                          {repo.name}
                        </span>
                        <span className="text-xs text-foreground/40 font-mono">· {repo.lang}</span>
                      </div>
                      <p className="text-xs text-foreground/60 max-w-xl">{repo.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStar(repo.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground/70 hover:text-foreground hover:border-border font-mono transition-colors self-start sm:self-auto"
                    >
                      <Star className="size-3 text-yellow-400 fill-yellow-400" />
                      <span>Unstar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // ---------------------------------------------------------
      // 6. CREATE NEW REPOSITORY VIEW
      // ---------------------------------------------------------
      case "/new": {
        if (createdRepoSetup) {
          return (
            <div className="space-y-6 max-w-3xl">
              <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="size-5" />
                  <h2 className="text-base font-bold text-foreground">
                    Repository {username}/{createdRepoSetup} created!
                  </h2>
                </div>
                <p className="text-xs text-foreground/60">
                  Quick setup — initialize on any device using the <code className="text-emerald-400 font-mono">mygit</code> terminal or push an existing project:
                </p>

                <div className="p-4 rounded-xl bg-black/90 border border-border/50 space-y-3 font-mono text-xs overflow-x-auto text-neutral-200">
                  <div className="space-y-1">
                    <p className="text-neutral-500 font-sans font-medium text-[11px]"># Option 1: Initialize on your terminal on any device</p>
                    <p className="text-emerald-400">mygit init {createdRepoSetup}</p>
                    <p className="text-neutral-300">cd {createdRepoSetup}</p>
                    <p className="text-neutral-300">echo &quot;# {createdRepoSetup}&quot; &gt; README.md</p>
                    <p className="text-neutral-300">mygit add .</p>
                    <p className="text-neutral-300">mygit commit -m &quot;Initial commit&quot;</p>
                  </div>
                  <div className="space-y-1 pt-2.5 border-t border-neutral-800">
                    <p className="text-neutral-500 font-sans font-medium text-[11px]"># Option 2: Link an existing repository</p>
                    <p className="text-cyan-400">mygit remote add origin https://mygit-backend-y27o.onrender.com/api/repos/{createdRepoSetup}</p>
                    <p className="text-cyan-400">mygit push origin main</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedRepoSetup(null);
                      setActive("/repositories");
                    }}
                    className="px-4 py-2 rounded-md bg-accent-pro text-white text-xs font-medium"
                  >
                    Go to Repositories
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6 max-w-3xl">
            <div className="border-b border-border/50 pb-5">
              <h1 className="text-2xl font-bold text-foreground">Create a new repository</h1>
              <p className="text-xs text-foreground/50 font-mono mt-1">
                A repository contains all project files, including the revision history.
              </p>
            </div>

            <form onSubmit={handleCreateRepo} className="space-y-6">
              {/* Owner and Repo name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs font-mono text-foreground/50 block mb-1">Owner</label>
                  <div className="px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs font-mono text-foreground flex items-center gap-2">
                    <User className="size-3.5 text-foreground/40" />
                    <span>{username}</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-foreground/50">Repository name *</label>
                    {newRepoName && (
                      <span className="text-[11px] font-mono">
                        {isDuplicateName ? (
                          <span className="text-accent-pro">Name already taken</span>
                        ) : !isValidRepoName ? (
                          <span className="text-accent-pro">Invalid characters</span>
                        ) : (
                          <span className="text-emerald-400">Available</span>
                        )}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. distributed-kv-store"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none focus:border-border"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono text-foreground/50 block mb-1">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Short summary of this project..."
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground outline-none focus:border-border font-mono"
                />
              </div>

              {/* Visibility */}
              <div className="space-y-3 pt-2 border-t border-border/30">
                <label className="text-xs font-mono text-foreground/50 block">Visibility</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-foreground/5 cursor-pointer hover:border-border/70">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!newRepoPrivate}
                      onChange={() => setNewRepoPrivate(false)}
                      className="mt-1"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="size-3.5 text-foreground/60" />
                        <span>Public</span>
                      </p>
                      <p className="text-foreground/50">Anyone on the internet can see and clone this repository.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-foreground/5 cursor-pointer hover:border-border/70">
                    <input
                      type="radio"
                      name="visibility"
                      checked={newRepoPrivate}
                      onChange={() => setNewRepoPrivate(true)}
                      className="mt-1"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Lock className="size-3.5 text-foreground/60" />
                        <span>Private</span>
                      </p>
                      <p className="text-foreground/50">You choose who can see and commit to this repository.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Initialize Options */}
              <div className="space-y-2.5 pt-2 border-t border-border/30">
                <label className="text-xs font-mono text-foreground/50 block">Initialize this repository with:</label>
                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initReadme}
                    onChange={(e) => setInitReadme(e.target.checked)}
                  />
                  <span>Add a README file</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initGitignore}
                    onChange={(e) => setInitGitignore(e.target.checked)}
                  />
                  <span>Add .gitignore template (Rust / Node / Go)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initLicense}
                    onChange={(e) => setInitLicense(e.target.checked)}
                  />
                  <span>Choose an open-source license (MIT License)</span>
                </label>
              </div>

              {/* Default branch */}
              <div>
                <label className="text-xs font-mono text-foreground/50 block mb-1">Default branch name</label>
                <input
                  type="text"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  className="w-48 px-3 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs font-mono text-foreground"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <button
                  type="submit"
                  disabled={!newRepoName.trim() || isDuplicateName || !isValidRepoName}
                  className="px-5 py-2 rounded-md bg-accent-pro text-white text-xs font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  Create repository
                </button>
                <button
                  type="button"
                  onClick={() => setActive("/repositories")}
                  className="px-4 py-2 rounded-md border border-border/50 text-xs text-foreground/60 hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 7. IMPORT REPOSITORY VIEW
      // ---------------------------------------------------------
      case "/import": {
        return (
          <div className="space-y-6 max-w-3xl">
            <div className="border-b border-border/50 pb-5">
              <h1 className="text-2xl font-bold text-foreground">Import Repository</h1>
              <p className="text-xs text-foreground/50 font-mono mt-1">
                Clone an existing Git repository from GitHub, GitLab, or Bitbucket onto mygit
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-4">
              <div>
                <label className="text-xs font-mono text-foreground/50 block mb-1">Your old repository's clone URL *</label>
                <input
                  type="url"
                  placeholder="https://github.com/torvalds/linux.git"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none focus:border-border"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-foreground/50 block mb-1">New repository name</label>
                <input
                  type="text"
                  placeholder="linux-kernel-mirror"
                  value={importRepoName}
                  onChange={(e) => setImportRepoName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none focus:border-border"
                />
              </div>

              {importingState === "running" && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-foreground/60">
                    <span>Importing packfiles & delta trees...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className="h-full bg-accent-pro transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {importingState === "success" && (
                <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Repository imported successfully! All commits and tags verified.</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={!importUrl || importingState === "running"}
                  onClick={handleStartImport}
                  className="px-4 py-2 rounded-md bg-accent-pro text-white text-xs font-medium disabled:opacity-50"
                >
                  {importingState === "running" ? "Importing..." : "Begin import"}
                </button>
              </div>
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 8. RECENT VIEW
      // ---------------------------------------------------------
      case "/recent": {
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Recent Repositories</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Repositories you have recently opened, pushed to, or reviewed
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast("Recent history cleared.");
                }}
                className="text-xs font-mono text-foreground/40 hover:text-accent-pro"
              >
                Clear history
              </button>
            </div>

            <div className="space-y-2.5">
              {repos.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
                        {username}/{repo.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 rounded border border-border/50 text-foreground/40">
                        {repo.isPrivate ? "Private" : "Public"}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 font-mono">{repo.lastAction}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActive("/repositories")}
                    className="text-xs font-mono text-foreground/50 hover:text-foreground inline-flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ExternalLink className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 9. PULL REQUESTS VIEW
      // ---------------------------------------------------------
      case "/pulls": {
        const openPRs = pullRequests.filter((p) => p.status === "Open");
        const closedPRs = pullRequests.filter((p) => p.status !== "Open");

        return (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pull Requests</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Collaborative code review with zero-copy tree diffs
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-foreground/60">
                <span className="text-emerald-400 font-semibold">{openPRs.length} Open</span>
                <span>·</span>
                <span>{closedPRs.length} Closed</span>
              </div>
            </div>

            {/* PR Rows */}
            <div className="space-y-2.5">
              {pullRequests.map((pr) => (
                <div
                  key={pr.id}
                  className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <GitPullRequest
                      className={`size-4 mt-0.5 shrink-0 ${
                        pr.status === "Open"
                          ? "text-emerald-400"
                          : pr.status === "Merged"
                          ? "text-purple-400"
                          : "text-foreground/40"
                      }`}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
                          {pr.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                            pr.status === "Open"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : pr.status === "Merged"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : "bg-foreground/10 text-foreground/50 border-border/50"
                          }`}
                        >
                          {pr.status}
                        </span>
                        {pr.needsReview && (
                          <span className="text-[10px] font-mono px-1.5 rounded bg-accent-pro/15 text-accent-pro border border-accent-pro/30">
                            Needs review
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/45 font-mono">
                        #{pr.id} opened {pr.time} by {pr.author} · {pr.repo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-mono shrink-0">
                    <MessageSquare className="size-3.5" />
                    <span>{pr.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 10. ISSUES VIEW
      // ---------------------------------------------------------
      case "/issues": {
        return (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Issues</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Track bugs, improvements, and system tasks across repositories
                </p>
              </div>

              <button
                type="button"
                onClick={() => showToast("Opening issue creator...")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
              >
                <Plus className="size-3.5" />
                <span>New Issue</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={`size-4 mt-0.5 shrink-0 ${
                        issue.status === "Open" ? "text-emerald-400" : "text-purple-400"
                      }`}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
                          {issue.title}
                        </span>
                        {issue.labels.map((lbl) => (
                          <span
                            key={lbl}
                            className="text-[10px] font-mono px-2 py-0.2 rounded border border-border/50 text-foreground/60 bg-foreground/5"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-foreground/45 font-mono">
                        #{issue.id} opened {issue.time} by {issue.author} · {issue.repo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-mono shrink-0">
                    <MessageSquare className="size-3.5" />
                    <span>{issue.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 11. REVIEWS VIEW
      // ---------------------------------------------------------
      case "/reviews": {
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="border-b border-border/50 pb-5">
              <h1 className="text-2xl font-bold text-foreground">Code Reviews</h1>
              <p className="text-xs text-foreground/50 font-mono mt-1">
                Pull requests awaiting your review and recent review history
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-5 rounded-xl border border-accent-pro/30 bg-accent-pro/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-accent-pro font-medium">1 AWAITING YOUR REVIEW</span>
                  <span className="text-xs font-mono text-foreground/40">mygit-kernel</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  #14 feat: add packfile delta compression v2 with streaming unpacker
                </h3>
                <p className="text-xs text-foreground/60">
                  Requested by @torvalds · Changes: +412 / -89 across 6 files
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast("Opening diff viewer...")}
                    className="px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
                  >
                    Jump to Diff
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("Review approved.")}
                    className="px-3 py-1.5 rounded-md border border-border/50 text-xs text-foreground/70 hover:text-foreground"
                  >
                    Approve
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border/50 bg-foreground/5 space-y-2 opacity-80">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span>APPROVED BY YOU</span>
                  <span className="text-foreground/40">cymatic-particle-ui</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  #11 refactor: optimize memory pool allocation during loose object hashing
                </h3>
                <p className="text-xs text-foreground/50">Reviewed 4 hours ago · All checks passed</p>
              </div>
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 12. DISCUSSIONS VIEW
      // ---------------------------------------------------------
      case "/discussions": {
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Discussions</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Open community forums, architecture RFCs, and Q&A
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast("Starting discussion draft...")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
              >
                <Plus className="size-3.5" />
                <span>New Discussion</span>
              </button>
            </div>

            <div className="space-y-3">
              {discussions.map((d) => (
                <div
                  key={d.id}
                  className="p-5 rounded-xl border border-border/50 bg-foreground/5 space-y-2 hover:border-border transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border/50 bg-foreground/10 text-foreground/70">
                      {d.category}
                    </span>
                    <span className="text-xs text-foreground/40 font-mono">
                      by {d.author} · {d.lastActivity}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground hover:underline">{d.title}</h3>
                  <p className="text-xs text-foreground/40 font-mono flex items-center gap-1">
                    <MessageSquare className="size-3" />
                    <span>{d.replies} replies</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 13. PROFILE VIEW
      // ---------------------------------------------------------
      case "/profile": {
        return (
          <div className="space-y-8 max-w-4xl">
            {/* Header info */}
            <div className="p-6 rounded-2xl border border-border/50 bg-foreground/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="size-20 rounded-2xl bg-gradient-to-tr from-accent-pro to-orange-500 flex items-center justify-center font-bold text-2xl text-white uppercase shadow-lg shadow-accent-pro/20">
                {username.slice(0, 2)}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h1 className="text-2xl font-bold text-foreground capitalize">{username} Mercer</h1>
                  <button
                    type="button"
                    onClick={() => showToast("Edit profile dialog opened.")}
                    className="px-3.5 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs font-mono text-foreground hover:border-border"
                  >
                    Edit profile
                  </button>
                </div>
                <p className="text-xs font-mono text-accent-pro">@{username}</p>
                <p className="text-xs text-foreground/70 leading-relaxed max-w-xl">
                  Distributed systems hacker & Rust kernel engineer. Architecting byte-compatible Git for edge cloud runtimes.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-foreground/50 pt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> San Francisco, CA
                  </span>
                  <span className="flex items-center gap-1">
                    <LinkIcon className="size-3" /> https://{username}.dev
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> Joined January 2026
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-foreground/60 pt-1">
                  <span>
                    <strong className="text-foreground">142</strong> followers
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-foreground">88</strong> following
                  </span>
                </div>
              </div>
            </div>

            {/* Pinned Repositories */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">Pinned Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.slice(0, 2).map((repo) => (
                  <div key={repo.id} className="p-4 rounded-xl border border-border/50 bg-foreground/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{repo.name}</span>
                      <span className="text-[10px] font-mono px-1.5 rounded border border-border/50 text-foreground/50">
                        Public
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 line-clamp-2">{repo.description}</p>
                    <div className="flex items-center gap-3 text-xs text-foreground/40 font-mono pt-2">
                      <span className="flex items-center gap-1">
                        <span className={`size-2 rounded-full ${repo.langColor}`} />
                        {repo.lang}
                      </span>
                      <span>★ {repo.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contribution heatmap in Profile */}
            <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">348 contributions in 2026</h3>
              <div className="overflow-x-auto pb-1 no-scrollbar">
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                  {heatmapData.flatMap((week, wi) =>
                    week.map((level, di) => (
                      <div
                        key={`${wi}-${di}`}
                        className={`size-3 rounded-sm border ${heatMapColors[level]}`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 14. ACCESS TOKENS VIEW
      // ---------------------------------------------------------
      case "/tokens": {
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Personal Access Tokens</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Use personal access tokens to authenticate the mygit CLI and automated CI pipelines
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTokenModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
              >
                <Plus className="size-3.5" />
                <span>Generate New Token</span>
              </button>
            </div>

            {/* Just Generated Banner */}
            {justGeneratedToken && (
              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <AlertCircle className="size-4" />
                  <span>Make sure to copy your personal access token now. You won't be able to see it again!</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/80 border border-border/50 flex items-center justify-between font-mono text-xs text-emerald-400">
                  <span>{justGeneratedToken}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(justGeneratedToken)}
                    className="p-1 hover:text-white"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Tokens Table */}
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{token.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-foreground/50">
                        Expires in {token.expires}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-foreground/40">
                      <span>Created {token.created}</span>
                      <span>·</span>
                      <span>Last used {token.lastUsed}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      {token.scopes.map((s) => (
                        <span key={s} className="text-[10px] font-mono px-1.5 rounded bg-foreground/10 text-foreground/60">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTokens((prev) => prev.filter((t) => t.id !== token.id));
                      showToast(`Token ${token.name} revoked.`);
                    }}
                    className="text-xs font-mono text-accent-pro hover:underline self-start sm:self-auto"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>

            {/* Generation Modal */}
            {showTokenModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleGenerateToken}
                  className="max-w-md w-full p-6 rounded-2xl border border-border/50 bg-[#070b10] space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-bold text-sm text-foreground">Generate New Access Token</h3>
                    <button
                      type="button"
                      onClick={() => setShowTokenModal(false)}
                      className="text-foreground/40 hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Token Note / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CI runner on AWS"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Expiration</label>
                    <select
                      value={newTokenExpiry}
                      onChange={(e) => setNewTokenExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    >
                      <option value="7 days">7 days</option>
                      <option value="30 days">30 days</option>
                      <option value="90 days">90 days</option>
                      <option value="No expiration">No expiration</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Scopes</label>
                    <div className="space-y-1.5 text-xs text-foreground/70 font-mono">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>repo:read (Clone and fetch trees)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>repo:write (Push commits & tags)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span>repo:delete (Delete repository)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setShowTokenModal(false)}
                      className="px-3 py-1.5 rounded-md border border-border/50 text-xs text-foreground/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
                    >
                      Generate token
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      }

      // ---------------------------------------------------------
      // 15. SSH KEYS VIEW
      // ---------------------------------------------------------
      case "/ssh": {
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">SSH Keys</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Manage public cryptographic keys for Git over SSH edge transport
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSshModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
              >
                <Plus className="size-3.5" />
                <span>Add SSH Key</span>
              </button>
            </div>

            {/* Help instructions */}
            <div className="p-4 rounded-xl border border-border/50 bg-foreground/5 text-xs text-foreground/60 font-mono space-y-1">
              <p className="text-foreground font-semibold">Generate a new Ed25519 SSH key pair:</p>
              <div className="p-2 rounded bg-black/80 border border-border/40 text-emerald-400 flex items-center justify-between">
                <code>ssh-keygen -t ed25519 -C "{userEmail}"</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`ssh-keygen -t ed25519 -C "${userEmail}"`)}
                  className="p-1 text-foreground/40 hover:text-white"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            </div>

            {/* Key List */}
            <div className="space-y-3">
              {sshKeys.map((k) => (
                <div
                  key={k.id}
                  className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="size-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-sm text-foreground">{k.title}</span>
                    </div>
                    <p className="text-xs font-mono text-foreground/40">{k.fingerprint}</p>
                    <p className="text-[11px] font-mono text-foreground/40">
                      Added on {k.added} · Last used {k.lastUsed}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSshKeys((prev) => prev.filter((item) => item.id !== k.id));
                      showToast(`Key ${k.title} deleted.`);
                    }}
                    className="text-xs font-mono text-accent-pro hover:underline self-start sm:self-auto flex items-center gap-1"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add SSH Key Modal */}
            {showSshModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleAddSshKey}
                  className="max-w-lg w-full p-6 rounded-2xl border border-border/50 bg-[#070b10] space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-bold text-sm text-foreground">Add new SSH Key</h3>
                    <button
                      type="button"
                      onClick={() => setShowSshModal(false)}
                      className="text-foreground/40 hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Workstation Laptop"
                      value={newSshTitle}
                      onChange={(e) => setNewSshTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Key *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Begins with 'ssh-ed25519', 'ssh-rsa', or 'ecdsa-sha2'..."
                      value={newSshKey}
                      onChange={(e) => setNewSshKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                    {newSshKey && !isValidSsh && (
                      <p className="text-[11px] font-mono text-accent-pro mt-1">
                        Key must begin with ssh-ed25519, ssh-rsa, or ecdsa-sha2.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setShowSshModal(false)}
                      className="px-3 py-1.5 rounded-md border border-border/50 text-xs text-foreground/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newSshTitle.trim() || !isValidSsh}
                      className="px-4 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium disabled:opacity-50"
                    >
                      Add key
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      }

      // ---------------------------------------------------------
      // 16. SETTINGS VIEW
      // ---------------------------------------------------------
      case "/settings": {
        return (
          <div className="space-y-8 max-w-3xl">
            <div className="border-b border-border/50 pb-5">
              <h1 className="text-2xl font-bold text-foreground">Account & System Settings</h1>
              <p className="text-xs text-foreground/50 font-mono mt-1">
                Manage your credentials, notification routing, and active sessions
              </p>
            </div>

            {/* Profile Settings */}
            <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Profile & Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-foreground/50 block mb-1">Username</label>
                  <input
                    type="text"
                    defaultValue={username}
                    className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-foreground/50 block mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={userEmail}
                    className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast("Account details updated.")}
                className="px-4 py-1.5 rounded-md bg-foreground/10 text-xs font-mono text-foreground hover:bg-foreground/15 border border-border/50"
              >
                Save changes
              </button>
            </div>

            {/* Notifications Preferences */}
            <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
              <div className="space-y-2 text-xs text-foreground/70 font-mono">
                <label className="flex items-center justify-between p-2 rounded hover:bg-foreground/5 cursor-pointer">
                  <span>Email notifications for Pull Request reviews</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-2 rounded hover:bg-foreground/5 cursor-pointer">
                  <span>Direct mentions and issue assignments</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-2 rounded hover:bg-foreground/5 cursor-pointer">
                  <span>Weekly digest of starred repositories</span>
                  <input type="checkbox" />
                </label>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
              <div className="space-y-2 text-xs font-mono text-foreground/60">
                <div className="flex items-center justify-between p-2.5 rounded border border-border/30 bg-background/50">
                  <div>
                    <p className="text-foreground font-medium">Chrome on Linux (This browser)</p>
                    <p className="text-[11px] text-foreground/40">IP: 192.168.1.104 · Last active now</p>
                  </div>
                  <span className="text-[10px] text-emerald-400">Current session</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-xl border border-accent-pro/40 bg-accent-pro/5 space-y-3">
              <h3 className="text-sm font-semibold text-accent-pro flex items-center gap-2">
                <AlertCircle className="size-4" />
                <span>Danger Zone</span>
              </h3>
              <p className="text-xs text-foreground/60">
                Permanently delete your developer profile, repositories, access tokens, and edge storage.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete your developer account?")) {
                    onSignOut?.();
                  }
                }}
                className="px-4 py-2 rounded-md bg-accent-pro text-white text-xs font-medium hover:opacity-90"
              >
                Delete account
              </button>
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // DEFAULT: /dashboard (Active view)
      // ---------------------------------------------------------
      default: {
        return (
          <div className="max-w-6xl space-y-8">
            {/* Top 5 blocks from specification */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-foreground/40 flex items-center gap-2">
                <span>Overview</span>
                <span>/</span>
                <span className="text-foreground/70 font-medium">Dashboard</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {username}
              </h1>

              <div className="flex flex-col gap-1 text-sm text-foreground/60 leading-relaxed">
                <p>
                  You have <span className="text-foreground font-medium">4 repositories</span>,{" "}
                  <span className="text-foreground font-medium">2 open pull requests</span>, and{" "}
                  <span className="text-accent-pro font-medium">3 unread notifications</span>.
                </p>
                <p className="text-foreground/45">
                  All edge remote operations are healthy and synced across 3 global points of presence.
                </p>
                <p className="text-xs text-foreground/40 font-mono">
                  Last push was 24 minutes ago to <code className="text-foreground/70">mygit-kernel:main</code>.
                </p>
              </div>
            </div>

            {/* Contribution heatmap card */}
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

            {/* Footer tip line */}
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

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                <p className="text-xs text-foreground/40 font-mono">Repositories</p>
                <p className="text-2xl font-bold text-foreground">{repos.length}</p>
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
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Recent Repositories</h3>
                  <button
                    type="button"
                    onClick={() => setActive("/repositories")}
                    className="text-xs text-foreground/40 hover:text-foreground font-mono"
                  >
                    View all ({repos.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {repos.slice(0, 4).map((repo) => (
                    <div
                      key={repo.id}
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

              {/* Activity mini column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                  <button
                    type="button"
                    onClick={() => setActive("/activity")}
                    className="text-xs text-foreground/40 hover:text-foreground font-mono"
                  >
                    View timeline →
                  </button>
                </div>

                <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-4">
                  <div className="flex gap-2.5 text-xs">
                    <div className="size-1.5 rounded-full bg-accent-pro mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-foreground/70 leading-snug">
                        Pushed 3 commits to <span className="font-medium text-foreground">mygit-kernel:main</span>
                      </p>
                      <p className="text-[10px] font-mono text-foreground/40">24 minutes ago · 8feca42</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 text-xs">
                    <div className="size-1.5 rounded-full bg-accent-pro mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-foreground/70 leading-snug">
                        Opened PR #14: <span className="font-medium text-foreground">packfile delta compression v2</span>
                      </p>
                      <p className="text-[10px] font-mono text-foreground/40">2 hours ago · Needs review</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 text-xs">
                    <div className="size-1.5 rounded-full bg-accent-pro mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-foreground/70 leading-snug">
                        Merged PR #12 into <span className="font-medium text-foreground">mygit-kernel:main</span>
                      </p>
                      <p className="text-[10px] font-mono text-foreground/40">5 hours ago · a4204e5</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quick Start Checklist & CLI Snippet Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-lg border border-border/50 bg-foreground/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Quick Start Checklist
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActive("/quickstart")}
                    className="text-xs text-foreground/40 hover:text-foreground font-mono"
                  >
                    Full guide →
                  </button>
                </div>
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
        );
      }
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg border border-border bg-card text-xs font-mono text-foreground shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

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
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setActive("/dashboard")}
              >
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
                  setMobileMenuOpen(false);
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
                  setMobileMenuOpen(false);
                }}
              />
              <Sidebar001Item
                href="/notifications"
                label="Notifications"
                isActive={active === "/notifications"}
                isNew={unreadNotifsCount > 0}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/notifications");
                  setMobileMenuOpen(false);
                }}
              />
              <Sidebar001Item
                href="/quickstart"
                label="Quick Start"
                isActive={active === "/quickstart"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/quickstart");
                  setMobileMenuOpen(false);
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
                  setMobileMenuOpen(false);
                }}
              />
              <Sidebar001Item
                href="/starred"
                label="Starred"
                isActive={active === "/starred"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/starred");
                  setMobileMenuOpen(false);
                }}
              />
              <Sidebar001Item
                href="/new"
                label="Create New Repository"
                isActive={active === "/new"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/new");
                  setMobileMenuOpen(false);
                }}
              />
              <Sidebar001Item
                href="/import"
                label="Import Repository"
                isActive={active === "/import"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/import");
                  setMobileMenuOpen(false);
                }}
              />
              <Sidebar001Item
                href="/recent"
                label="Recent"
                isActive={active === "/recent"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/recent");
                  setMobileMenuOpen(false);
                }}
              />
            </Sidebar001Section>

            {/* Collaboration (collapsible group) */}
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
                    setMobileMenuOpen(false);
                  }}
                />
                <Sidebar001Item
                  href="/issues"
                  label="Issues"
                  isActive={active === "/issues"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/issues");
                    setMobileMenuOpen(false);
                  }}
                />
                <Sidebar001Item
                  href="/reviews"
                  label="Reviews"
                  isActive={active === "/reviews"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/reviews");
                    setMobileMenuOpen(false);
                  }}
                />
                <Sidebar001Item
                  href="/discussions"
                  label="Discussions"
                  isActive={active === "/discussions"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/discussions");
                    setMobileMenuOpen(false);
                  }}
                />
              </Sidebar001Group>
            </Sidebar001Section>

            {/* Account (bottom group) */}
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
                    setMobileMenuOpen(false);
                  }}
                />
                <Sidebar001Item
                  href="/tokens"
                  label="Access Tokens"
                  isActive={active === "/tokens"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/tokens");
                    setMobileMenuOpen(false);
                  }}
                />
                <Sidebar001Item
                  href="/ssh"
                  label="SSH Keys"
                  isActive={active === "/ssh"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/ssh");
                    setMobileMenuOpen(false);
                  }}
                />
                <Sidebar001Item
                  href="/settings"
                  label="Settings"
                  isActive={active === "/settings"}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("/settings");
                    setMobileMenuOpen(false);
                  }}
                />
                <Sidebar001Item
                  href="#signout"
                  label="Sign out"
                  isActive={false}
                  onClick={(e) => {
                    e.preventDefault();
                    showToast("You've been signed out.");
                    setTimeout(() => onSignOut?.(), 600);
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
                onClick={() => {
                  showToast("You've been signed out.");
                  setTimeout(() => onSignOut?.(), 600);
                }}
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

      {/* Main Content Area */}
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
              <span className="capitalize">{active.replace("/", "")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle back to Landing Page */}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Toggle back to Landing Page"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 hover:border-accent-pro/50 bg-foreground/5 hover:bg-foreground/10 text-xs text-foreground/80 font-medium transition-all cursor-pointer"
              >
                <Globe className="size-3.5 text-accent-pro" />
                <span className="hidden sm:inline">Landing Page</span>
              </button>
            )}

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
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent-pro" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActive("/profile")}
              className="flex items-center gap-2 pl-2 border-l border-border/50 hover:opacity-80 transition-opacity"
            >
              <div className="size-7 rounded-md bg-accent-pro/15 border border-accent-pro/30 text-accent-pro font-bold text-xs flex items-center justify-center uppercase">
                {username.slice(0, 2)}
              </div>
              <span className="hidden md:inline text-xs text-foreground/70 font-medium">
                {username}
              </span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
