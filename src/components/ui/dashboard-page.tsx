"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { repoApi, authApi, dashboardApi } from "@/lib/api";
import { RepoFileExplorer } from "@/components/ui/repo-file-explorer";
import { ContributionHeatmap } from "@/components/ui/contribution-heatmap";
import { BarsSpinner } from "@/components/bars-spinner";
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
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  FolderPlus,
  FolderGit2,
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
  const [cliModalOpen, setCliModalOpen] = useState(false);

  const storedUser = authApi.getStoredUser();
  const username = storedUser?.username || userEmail.split("@")[0] || "user";
  const activeToken = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const cliLoginCmd = activeToken ? `mygit login --token ${activeToken}` : `mygit login --email ${userEmail}`;

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

  // Theme state: dark / light
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mygit-theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof window !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
        localStorage.setItem("mygit-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
        localStorage.setItem("mygit-theme", "light");
      }
    }
  };

  // -------------------------------------------------------------
  // DATA STORES & STATE
  // -------------------------------------------------------------

  const LANG_COLORS: Record<string, string> = {
    Rust: "bg-orange-500",
    TypeScript: "bg-blue-400",
    JavaScript: "bg-yellow-400",
    Java: "bg-red-400",
    Go: "bg-cyan-400",
    Python: "bg-emerald-400",
    "C/C++": "bg-purple-400",
    Markdown: "bg-amber-400",
    Web: "bg-pink-400",
    Git: "bg-foreground/40",
  };

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return "Recently";
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return "Recently";
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Repositories & Live Dashboard State (100% fetched from PostgreSQL tables)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRepoForTree, setSelectedRepoForTree] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [repos, setRepos] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [issues, setIssues] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tokens, setTokens] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sshKeys, setSshKeys] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [discussions, setDiscussions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activity, setActivity] = useState<any[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>("All");
  const [dashboardStats, setDashboardStats] = useState<{
    publicReposCount: number;
    privateReposCount: number;
    totalCommits: number;
    commitsThisWeek: number;
    totalStarsEarned: number;
    openPullRequestsCount: number;
    openIssuesCount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastPush: any | null;
  }>({
    publicReposCount: 0,
    privateReposCount: 0,
    totalCommits: 0,
    commitsThisWeek: 0,
    totalStarsEarned: 0,
    openPullRequestsCount: 0,
    openIssuesCount: 0,
    lastPush: null,
  });
  const [profileData, setProfileData] = useState<{
    username: string;
    email: string;
    fullName?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    createdAt?: string | null;
  }>({
    username,
    email: userEmail,
  });
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", bio: "", location: "", website: "" });
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
  const [discussionForm, setDiscussionForm] = useState({ title: "", body: "", category: "General" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [starredReposList, setStarredReposList] = useState<any[]>([]);
  const [settingsState, setSettingsState] = useState({
    emailOnPr: true,
    emailOnMention: true,
    weeklyDigest: false,
  });
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ repo: "", title: "", description: "", labels: "" });
  const [newPrOpen, setNewPrOpen] = useState(false);
  const [prForm, setPrForm] = useState({ repo: "", title: "", description: "", sourceBranch: "feature", targetBranch: "main" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeDiscussion, setActiveDiscussion] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [discussionComments, setDiscussionComments] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [exploreQuery, setExploreQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exploreResults, setExploreResults] = useState<any[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "ok" | "error" | "no-token">("loading");
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (active !== "/explore") return;
    let cancelled = false;
    setExploreLoading(true);
    const timer = setTimeout(() => {
      repoApi
        .searchPublic(exploreQuery)
        .then((list) => {
          if (!cancelled) setExploreResults(Array.isArray(list) ? list : []);
        })
        .catch(() => {
          if (!cancelled) setExploreResults([]);
        })
        .finally(() => {
          if (!cancelled) setExploreLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, exploreQuery]);

  const refreshDashboard = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setSyncStatus("no-token");
      setSyncError("No active backend session token. Sign in with your mygit email/password to load your repositories.");
      return;
    }
    setSyncStatus("loading");
    setSyncError(null);
    try {
      const [summary, tokenList, sshList, discList] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.listTokens().catch(() => []),
        dashboardApi.listSshKeys().catch(() => []),
        dashboardApi.listDiscussions().catch(() => []),
      ]);

      if (summary && Array.isArray(summary.repos)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedRepos = summary.repos.map((r: any) => {
          const lang = r.primaryLanguage || "Git";
          return {
            id: String(r.id),
            name: r.name,
            description: r.description || "No description provided.",
            lang,
            langColor: LANG_COLORS[lang] || "bg-foreground/40",
            stars: r.starsCount || 0,
            forks: r.forksCount || 0,
            isStarred: Boolean(r.isStarred),
            updated: formatRelativeTime(r.updatedAt),
            isPrivate: Boolean(r.isPrivate),
            ownerUsername: r.ownerUsername || username,
            forkedFrom: r.forkedFrom,
            lastAction: r.lastCommitMessage
              ? `Commit: ${r.lastCommitMessage}`
              : r.forkedFrom
              ? `Forked from @${r.forkedFrom}`
              : `Updated ${formatRelativeTime(r.updatedAt)}`,
          };
        });
        setRepos(mappedRepos);
      }

      if (summary) {
        setDashboardStats({
          publicReposCount: summary.publicReposCount ?? 0,
          privateReposCount: summary.privateReposCount ?? 0,
          totalCommits: summary.totalCommits ?? 0,
          commitsThisWeek: summary.commitsThisWeek ?? 0,
          totalStarsEarned: summary.totalStarsEarned ?? 0,
          openPullRequestsCount: summary.openPullRequestsCount ?? 0,
          openIssuesCount: summary.openIssuesCount ?? 0,
          lastPush: summary.lastPush ?? null,
        });

        if (Array.isArray(summary.pullRequests)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPullRequests(summary.pullRequests.map((pr: any) => ({
            ...pr,
            status: pr.status === "OPEN" ? "Open" : pr.status === "MERGED" ? "Merged" : "Closed",
            time: formatRelativeTime(pr.updatedAt || pr.createdAt),
          })));
        }

        if (Array.isArray(summary.issues)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setIssues(summary.issues.map((i: any) => ({
            ...i,
            status: i.status === "OPEN" ? "Open" : "Closed",
            labels: Array.isArray(i.labels) ? i.labels : [],
            time: formatRelativeTime(i.updatedAt || i.createdAt),
          })));
        }

        if (Array.isArray(summary.activity)) {
          setActivity(summary.activity);
        }

        if (Array.isArray(summary.notifications)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setNotifications(summary.notifications.map((n: any) => ({
            ...n,
            time: formatRelativeTime(n.timestamp),
          })));
        }

        if (summary.profile) {
          setProfileData(summary.profile);
          setProfileForm({
            fullName: summary.profile.fullName || "",
            bio: summary.profile.bio || "",
            location: summary.profile.location || "",
            website: summary.profile.website || "",
          });
        }

        if (summary.settings) {
          setSettingsState({
            emailOnPr: Boolean(summary.settings.emailOnPr),
            emailOnMention: Boolean(summary.settings.emailOnMention),
            weeklyDigest: Boolean(summary.settings.weeklyDigest),
          });
        }

        if (Array.isArray(summary.starredRepos)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setStarredReposList(summary.starredRepos.map((r: any) => {
            const lang = r.primaryLanguage || "Git";
            return {
              id: String(r.id),
              name: r.name,
              description: r.description || "No description provided.",
              lang,
              langColor: LANG_COLORS[lang] || "bg-foreground/40",
              stars: r.starsCount || 0,
              forks: r.forksCount || 0,
              isStarred: true,
              updated: formatRelativeTime(r.updatedAt),
              isPrivate: Boolean(r.isPrivate),
              ownerUsername: r.ownerUsername || username,
            };
          }));
        }
      }

      if (Array.isArray(tokenList)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTokens(tokenList.map((t: any) => ({
          ...t,
          id: String(t.id),
          created: formatRelativeTime(t.createdAt),
          lastUsed: t.lastUsedAt ? formatRelativeTime(t.lastUsedAt) : "Never",
        })));
      }

      if (Array.isArray(sshList)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSshKeys(sshList.map((k: any) => ({
          ...k,
          id: String(k.id),
          added: formatRelativeTime(k.createdAt),
          lastUsed: k.lastUsedAt ? formatRelativeTime(k.lastUsedAt) : "Never",
        })));
      }

      if (Array.isArray(discList)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDiscussions(discList.map((d: any) => ({
          ...d,
          id: String(d.id),
          lastActivity: formatRelativeTime(d.updatedAt || d.createdAt),
        })));
      }
      setSyncStatus("ok");
    } catch (err: any) {
      console.debug("Dashboard summary sync error:", err);
      const msg = err?.response?.data?.error || err?.message || "Backend waking up or unreachable";
      setSyncStatus("error");
      setSyncError(msg);
      // Fallback: try basic /repos endpoint if summary failed
      try {
        const basicRepos = await repoApi.list();
        if (Array.isArray(basicRepos)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setRepos(basicRepos.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            description: r.description || "No description provided.",
            lang: "Git",
            langColor: "bg-foreground/40",
            stars: r.starsCount || 0,
            forks: r.forksCount || 0,
            isStarred: false,
            updated: formatRelativeTime(r.updatedAt),
            isPrivate: Boolean(r.isPrivate),
            ownerUsername: r.ownerUsername || username,
            forkedFrom: r.forkedFrom,
            lastAction: `Updated ${formatRelativeTime(r.updatedAt)}`,
          })));
          setSyncStatus("ok");
          setSyncError(null);
        }
      } catch {
        // Auto-retry once in 4s (handles Render cold start)
        setTimeout(() => {
          refreshDashboard();
        }, 4000);
      }
    }
  }, [username, userEmail]);

  useEffect(() => {
    refreshDashboard();
    const onFocus = () => refreshDashboard();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshDashboard]);

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

  const toggleStar = async (id: string) => {
    const targetRepo = repos.find((r) => r.id === id);
    if (!targetRepo) return;

    // Optimistic UI update
    setRepos((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isStarred: !r.isStarred, stars: r.isStarred ? Math.max(0, r.stars - 1) : r.stars + 1 } : r
      )
    );

    try {
      const res = await repoApi.toggleStar(targetRepo.name);
      setRepos((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isStarred: res.starred, stars: res.starCount } : r
        )
      );
    } catch (err) {
      console.error("Star toggle error:", err);
    }
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

  const handleStartImport = async () => {
    if (!importUrl) return;
    setImportingState("running");
    setImportProgress(30);
    setImportError(null);
    try {
      const imported = await dashboardApi.importRepo({
        url: importUrl.trim(),
        name: importRepoName.trim() || undefined,
      });
      setImportProgress(100);
      setImportingState("success");
      showToast(`Imported ${imported.name} (${imported.importedFiles ?? 0} files) into Neon DB!`);
      refreshDashboard();
    } catch (err: any) {
      setImportingState("error");
      const msg = err?.response?.data?.error || err?.message || "Import failed";
      setImportError(msg);
      showToast(`Import error: ${msg}`);
    }
  };

  // -------------------------------------------------------------
  // TOKEN GENERATION STATE
  // -------------------------------------------------------------
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenExpiry, setNewTokenExpiry] = useState("30 days");
  const [newTokenScopes, setNewTokenScopes] = useState<string[]>(["repo:read", "repo:write"]);
  const [justGeneratedToken, setJustGeneratedToken] = useState<string | null>(null);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    try {
      const created = await dashboardApi.createToken({
        name: newTokenName.trim(),
        expires: newTokenExpiry,
        scopes: newTokenScopes.join(","),
      });
      setTokens((prev) => [
        {
          ...created,
          id: String(created.id),
          created: "Just now",
          lastUsed: "Never",
        },
        ...prev,
      ]);
      setJustGeneratedToken(created.tokenString);
      setNewTokenName("");
      showToast("Personal access token created.");
    } catch {
      showToast("Failed to create token.");
    }
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

  const handleAddSshKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSshTitle.trim() || !isValidSsh) return;
    try {
      const saved = await dashboardApi.addSshKey({
        title: newSshTitle.trim(),
        publicKey: newSshKey.trim(),
      });
      setSshKeys((prev) => [
        {
          ...saved,
          id: String(saved.id),
          added: "Just now",
          lastUsed: "Never",
        },
        ...prev,
      ]);
      setNewSshTitle("");
      setNewSshKey("");
      setShowSshModal(false);
      showToast("SSH key added successfully!");
    } catch {
      showToast("Failed to save SSH key.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await dashboardApi.updateProfile(profileForm);
      setProfileData(updated);
      setEditProfileOpen(false);
      showToast("Profile updated.");
    } catch {
      showToast("Failed to update profile.");
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionForm.title.trim()) return;
    try {
      const created = await dashboardApi.createDiscussion(discussionForm);
      setDiscussions((prev) => [
        { ...created, id: String(created.id), lastActivity: "Just now" },
        ...prev,
      ]);
      setDiscussionForm({ title: "", body: "", category: "General" });
      setNewDiscussionOpen(false);
      showToast("Discussion posted.");
    } catch {
      showToast("Failed to post discussion.");
    }
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS ACTIONS
  // -------------------------------------------------------------
  const [notifTab, setNotifTab] = useState("all");
  const unreadNotifsCount = notifications.filter((n) => n.unread).length;

  const markAllNotifsRead = async () => {
    const keys = notifications.map((n) => String(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await dashboardApi.markAllNotificationsRead(keys);
    } catch {
      // ignore network error
    }
    showToast("All notifications marked as read.");
  };

  const markSingleNotifRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    try {
      await dashboardApi.markNotificationRead(id);
    } catch {
      // ignore
    }
  };

  const muteSingleNotif = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await dashboardApi.muteNotification(id);
    } catch {
      // ignore
    }
    showToast("Thread muted.");
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

  const handleRepoRenamed = (oldName: string, newName: string) => {
    setRepos((prev) =>
      prev.map((r) => (r.name === oldName ? { ...r, name: newName } : r))
    );
    setSelectedRepoForTree((prev: any) =>
      prev && prev.name === oldName ? { ...prev, name: newName } : prev
    );
  };

  const handleRepoDeleted = (name: string) => {
    setRepos((prev) => prev.filter((r) => r.name !== name));
    setSelectedRepoForTree(null);
  };

  // -------------------------------------------------------------
  // RENDER MAIN CONTENT VIEW SWITCHER
  // -------------------------------------------------------------
  const renderContent = () => {
    if (selectedRepoForTree) {
      return (
        <RepoFileExplorer
          repoName={selectedRepoForTree.name}
          ownerUsername={selectedRepoForTree.ownerUsername || username}
          isPrivate={selectedRepoForTree.isPrivate}
          description={selectedRepoForTree.description}
          forkedFrom={selectedRepoForTree.forkedFrom}
          currentUsername={username}
          onBack={() => setSelectedRepoForTree(null)}
          onRepoRenamed={handleRepoRenamed}
          onRepoDeleted={handleRepoDeleted}
        />
      );
    }

    switch (active) {
      // ---------------------------------------------------------
      // 1. ACTIVITY VIEW
      // ---------------------------------------------------------
      case "/activity": {
        const filteredActivity = activity.filter((a) => {
          if (activityFilter === "All") return true;
          if (activityFilter === "Pushes") return a.type === "push";
          if (activityFilter === "Issues") return a.type === "issue";
          if (activityFilter === "Pull Requests") return a.type === "pr";
          if (activityFilter === "Stars") return a.type === "star";
          return true;
        });

        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Activity Timeline</h1>
                <p className="text-xs text-foreground/50 font-mono mt-1">
                  Chronological event audit of your commits, pull requests, issues, and stars
                </p>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-md border border-border/50 bg-foreground/5 text-xs">
                {["All", "Pushes", "Issues", "Pull Requests", "Stars"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActivityFilter(tab)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      activityFilter === tab
                        ? "bg-foreground/15 text-foreground font-medium"
                        : "text-foreground/60 hover:text-foreground hover:bg-foreground/10"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredActivity.length === 0 ? (
              <div className="p-10 rounded-xl border border-border/50 bg-foreground/5 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No recorded activity yet</p>
                <p className="text-xs text-foreground/50 font-mono">
                  Push a commit, open an issue/PR, or star a repository to see live events here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 border-l border-border/50 pl-4 ml-2">
                {filteredActivity.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-lg border border-border/50 bg-foreground/5 flex items-start gap-3">
                    {item.type === "push" && <GitBranch className="size-4 text-emerald-400 mt-0.5 shrink-0" />}
                    {item.type === "pr" && <GitPullRequest className="size-4 text-accent-pro mt-0.5 shrink-0" />}
                    {item.type === "issue" && <AlertCircle className="size-4 text-amber-400 mt-0.5 shrink-0" />}
                    {item.type === "star" && <Star className="size-4 text-yellow-400 mt-0.5 shrink-0" />}
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-foreground">
                        {item.type === "push" && (
                          <>Pushed commit to <span className="font-semibold">{item.repo}:{item.branch || "main"}</span> — {item.title}</>
                        )}
                        {item.type === "pr" && (
                          <>PR #{item.number} ({item.status}): <span className="font-semibold">{item.title}</span></>
                        )}
                        {item.type === "issue" && (
                          <>Issue #{item.number} ({item.status}): <span className="font-semibold">{item.title}</span></>
                        )}
                        {item.type === "star" && <>{item.title}</>}
                      </p>
                      <p className="text-xs text-foreground/45 font-mono">
                        {item.repo}
                        {item.sha ? <> · <code className="text-foreground/70">{String(item.sha).slice(0, 7)}</code></> : null}
                        {" · "}
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        onClick={() => muteSingleNotif(item.id)}
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
            desc: "Authenticate your terminal tool. Works for both Google SSO and Email users.",
            cmd: cliLoginCmd,
          },
          {
            num: 5,
            title: "Create repository & push code",
            desc: "Create your cloud repository first, then push your local branch.",
            cmd: `mygit repo create my-project && mygit push origin main`,
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
        if (selectedRepoForTree) {
          return (
            <RepoFileExplorer
              repoName={selectedRepoForTree.name}
              ownerUsername={selectedRepoForTree.ownerUsername || username}
              isPrivate={selectedRepoForTree.isPrivate}
              description={selectedRepoForTree.description}
              forkedFrom={selectedRepoForTree.forkedFrom}
              currentUsername={username}
              onBack={() => setSelectedRepoForTree(null)}
              onRepoRenamed={handleRepoRenamed}
              onRepoDeleted={handleRepoDeleted}
            />
          );
        }

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
            {syncStatus === "loading" && filteredRepos.length === 0 ? (
              <div className="p-12 rounded-xl border border-border/50 bg-foreground/5 flex flex-col items-center justify-center gap-3 text-xs font-mono text-foreground/60">
                <BarsSpinner size={20} />
                <span>Loading your repositories...</span>
              </div>
            ) : filteredRepos.length === 0 ? (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => setSelectedRepoForTree(repo)}
                          className="font-semibold text-sm text-foreground hover:underline cursor-pointer"
                        >
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
                      {(repo as any).forkedFrom && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-foreground/60">
                          <GitFork className="size-3 text-emerald-400" />
                          <span>forked from @{(repo as any).forkedFrom}</span>
                        </div>
                      )}
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
                        onClick={() => setSelectedRepoForTree(repo)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs font-mono text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors"
                        title="Browse repository files"
                      >
                        <FolderGit2 className="size-3.5 text-emerald-400" />
                        <span>Files</span>
                      </button>
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
      // EXPLORE PUBLIC REPOSITORIES VIEW
      // ---------------------------------------------------------
      case "/explore": {
        return (
          <div className="space-y-6 max-w-5xl">
            <div className="border-b border-border/50 pb-5">
              <h1 className="text-2xl font-bold text-foreground">Explore Public Repositories</h1>
              <p className="text-xs text-foreground/50 font-mono mt-1">
                Search public repositories across all mygit developers and inspect files in read-only mode
              </p>
            </div>

            <div className="relative">
              <Search className="size-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                placeholder="Search by repository name, owner username, or description..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none focus:border-border"
              />
            </div>

            {exploreLoading ? (
              <div className="p-8 text-center text-xs font-mono text-foreground/50">Searching public repositories...</div>
            ) : exploreResults.length === 0 ? (
              <div className="p-10 rounded-xl border border-border/50 bg-foreground/5 text-center space-y-2">
                <Globe className="size-8 text-foreground/30 mx-auto" />
                <p className="text-sm font-semibold text-foreground">No public repositories found</p>
                <p className="text-xs text-foreground/50 font-mono">Try another search query.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exploreResults.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-5 rounded-xl border border-border/50 bg-foreground/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-border transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() =>
                            setSelectedRepoForTree({
                              id: String(repo.id),
                              name: repo.name,
                              ownerUsername: repo.ownerUsername,
                              isPrivate: repo.isPrivate,
                              description: repo.description || "No description provided.",
                            })
                          }
                          className="font-semibold text-sm text-foreground hover:underline cursor-pointer"
                        >
                          {repo.ownerUsername}/{repo.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-foreground/50">
                          Public
                        </span>
                      </div>
                      <p className="text-xs text-foreground/60 max-w-xl">
                        {repo.description || "No description provided."}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] font-mono text-foreground/45 pt-1">
                        <span>★ {repo.starsCount ?? 0}</span>
                        <span>⑂ {repo.forksCount ?? 0}</span>
                        <span>Updated {formatRelativeTime(repo.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          copyToClipboard(`${window.location.origin}/${repo.ownerUsername}/${repo.name}`);
                        }}
                        className="px-3 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs font-mono text-foreground/70 hover:text-foreground"
                      >
                        Share Link
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRepoForTree({
                            id: String(repo.id),
                            name: repo.name,
                            ownerUsername: repo.ownerUsername,
                            isPrivate: repo.isPrivate,
                            description: repo.description || "No description provided.",
                          })
                        }
                        className="px-3 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
                      >
                        View Files
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
        const starredRepos = starredReposList.length > 0 ? starredReposList : repos.filter((r) => r.isStarred);

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
                        <span
                          onClick={() => setSelectedRepoForTree(repo)}
                          className="font-semibold text-sm text-foreground hover:underline cursor-pointer"
                        >
                          {repo.ownerUsername ? `${repo.ownerUsername}/${repo.name}` : repo.name}
                        </span>
                        <span className="text-xs text-foreground/40 font-mono">· {repo.lang}</span>
                      </div>
                      <p className="text-xs text-foreground/60 max-w-xl">{repo.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await repoApi.toggleStar(repo.name);
                          refreshDashboard();
                        } catch {
                          toggleStar(repo.id);
                        }
                      }}
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
                  <span>Repository imported successfully into Neon PostgreSQL!</span>
                </div>
              )}

              {importingState === "error" && importError && (
                <div className="p-3.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{importError}</span>
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
              {syncStatus === "loading" && repos.length === 0 ? (
                <div className="p-10 rounded-xl border border-border/50 bg-foreground/5 flex items-center justify-center gap-3 text-xs font-mono text-foreground/60">
                  <BarsSpinner size={18} />
                  <span>Loading recent repositories...</span>
                </div>
              ) : (
                repos.map((repo) => (
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
              ))
              )}
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

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-foreground/60">
                  <span className="text-emerald-400 font-semibold">{openPRs.length} Open</span>
                  <span>·</span>
                  <span>{closedPRs.length} Closed</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrForm((p) => ({ ...p, repo: p.repo || repos[0]?.name || "" }));
                    setNewPrOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
                >
                  <Plus className="size-3.5" />
                  <span>New Pull Request</span>
                </button>
              </div>
            </div>

            {newPrOpen && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!prForm.repo || !prForm.title.trim()) return;
                    try {
                      await dashboardApi.createPullRequest(prForm.repo, {
                        title: prForm.title.trim(),
                        description: prForm.description,
                        sourceBranch: prForm.sourceBranch || "feature",
                        targetBranch: prForm.targetBranch || "main",
                      });
                      setNewPrOpen(false);
                      setPrForm({ repo: repos[0]?.name || "", title: "", description: "", sourceBranch: "feature", targetBranch: "main" });
                      showToast("Pull request created!");
                      refreshDashboard();
                    } catch (err: any) {
                      showToast(err?.response?.data?.error || "Failed to create pull request.");
                    }
                  }}
                  className="max-w-md w-full p-6 rounded-2xl border border-border/50 bg-card space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-bold text-sm text-foreground">Create Pull Request</h3>
                    <button type="button" onClick={() => setNewPrOpen(false)} className="text-foreground/40 hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Repository *</label>
                    <select
                      required
                      value={prForm.repo}
                      onChange={(e) => setPrForm((p) => ({ ...p, repo: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    >
                      <option value="" disabled>Select repository</option>
                      {repos.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={prForm.title}
                      onChange={(e) => setPrForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="feat: add new module"
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-foreground/50 block mb-1">Source branch</label>
                      <input
                        type="text"
                        value={prForm.sourceBranch}
                        onChange={(e) => setPrForm((p) => ({ ...p, sourceBranch: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-foreground/50 block mb-1">Target branch</label>
                      <input
                        type="text"
                        value={prForm.targetBranch}
                        onChange={(e) => setPrForm((p) => ({ ...p, targetBranch: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={prForm.description}
                      onChange={(e) => setPrForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Describe the changes..."
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <button type="button" onClick={() => setNewPrOpen(false)} className="px-3 py-1.5 rounded-md border border-border/50 text-xs text-foreground/60">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium">
                      Create PR
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PR Rows */}
            <div className="space-y-2.5">
              {pullRequests.length === 0 ? (
                <div className="p-10 rounded-xl border border-border/50 bg-foreground/5 text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">No pull requests yet</p>
                  <p className="text-xs text-foreground/50 font-mono">
                    Open a repository and create a pull request to see it tracked here.
                  </p>
                </div>
              ) : (
                pullRequests.map((pr) => (
                  <div
                    key={pr.id}
                    onClick={() => {
                      const target = repos.find((r) => r.name === pr.repo);
                      if (target) setSelectedRepoForTree(target);
                    }}
                    className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex items-start justify-between gap-4 cursor-pointer hover:border-border transition-colors"
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
                          <span className="font-semibold text-sm text-foreground hover:underline">
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
                          #{pr.prNumber || pr.id} opened {pr.time} by {pr.author} · {pr.repo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-mono shrink-0">
                      <MessageSquare className="size-3.5" />
                      <span>{pr.comments}</span>
                    </div>
                  </div>
                ))
              )}
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
                onClick={() => {
                  setIssueForm((p) => ({ ...p, repo: p.repo || repos[0]?.name || "" }));
                  setNewIssueOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
              >
                <Plus className="size-3.5" />
                <span>New Issue</span>
              </button>
            </div>

            {newIssueOpen && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!issueForm.repo || !issueForm.title.trim()) return;
                    try {
                      await dashboardApi.createIssue(issueForm.repo, {
                        title: issueForm.title.trim(),
                        description: issueForm.description,
                        labels: issueForm.labels,
                      });
                      setNewIssueOpen(false);
                      setIssueForm({ repo: repos[0]?.name || "", title: "", description: "", labels: "" });
                      showToast("Issue created!");
                      refreshDashboard();
                    } catch (err: any) {
                      showToast(err?.response?.data?.error || "Failed to create issue.");
                    }
                  }}
                  className="max-w-md w-full p-6 rounded-2xl border border-border/50 bg-card space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-bold text-sm text-foreground">Create New Issue</h3>
                    <button type="button" onClick={() => setNewIssueOpen(false)} className="text-foreground/40 hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Repository *</label>
                    <select
                      required
                      value={issueForm.repo}
                      onChange={(e) => setIssueForm((p) => ({ ...p, repo: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    >
                      <option value="" disabled>Select repository</option>
                      {repos.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={issueForm.title}
                      onChange={(e) => setIssueForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Issue summary"
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Labels (comma separated)</label>
                    <input
                      type="text"
                      value={issueForm.labels}
                      onChange={(e) => setIssueForm((p) => ({ ...p, labels: e.target.value }))}
                      placeholder="bug, enhancement"
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={issueForm.description}
                      onChange={(e) => setIssueForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Steps to reproduce or details..."
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <button type="button" onClick={() => setNewIssueOpen(false)} className="px-3 py-1.5 rounded-md border border-border/50 text-xs text-foreground/60">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium">
                      Submit Issue
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-2.5">
              {issues.length === 0 ? (
                <div className="p-10 rounded-xl border border-border/50 bg-foreground/5 text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">No issues found</p>
                  <p className="text-xs text-foreground/50 font-mono">
                    Open a repository and create an issue to track bugs or tasks here.
                  </p>
                </div>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => {
                      const target = repos.find((r) => r.name === issue.repo);
                      if (target) setSelectedRepoForTree(target);
                    }}
                    className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex items-start justify-between gap-4 cursor-pointer hover:border-border transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={`size-4 mt-0.5 shrink-0 ${
                          issue.status === "Open" ? "text-emerald-400" : "text-purple-400"
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground hover:underline">
                            {issue.title}
                          </span>
                          {issue.labels.map((lbl: string) => (
                            <span
                              key={lbl}
                              className="text-[10px] font-mono px-2 py-0.2 rounded border border-border/50 text-foreground/60 bg-foreground/5"
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-foreground/45 font-mono">
                          #{issue.issueNumber || issue.id} opened {issue.time} by {issue.author} · {issue.repo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-mono shrink-0">
                      <MessageSquare className="size-3.5" />
                      <span>{issue.comments}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 11. REVIEWS VIEW
      // ---------------------------------------------------------
      case "/reviews": {
        const openReviewPrs = pullRequests.filter((pr) => pr.status === "Open");
        const completedPrs = pullRequests.filter((pr) => pr.status !== "Open");
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="border-b border-border/50 pb-5">
              <h1 className="text-2xl font-bold text-foreground">Code Reviews</h1>
              <p className="text-xs text-foreground/50 font-mono mt-1">
                Open pull requests awaiting review and completed reviews across your repositories
              </p>
            </div>

            {pullRequests.length === 0 ? (
              <div className="p-10 rounded-xl border border-border/50 bg-foreground/5 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No pull requests to review</p>
                <p className="text-xs text-foreground/50 font-mono">
                  When pull requests are opened on your repositories, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {openReviewPrs.map((pr) => (
                  <div key={pr.id} className="p-5 rounded-xl border border-accent-pro/30 bg-accent-pro/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-accent-pro font-medium">AWAITING REVIEW</span>
                      <span className="text-xs font-mono text-foreground/40">{pr.repo}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      #{pr.prNumber || pr.id} {pr.title}
                    </h3>
                    <p className="text-xs text-foreground/60">
                      Opened by @{pr.author} · {pr.sourceBranch} → {pr.targetBranch} · {pr.time}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const target = repos.find((r) => r.name === pr.repo);
                          if (target) setSelectedRepoForTree(target);
                        }}
                        className="px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
                      >
                        Open Repository
                      </button>
                    </div>
                  </div>
                ))}

                {completedPrs.map((pr) => (
                  <div key={pr.id} className="p-5 rounded-xl border border-border/50 bg-foreground/5 space-y-2 opacity-85">
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                      <span>{pr.status.toUpperCase()}</span>
                      <span className="text-foreground/40">{pr.repo}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      #{pr.prNumber || pr.id} {pr.title}
                    </h3>
                    <p className="text-xs text-foreground/50">
                      By @{pr.author} · {pr.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
                onClick={() => setNewDiscussionOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium"
              >
                <Plus className="size-3.5" />
                <span>New Discussion</span>
              </button>
            </div>

            {discussions.length === 0 ? (
              <div className="p-10 rounded-xl border border-border/50 bg-foreground/5 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No discussions yet</p>
                <p className="text-xs text-foreground/50 font-mono">
                  Start the first discussion thread in your workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {discussions.map((d) => (
                  <div
                    key={d.id}
                    onClick={async () => {
                      setActiveDiscussion(d);
                      try {
                        const comments = await dashboardApi.listDiscussionComments(d.id);
                        setDiscussionComments(comments);
                      } catch {
                        setDiscussionComments([]);
                      }
                    }}
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
                    {d.body && <p className="text-xs text-foreground/60 line-clamp-2">{d.body}</p>}
                    <p className="text-xs text-foreground/40 font-mono flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      <span>{d.replies ?? 0} replies</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeDiscussion && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="max-w-lg w-full max-h-[85vh] flex flex-col p-6 rounded-2xl border border-border/50 bg-card space-y-4 shadow-2xl">
                  <div className="flex items-start justify-between border-b border-border/40 pb-3 gap-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border/50 bg-foreground/10 text-foreground/70">
                        {activeDiscussion.category}
                      </span>
                      <h3 className="font-bold text-sm text-foreground mt-2">{activeDiscussion.title}</h3>
                      <p className="text-[11px] font-mono text-foreground/45 mt-0.5">
                        by @{activeDiscussion.author} · {activeDiscussion.lastActivity}
                      </p>
                    </div>
                    <button type="button" onClick={() => setActiveDiscussion(null)} className="text-foreground/40 hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  {activeDiscussion.body && (
                    <p className="text-xs text-foreground/80 whitespace-pre-wrap">{activeDiscussion.body}</p>
                  )}
                  <div className="flex-1 overflow-y-auto space-y-2.5 border-t border-border/30 pt-3">
                    {discussionComments.length === 0 ? (
                      <p className="text-xs text-foreground/40 font-mono">No replies yet. Be the first to comment.</p>
                    ) : (
                      discussionComments.map((c) => (
                        <div key={c.id} className="p-3 rounded-lg border border-border/40 bg-foreground/5 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-foreground/50">
                            <span className="text-foreground font-semibold">@{c.author}</span>
                            <span>{formatRelativeTime(c.createdAt)}</span>
                          </div>
                          <p className="text-xs text-foreground/80 whitespace-pre-wrap">{c.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!replyText.trim()) return;
                      try {
                        const added = await dashboardApi.addDiscussionComment(activeDiscussion.id, replyText.trim());
                        setDiscussionComments((prev) => [...prev, added]);
                        setDiscussions((prev) =>
                          prev.map((d) => (d.id === activeDiscussion.id ? { ...d, replies: added.replies } : d))
                        );
                        setReplyText("");
                      } catch {
                        showToast("Failed to post reply.");
                      }
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-border/40"
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                    <button type="submit" className="px-3.5 py-2 rounded-md bg-accent-pro text-white text-xs font-medium">
                      Reply
                    </button>
                  </form>
                </div>
              </div>
            )}

            {newDiscussionOpen && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateDiscussion}
                  className="max-w-md w-full p-6 rounded-2xl border border-border/50 bg-card space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-bold text-sm text-foreground">Start a New Discussion</h3>
                    <button type="button" onClick={() => setNewDiscussionOpen(false)} className="text-foreground/40 hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={discussionForm.title}
                      onChange={(e) => setDiscussionForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Topic title"
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Category</label>
                    <select
                      value={discussionForm.category}
                      onChange={(e) => setDiscussionForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Ideas">Ideas</option>
                      <option value="Q&A">Q&A</option>
                      <option value="Announcements">Announcements</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Body</label>
                    <textarea
                      rows={4}
                      value={discussionForm.body}
                      onChange={(e) => setDiscussionForm((p) => ({ ...p, body: e.target.value }))}
                      placeholder="Share details..."
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <button type="button" onClick={() => setNewDiscussionOpen(false)} className="px-3 py-1.5 rounded-md border border-border/50 text-xs text-foreground/60">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium">
                      Post Discussion
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      }

      // ---------------------------------------------------------
      // 13. PROFILE VIEW
      // ---------------------------------------------------------
      case "/profile": {
        const joinedLabel = profileData.createdAt
          ? new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : "Recently";
        return (
          <div className="space-y-8 max-w-4xl">
            {/* Header info */}
            <div className="p-6 rounded-2xl border border-border/50 bg-foreground/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="size-20 rounded-2xl bg-gradient-to-tr from-accent-pro to-orange-500 flex items-center justify-center font-bold text-2xl text-white uppercase shadow-lg shadow-accent-pro/20">
                {username.slice(0, 2)}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profileData.fullName || username}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(true)}
                    className="px-3.5 py-1.5 rounded-md border border-border/50 bg-foreground/5 text-xs font-mono text-foreground hover:border-border"
                  >
                    Edit profile
                  </button>
                </div>
                <p className="text-xs font-mono text-accent-pro">@{profileData.username || username}</p>
                <p className="text-xs text-foreground/70 leading-relaxed max-w-xl">
                  {profileData.bio || "No bio set yet. Click Edit profile to add a developer bio."}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-foreground/50 pt-2 flex-wrap">
                  {profileData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {profileData.location}
                    </span>
                  )}
                  {profileData.website && (
                    <span className="flex items-center gap-1">
                      <LinkIcon className="size-3" /> {profileData.website}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> Joined {joinedLabel}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-foreground/60 pt-1">
                  <span>
                    <strong className="text-foreground">{repos.length}</strong> repositories
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-foreground">{dashboardStats.totalStarsEarned}</strong> stars earned
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-foreground">{dashboardStats.totalCommits}</strong> commits
                  </span>
                </div>
              </div>
            </div>

            {/* Pinned Repositories */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">Repositories</h3>
              {repos.length === 0 ? (
                <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 text-xs text-foreground/50 font-mono">
                  No repositories created yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.slice(0, 4).map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepoForTree(repo)}
                      className="p-4 rounded-xl border border-border/50 bg-foreground/5 space-y-2 cursor-pointer hover:border-border transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">{repo.name}</span>
                        <span className="text-[10px] font-mono px-1.5 rounded border border-border/50 text-foreground/50">
                          {repo.isPrivate ? "Private" : "Public"}
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
              )}
            </div>

            {/* Contribution heatmap in Profile */}
            <ContributionHeatmap
              username={username}
              onCreateRepo={() => setActive("/new")}
            />

            {editProfileOpen && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleSaveProfile}
                  className="max-w-md w-full p-6 rounded-2xl border border-border/50 bg-card space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-bold text-sm text-foreground">Edit Profile</h3>
                    <button type="button" onClick={() => setEditProfileOpen(false)} className="text-foreground/40 hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder={username}
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-foreground/50 block mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell others about what you're building"
                      className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-foreground/50 block mb-1">Location</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                        placeholder="City, Country"
                        className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-foreground/50 block mb-1">Website</label>
                      <input
                        type="text"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <button type="button" onClick={() => setEditProfileOpen(false)} className="px-3 py-1.5 rounded-md border border-border/50 text-xs text-foreground/60">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 rounded-md bg-accent-pro text-white text-xs font-medium">
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
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
                    onClick={async () => {
                      try {
                        await dashboardApi.deleteToken(token.id);
                        setTokens((prev) => prev.filter((t) => t.id !== token.id));
                        showToast(`Token ${token.name} revoked.`);
                      } catch {
                        showToast("Failed to revoke token.");
                      }
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
                  className="max-w-md w-full p-6 rounded-2xl border border-border/50 bg-card space-y-4 shadow-2xl"
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
                    onClick={async () => {
                      try {
                        await dashboardApi.deleteSshKey(k.id);
                        setSshKeys((prev) => prev.filter((item) => item.id !== k.id));
                        showToast(`Key ${k.title} deleted.`);
                      } catch {
                        showToast("Failed to delete SSH key.");
                      }
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
                  className="max-w-lg w-full p-6 rounded-2xl border border-border/50 bg-card space-y-4 shadow-2xl"
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
            <form onSubmit={handleSaveProfile} className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Profile & Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-foreground/50 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder={username}
                    className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-foreground/50 block mb-1">Email</label>
                  <input
                    type="email"
                    readOnly
                    value={profileData.email || userEmail}
                    className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground/60 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-foreground/50 block mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-foreground/50 block mb-1">Website</label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-md border border-border/50 bg-foreground/5 text-xs text-foreground font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-foreground/10 text-xs font-mono text-foreground hover:bg-foreground/15 border border-border/50"
              >
                Save changes
              </button>
            </form>

            {/* Notifications Preferences */}
            <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
              <div className="space-y-2 text-xs text-foreground/70 font-mono">
                <label className="flex items-center justify-between p-2 rounded hover:bg-foreground/5 cursor-pointer">
                  <span>Email notifications for Pull Request reviews</span>
                  <input
                    type="checkbox"
                    checked={settingsState.emailOnPr}
                    onChange={async (e) => {
                      const next = { ...settingsState, emailOnPr: e.target.checked };
                      setSettingsState(next);
                      try {
                        await dashboardApi.updateSettings(next);
                        showToast("Notification preference saved.");
                      } catch {
                        showToast("Failed to save preference.");
                      }
                    }}
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded hover:bg-foreground/5 cursor-pointer">
                  <span>Direct mentions and issue assignments</span>
                  <input
                    type="checkbox"
                    checked={settingsState.emailOnMention}
                    onChange={async (e) => {
                      const next = { ...settingsState, emailOnMention: e.target.checked };
                      setSettingsState(next);
                      try {
                        await dashboardApi.updateSettings(next);
                        showToast("Notification preference saved.");
                      } catch {
                        showToast("Failed to save preference.");
                      }
                    }}
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded hover:bg-foreground/5 cursor-pointer">
                  <span>Weekly digest of starred repositories</span>
                  <input
                    type="checkbox"
                    checked={settingsState.weeklyDigest}
                    onChange={async (e) => {
                      const next = { ...settingsState, weeklyDigest: e.target.checked };
                      setSettingsState(next);
                      try {
                        await dashboardApi.updateSettings(next);
                        showToast("Notification preference saved.");
                      } catch {
                        showToast("Failed to save preference.");
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
              <div className="space-y-2 text-xs font-mono text-foreground/60">
                <div className="flex items-center justify-between p-2.5 rounded border border-border/30 bg-background/50">
                  <div>
                    <p className="text-foreground font-medium">
                      {typeof navigator !== "undefined" ? navigator.userAgent.split(") ")[0] + ")" : "Current Browser"}
                    </p>
                    <p className="text-[11px] text-foreground/40">Authenticated as @{username} · Active now</p>
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
                onClick={async () => {
                  if (confirm("Are you sure you want to permanently delete your developer account and all repositories?")) {
                    try {
                      await dashboardApi.deleteAccount();
                      onSignOut?.();
                    } catch {
                      showToast("Failed to delete account.");
                    }
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

              {syncStatus === "loading" && (
                <div className="p-3 rounded-lg border border-border/50 bg-foreground/5 text-xs font-mono text-foreground/60 flex items-center gap-3">
                  <BarsSpinner size={16} />
                  <span>Syncing live workspace data from Neon PostgreSQL (Render backend may take ~30s on cold start)...</span>
                </div>
              )}

              {syncStatus === "no-token" && (
                <div className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs font-mono text-amber-300 flex items-center justify-between gap-3 flex-wrap">
                  <span>{syncError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = "#login";
                    }}
                    className="px-3 py-1 rounded bg-accent-pro text-white text-xs font-medium"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="p-3.5 rounded-lg border border-red-500/40 bg-red-500/10 text-xs font-mono text-red-300 flex items-center justify-between gap-3 flex-wrap">
                  <span>Backend sync error: {syncError}</span>
                  <button
                    type="button"
                    onClick={() => refreshDashboard()}
                    className="px-3 py-1 rounded border border-red-400/40 bg-red-500/20 text-white text-xs font-medium"
                  >
                    Retry Now
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-1 text-sm text-foreground/60 leading-relaxed">
                <p>
                  You have <span className="text-foreground font-medium">{repos.length} {repos.length === 1 ? "repository" : "repositories"}</span>,{" "}
                  <span className="text-foreground font-medium">{dashboardStats.openPullRequestsCount} open pull {dashboardStats.openPullRequestsCount === 1 ? "request" : "requests"}</span>, and{" "}
                  <span className="text-accent-pro font-medium">{unreadNotifsCount} unread {unreadNotifsCount === 1 ? "notification" : "notifications"}</span>.
                </p>
                <p className="text-foreground/45">
                  All data is synced live from your Neon PostgreSQL workspace.
                </p>
                <p className="text-xs text-foreground/40 font-mono">
                  {dashboardStats.lastPush ? (
                    <>
                      Last push was {formatRelativeTime(dashboardStats.lastPush.authoredAt)} to{" "}
                      <code className="text-foreground/70">{dashboardStats.lastPush.repoName}:{dashboardStats.lastPush.branch}</code>.
                    </>
                  ) : (
                    <>No commits pushed yet — push your first commit with <code className="text-foreground/70">mygit push origin main</code>.</>
                  )}
                </p>
              </div>
            </div>

            {/* Live Contribution Heatmap */}
            <ContributionHeatmap
              username={username}
              onCreateRepo={() => setActive("/new")}
            />

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
                <p className="text-[11px] text-emerald-400 font-mono">
                  {dashboardStats.publicReposCount} public · {dashboardStats.privateReposCount} private
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                <p className="text-xs text-foreground/40 font-mono">Total Commits</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalCommits}</p>
                <p className="text-[11px] text-emerald-400 font-mono">+{dashboardStats.commitsThisWeek} this week</p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                <p className="text-xs text-foreground/40 font-mono">Stars Earned</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalStarsEarned}</p>
                <p className="text-[11px] text-emerald-400 font-mono">across {repos.length} repositories</p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-foreground/5 space-y-1">
                <p className="text-xs text-foreground/40 font-mono">Open Pull Requests</p>
                <p className="text-2xl font-bold text-accent-pro">{dashboardStats.openPullRequestsCount}</p>
                <p className="text-[11px] text-accent-pro font-mono">{dashboardStats.openIssuesCount} open issues</p>
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

                {syncStatus === "loading" && repos.length === 0 ? (
                  <div className="p-10 rounded-lg border border-border/50 bg-foreground/5 flex items-center justify-center gap-3 text-xs font-mono text-foreground/60">
                    <BarsSpinner size={18} />
                    <span>Loading recent repositories...</span>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {repos.slice(0, 4).map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => {
                        setSelectedRepoForTree(repo);
                        setActive("/repositories");
                      }}
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
                )}
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
                  {activity.length === 0 ? (
                    <p className="text-xs text-foreground/45 font-mono">
                      No recent activity yet. Push a commit or open a PR to see live events.
                    </p>
                  ) : (
                    activity.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex gap-2.5 text-xs">
                        <div className="size-1.5 rounded-full bg-accent-pro mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-foreground/70 leading-snug">
                            {item.type === "push" && (
                              <>Pushed to <span className="font-medium text-foreground">{item.repo}:{item.branch || "main"}</span></>
                            )}
                            {item.type === "pr" && (
                              <>PR #{item.number} ({item.status}): <span className="font-medium text-foreground">{item.title}</span></>
                            )}
                            {item.type === "issue" && (
                              <>Issue #{item.number} ({item.status}): <span className="font-medium text-foreground">{item.title}</span></>
                            )}
                            {item.type === "star" && <>{item.title}</>}
                          </p>
                          <p className="text-[10px] font-mono text-foreground/40">
                            {formatRelativeTime(item.timestamp)}
                            {item.sha ? ` · ${String(item.sha).slice(0, 7)}` : ` · ${item.repo}`}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
                    { label: "Authenticate CLI (Google/Email)", cmd: cliLoginCmd },
                    { label: "Create Cloud Repository", cmd: "mygit repo create my-project" },
                    { label: "Clone repository", cmd: "mygit clone https://mygit-backend-y27o.onrender.com/api/repos/" + username + "/mygit-kernel" },
                    { label: "Push code", cmd: "mygit push origin main" },
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

      {/* CLI Token & Login Modal */}
      {cliModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCliModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400">
                  <Terminal className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    CLI Authentication
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                      Google SSO & Web
                    </span>
                  </h3>
                  <p className="text-xs text-foreground/60 font-mono mt-0.5">
                    Connect your client terminal to your mygit account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCliModalOpen(false)}
                className="p-1 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-foreground/70 font-semibold">1-Click Terminal Login Command:</span>
                <span className="text-[11px] text-foreground/50">Auto-persists in ~/.mygit/credentials</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-foreground/5 border border-border/70 font-mono text-xs">
                <span className="text-foreground/40 select-none">$</span>
                <input
                  type="text"
                  readOnly
                  value={cliLoginCmd}
                  className="bg-transparent flex-1 truncate text-foreground font-mono text-xs outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(cliLoginCmd)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors text-xs shrink-0 cursor-pointer"
                >
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Quick Rules for Client Operations */}
            <div className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-foreground/90 flex items-center gap-1.5 text-xs">
                <Shield className="size-3.5 text-amber-500" />
                Important Client Operation Rules:
              </div>
              <ul className="space-y-1.5 text-foreground/70 text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-foreground">Persistent Login:</strong> You only run this login command once per laptop. Credentials remain stored permanently across all repos and reboots.
                </li>
                <li>
                  <strong className="text-foreground">Repo Must Exist First:</strong> The cloud rejects pushes to non-existent repos. Always run <code className="bg-foreground/10 px-1 py-0.5 rounded font-mono text-emerald-500">mygit repo create &lt;name&gt;</code> before pushing.
                </li>
                <li>
                  <strong className="text-foreground">Check Active User:</strong> Run <code className="bg-foreground/10 px-1 py-0.5 rounded font-mono text-foreground/90">mygit whoami</code> in any directory to inspect your authenticated identity.
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCliModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-foreground text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
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
                href="/explore"
                label="Explore Public Repos"
                isActive={active === "/explore"}
                onClick={(e) => {
                  e.preventDefault();
                  setActive("/explore");
                  setSelectedRepoForTree(null);
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
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 text-foreground/50 hover:text-foreground transition-colors font-mono"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="size-3 text-amber-400" /> : <Moon className="size-3 text-sky-500" />}
                <span>{isDark ? "Light" : "Dark"}</span>
              </button>
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

            {/* CLI Access & Token Modal Button */}
            <button
              type="button"
              onClick={() => setCliModalOpen(true)}
              title="Copy CLI Login Command & Terminal Access"
              aria-label="CLI Token"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium transition-all cursor-pointer shadow-xs"
            >
              <Terminal className="size-3.5" />
              <span className="hidden sm:inline font-mono">CLI Token</span>
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 hover:border-border bg-foreground/5 hover:bg-foreground/10 text-xs text-foreground/80 font-medium transition-all cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-mono">Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-sky-500" />
                  <span className="hidden sm:inline font-mono">Dark</span>
                </>
              )}
            </button>

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
