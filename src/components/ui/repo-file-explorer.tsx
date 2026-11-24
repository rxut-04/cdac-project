"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import {
  FileTree,
  FileTreeNode,
  FileTreeStatus,
} from "@/components/ui/file-tree";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffViewer, FileDiff } from "@/components/ui/diff-viewer";
import {
  ArrowLeft,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Copy,
  Check,
  FolderGit2,
  Lock,
  Globe,
  Terminal,
  FileText,
  Search,
  Code,
  Download,
  ChevronDown,
  Clock,
  User,
  BookOpen,
  Layers,
  MessageSquare,
  Plus,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export interface RepoFileExplorerProps {
  repoName: string;
  ownerUsername: string;
  isPrivate?: boolean;
  description?: string;
  onBack: () => void;
}

interface RepoFile {
  path: string;
  code: string;
  status?: FileTreeStatus;
  churn?: { additions: number; deletions: number };
}

interface RepoCommitItem {
  id: number;
  commitSha: string;
  parentSha?: string;
  treeSha?: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  committerName?: string;
  committerEmail?: string;
  authoredAt: string;
  pushedAt: string;
}

interface CommitDiffData {
  commitSha: string;
  parentSha?: string;
  treeSha?: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  authoredAt: string;
  totalAdditions: number;
  totalDeletions: number;
  filesChangedCount: number;
  files: FileDiff[];
}

interface PullRequestItem {
  id: number;
  number: number;
  title: string;
  description?: string;
  sourceBranch: string;
  targetBranch: string;
  status: "OPEN" | "MERGED" | "CLOSED" | string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  mergedByUsername?: string;
}

interface PullRequestDetail extends PullRequestItem {
  totalAdditions?: number;
  totalDeletions?: number;
  filesChangedCount?: number;
  files?: FileDiff[];
  comments?: Array<{
    id: number;
    authorUsername: string;
    commentText: string;
    createdAt: string;
  }>;
}

interface BranchItem {
  name: string;
  isDefault: boolean;
}

interface IssueItem {
  id: number;
  number: number;
  title: string;
  description?: string;
  status: "OPEN" | "CLOSED" | string;
  labels: string[];
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedByUsername?: string;
}

interface IssueDetail extends IssueItem {
  comments?: Array<{
    id: number;
    authorUsername: string;
    commentText: string;
    createdAt: string;
  }>;
}

// Fallback initial files
function getInitialFilesForRepo(repoName: string, owner: string): RepoFile[] {
  return [
    {
      path: "README.md",
      status: "added",
      churn: { additions: 32, deletions: 0 },
      code: `# ${repoName}

> Decentralized repository owned by **@${owner}**
> Managed and tracked via **mygit** VCS engine

## Quick Start

\`\`\`bash
# Clone this repository
mygit clone https://mygit-backend-y27o.onrender.com/api/repos/${repoName}
cd ${repoName}

# Inspect status
mygit status

# Make edits and commit
mygit add .
mygit commit -m "feat: first update"
mygit push origin main
\`\`\`
`,
    },
    {
      path: "src/main.ts",
      status: "added",
      churn: { additions: 45, deletions: 2 },
      code: `export class Application {
  public async bootstrap(): Promise<void> {
    console.log("Ready to handle decentralized VCS requests for ${repoName}.");
  }
}
`,
    },
  ];
}

function buildTreeNodes(files: RepoFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let currentLevel = root;
    let accumulatedPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;

      let existing = currentLevel.find((node) => node.name === part);

      if (!existing) {
        if (isFile) {
          existing = {
            id: accumulatedPath,
            name: part,
            path: accumulatedPath,
            status: file.status || "added",
            churn: file.churn,
          };
          currentLevel.push(existing);
        } else {
          existing = {
            id: accumulatedPath,
            name: part,
            path: accumulatedPath,
            children: [],
          };
          currentLevel.push(existing);
        }
      }

      if (!isFile && existing.children) {
        currentLevel = existing.children;
      }
    }
  }

  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes
      .sort((a, b) => {
        const aIsDir = !!a.children;
        const bIsDir = !!b.children;
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((node) => {
        if (node.children) {
          return {
            ...node,
            children: sortNodes(node.children),
          };
        }
        return node;
      });
  };

  return sortNodes(root);
}

function getLanguageForPath(path: string): string {
  if (path.endsWith(".java")) return "java";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".html") || path.endsWith(".htm")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".sql")) return "sql";
  if (path.endsWith(".xml")) return "xml";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".sh") || path.endsWith(".bash")) return "bash";
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".go")) return "go";
  if (path.endsWith(".rs")) return "rust";
  if (path.endsWith(".cpp") || path.endsWith(".c") || path.endsWith(".h")) return "cpp";
  if (path.endsWith(".yml") || path.endsWith(".yaml")) return "yaml";
  return "text";
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

// Markdown formatting helper
function renderMarkdownContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-lg overflow-hidden border border-border/40 bg-black/40 p-3 font-mono text-xs text-foreground/80 overflow-x-auto">
            <pre>{codeBuffer.join("\n")}</pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-xl sm:text-2xl font-bold border-b border-border/30 pb-2 mt-4 mb-3 text-foreground">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-lg sm:text-xl font-semibold border-b border-border/20 pb-1.5 mt-4 mb-2 text-foreground">
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold mt-3 mb-1 text-foreground">
          {line.substring(4)}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-emerald-500/70 pl-3 py-1 my-2 text-xs text-foreground/70 italic bg-emerald-500/5 rounded-r">
          {line.substring(2)}
        </blockquote>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-5 list-disc text-xs text-foreground/80 leading-relaxed">
          {line.substring(2)}
        </li>
      );
    } else if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={i} className="border-border/30 my-4" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-xs text-foreground/80 leading-relaxed">
          {line}
        </p>
      );
    }
  }

  return elements;
}

export function RepoFileExplorer({
  repoName,
  ownerUsername,
  isPrivate = false,
  description,
  onBack,
}: RepoFileExplorerProps) {
  const initialFiles = useMemo(() => getInitialFilesForRepo(repoName, ownerUsername), [repoName, ownerUsername]);
  const [files, setFiles] = useState<RepoFile[]>(initialFiles);
  const [selectedPath, setSelectedPath] = useState<string>("README.md");
  const [searchQuery, setSearchQuery] = useState("");

  // Navigation Tabs: "code" | "commits" | "pulls" | "issues"
  const [activeTab, setActiveTab] = useState<"code" | "commits" | "pulls" | "issues">("code");

  // Branches
  const [branches, setBranches] = useState<BranchItem[]>([{ name: "main", isDefault: true }]);
  const [currentBranch, setCurrentBranch] = useState<string>("main");
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  // Commits & Commit Diff
  const [commits, setCommits] = useState<RepoCommitItem[]>([]);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);
  const [commitDiffData, setCommitDiffData] = useState<CommitDiffData | null>(null);
  const [loadingCommitDiff, setLoadingCommitDiff] = useState(false);

  // Pull Requests
  const [pullRequests, setPullRequests] = useState<PullRequestItem[]>([]);
  const [loadingPulls, setLoadingPulls] = useState(false);
  const [selectedPrNumber, setSelectedPrNumber] = useState<number | null>(null);
  const [prDetail, setPrDetail] = useState<PullRequestDetail | null>(null);
  const [loadingPrDetail, setLoadingPrDetail] = useState(false);
  const [isCreatingPr, setIsCreatingPr] = useState(false);
  const [newPrTitle, setNewPrTitle] = useState("");
  const [newPrDesc, setNewPrDesc] = useState("");
  const [newPrSource, setNewPrSource] = useState("");
  const [newPrTarget, setNewPrTarget] = useState("main");
  const [prSubmitting, setPrSubmitting] = useState(false);
  const [prCommentText, setPrCommentText] = useState("");
  const [prMerging, setPrMerging] = useState(false);
  const [prStatusFilter, setPrStatusFilter] = useState<"ALL" | "OPEN" | "MERGED">("ALL");

  // Issues & Bug Reports
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [selectedIssueNumber, setSelectedIssueNumber] = useState<number | null>(null);
  const [issueDetail, setIssueDetail] = useState<IssueDetail | null>(null);
  const [loadingIssueDetail, setLoadingIssueDetail] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");
  const [newIssueLabels, setNewIssueLabels] = useState<string[]>([]);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueCommentText, setIssueCommentText] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [updatingIssueStatus, setUpdatingIssueStatus] = useState(false);

  // Code ▾ dropdown
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedHttps, setCopiedHttps] = useState(false);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const cloneCmd = `mygit clone https://mygit-backend-y27o.onrender.com/api/repos/${repoName}`;
  const httpsUrl = `https://mygit-backend-y27o.onrender.com/api/repos/${repoName}`;
  const downloadZipUrl = `https://mygit-backend-y27o.onrender.com/api/repos/${encodeURIComponent(repoName)}/archive/zip?branch=${encodeURIComponent(currentBranch)}`;

  // Fetch branches
  useEffect(() => {
    api.get(`/repos/${encodeURIComponent(repoName)}/branches`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBranches(res.data);
          if (!newPrSource && res.data.length > 1) {
            const nonMain = res.data.find((b: any) => b.name !== "main");
            if (nonMain) setNewPrSource(nonMain.name);
          }
        }
      })
      .catch(() => {});
  }, [repoName]);

  // Fetch files for active branch
  useEffect(() => {
    let isMounted = true;
    api.get(`/repos/${encodeURIComponent(repoName)}/files?branch=${encodeURIComponent(currentBranch)}`)
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          const liveFiles: RepoFile[] = res.data.map((item: any) => ({
            path: item.path,
            code: item.content || (item.isBinary ? `// Binary file: ${item.name} (${item.size} bytes)` : `// Empty file: ${item.name}`),
            status: "added",
          }));
          setFiles(liveFiles);
          setSelectedPath(liveFiles[0]?.path || "README.md");
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [repoName, currentBranch]);

  // Fetch commits
  useEffect(() => {
    let isMounted = true;
    api.get(`/repos/${encodeURIComponent(repoName)}/commits`)
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res.data)) {
          setCommits(res.data);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [repoName]);

  // Fetch Pull Requests
  const fetchPullRequests = () => {
    setLoadingPulls(true);
    api.get(`/repos/${encodeURIComponent(repoName)}/pulls?status=${prStatusFilter}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPullRequests(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPulls(false));
  };

  useEffect(() => {
    fetchPullRequests();
  }, [repoName, prStatusFilter]);

  // Fetch commit diff when a commit is selected
  useEffect(() => {
    if (!selectedCommitSha) {
      setCommitDiffData(null);
      return;
    }
    setLoadingCommitDiff(true);
    api.get(`/repos/${encodeURIComponent(repoName)}/commits/${encodeURIComponent(selectedCommitSha)}/diff`)
      .then((res) => {
        if (res.data) setCommitDiffData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingCommitDiff(false));
  }, [repoName, selectedCommitSha]);

  // Fetch PR detail when a PR is selected
  const loadPrDetail = (num: number) => {
    setLoadingPrDetail(true);
    api.get(`/repos/${encodeURIComponent(repoName)}/pulls/${num}`)
      .then((res) => {
        if (res.data) setPrDetail(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingPrDetail(false));
  };

  useEffect(() => {
    if (selectedPrNumber !== null) {
      loadPrDetail(selectedPrNumber);
    } else {
      setPrDetail(null);
    }
  }, [repoName, selectedPrNumber]);

  // Create PR
  const handleCreatePr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrTitle.trim() || !newPrSource.trim()) return;

    setPrSubmitting(true);
    api.post(`/repos/${encodeURIComponent(repoName)}/pulls`, {
      title: newPrTitle.trim(),
      description: newPrDesc.trim(),
      sourceBranch: newPrSource.trim(),
      targetBranch: newPrTarget.trim() || "main",
    })
      .then((res) => {
        setIsCreatingPr(false);
        setNewPrTitle("");
        setNewPrDesc("");
        fetchPullRequests();
        if (res.data?.number) {
          setSelectedPrNumber(res.data.number);
        }
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to create pull request");
      })
      .finally(() => setPrSubmitting(false));
  };

  // Merge PR
  const handleMergePr = () => {
    if (!selectedPrNumber) return;
    setPrMerging(true);
    api.post(`/repos/${encodeURIComponent(repoName)}/pulls/${selectedPrNumber}/merge`)
      .then(() => {
        loadPrDetail(selectedPrNumber);
        fetchPullRequests();
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Merge failed");
      })
      .finally(() => setPrMerging(false));
  };

  // Submit PR Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrNumber || !prCommentText.trim()) return;

    api.post(`/repos/${encodeURIComponent(repoName)}/pulls/${selectedPrNumber}/comments`, {
      commentText: prCommentText.trim(),
    })
      .then(() => {
        setPrCommentText("");
        loadPrDetail(selectedPrNumber);
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to post comment");
      });
  };

  // Fetch Issues
  const fetchIssues = () => {
    setLoadingIssues(true);
    api.get(`/repos/${encodeURIComponent(repoName)}/issues?status=${issueStatusFilter}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setIssues(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingIssues(false));
  };

  useEffect(() => {
    fetchIssues();
  }, [repoName, issueStatusFilter]);

  // Fetch issue detail when an issue is selected
  const loadIssueDetail = (num: number) => {
    setLoadingIssueDetail(true);
    api.get(`/repos/${encodeURIComponent(repoName)}/issues/${num}`)
      .then((res) => {
        if (res.data) setIssueDetail(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingIssueDetail(false));
  };

  useEffect(() => {
    if (selectedIssueNumber !== null) {
      loadIssueDetail(selectedIssueNumber);
    } else {
      setIssueDetail(null);
    }
  }, [repoName, selectedIssueNumber]);

  // Create Issue
  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;

    setIssueSubmitting(true);
    api.post(`/repos/${encodeURIComponent(repoName)}/issues`, {
      title: newIssueTitle.trim(),
      description: newIssueDesc.trim(),
      labels: newIssueLabels.join(","),
    })
      .then((res) => {
        setIsCreatingIssue(false);
        setNewIssueTitle("");
        setNewIssueDesc("");
        setNewIssueLabels([]);
        fetchIssues();
        if (res.data?.number) {
          setSelectedIssueNumber(res.data.number);
        }
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to create issue");
      })
      .finally(() => setIssueSubmitting(false));
  };

  // Toggle Issue Status (Open <-> Closed)
  const handleToggleIssueStatus = () => {
    if (!selectedIssueNumber || !issueDetail) return;
    setUpdatingIssueStatus(true);
    const nextStatus = issueDetail.status === "OPEN" ? "CLOSED" : "OPEN";

    api.patch(`/repos/${encodeURIComponent(repoName)}/issues/${selectedIssueNumber}/status`, {
      status: nextStatus,
    })
      .then((res) => {
        if (res.data) {
          setIssueDetail((prev) => prev ? { ...prev, status: res.data.status, closedAt: res.data.closedAt, closedByUsername: res.data.closedByUsername } : null);
          fetchIssues();
        }
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to update issue status");
      })
      .finally(() => setUpdatingIssueStatus(false));
  };

  // Submit Issue Comment
  const handleAddIssueComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueNumber || !issueCommentText.trim()) return;

    api.post(`/repos/${encodeURIComponent(repoName)}/issues/${selectedIssueNumber}/comments`, {
      commentText: issueCommentText.trim(),
    })
      .then((res) => {
        if (res.data && issueDetail) {
          setIssueDetail({
            ...issueDetail,
            comments: [...(issueDetail.comments || []), res.data],
          });
          setIssueCommentText("");
        }
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to post comment");
      });
  };

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(cloneCmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const copyHttpsUrl = () => {
    navigator.clipboard.writeText(httpsUrl);
    setCopiedHttps(true);
    setTimeout(() => setCopiedHttps(false), 2000);
  };

  const copySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const treeNodes = useMemo(() => buildTreeNodes(filteredFiles), [filteredFiles]);

  const selectedFile = useMemo(() => {
    return files.find((f) => f.path === selectedPath) || files[0];
  }, [files, selectedPath]);

  const readmeFile = useMemo(() => {
    return files.find((f) => f.path.toLowerCase() === "readme.md");
  }, [files]);

  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return branches;
    return branches.filter((b) => b.name.toLowerCase().includes(branchSearch.toLowerCase()));
  }, [branches, branchSearch]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono text-foreground/60 hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/50 bg-foreground/5 hover:bg-foreground/10"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Repositories</span>
          </button>

          {/* GitHub-style "Code ▾" Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCodeDropdownOpen(!codeDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Code className="size-3.5" />
              <span>Code</span>
              <ChevronDown className="size-3 opacity-80" />
            </button>

            {codeDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl p-3.5 z-50 text-xs font-sans space-y-3 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between font-semibold text-foreground/90 border-b border-border/30 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="size-3.5 text-emerald-400" />
                    Clone repository
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    HTTPS / CLI
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-foreground/60">Clone with Web URL</label>
                  <div className="flex items-center gap-1.5 bg-foreground/5 border border-border/40 rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={httpsUrl}
                      className="bg-transparent text-[11px] font-mono text-foreground/80 flex-1 truncate outline-none select-all px-1"
                    />
                    <button
                      type="button"
                      onClick={copyHttpsUrl}
                      className="p-1 rounded text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
                      title="Copy HTTPS URL"
                    >
                      {copiedHttps ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-foreground/60">mygit CLI command</label>
                  <div className="flex items-center gap-1.5 bg-foreground/5 border border-border/40 rounded-lg p-1.5">
                    <span className="text-foreground/40 font-mono text-[11px] pl-1 select-none">$</span>
                    <input
                      type="text"
                      readOnly
                      value={cloneCmd}
                      className="bg-transparent text-[11px] font-mono text-foreground/80 flex-1 truncate outline-none select-all px-1"
                    />
                    <button
                      type="button"
                      onClick={copyCloneCmd}
                      className="p-1 rounded text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
                      title="Copy CLI command"
                    >
                      {copiedClone ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1 border-t border-border/30">
                  <a
                    href={downloadZipUrl}
                    download={`${repoName}-${currentBranch}.zip`}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border/40 text-foreground text-xs font-medium transition-colors"
                    onClick={() => setCodeDropdownOpen(false)}
                  >
                    <Download className="size-3.5 text-emerald-400" />
                    <span>Download ZIP Archive</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Repo Title & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <FolderGit2 className="size-5 text-emerald-400" />
              <span className="text-foreground/50 text-sm font-mono">@{ownerUsername}</span>
              <span className="text-foreground/40 font-mono">/</span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{repoName}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-border/50 text-foreground/60 bg-foreground/5">
                {isPrivate ? (
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
            {description && (
              <p className="text-xs text-foreground/60 max-w-3xl leading-relaxed">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/75">
              <Layers className="size-3 text-emerald-400" />
              <span>{files.length} files</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/75">
              <GitCommit className="size-3 text-sky-400" />
              <span>{commits.length} commits</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/75">
              <GitPullRequest className="size-3 text-purple-400" />
              <span>{pullRequests.length} PRs</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/75">
              <AlertCircle className="size-3 text-amber-400" />
              <span>{issues.length} Issues</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation & Branch Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Branch Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-foreground/5 hover:bg-foreground/10 text-xs font-mono text-foreground/80 hover:text-foreground transition-colors"
            >
              <GitBranch className="size-3 text-emerald-400" />
              <span className="font-semibold">{currentBranch}</span>
              <ChevronDown className="size-3 opacity-60 ml-0.5" />
            </button>

            {branchDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-64 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl p-2 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 font-semibold text-foreground/90 border-b border-border/30 text-[11px]">
                  Switch branch
                </div>
                <div className="px-1">
                  <input
                    type="text"
                    placeholder="Find a branch..."
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    className="w-full bg-foreground/5 border border-border/40 rounded-md px-2 py-1 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto space-y-0.5">
                  {filteredBranches.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => {
                        setCurrentBranch(b.name);
                        setBranchDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left font-mono text-xs transition-colors ${
                        currentBranch === b.name
                          ? "bg-emerald-500/15 text-emerald-400 font-semibold"
                          : "hover:bg-foreground/5 text-foreground/75"
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      {currentBranch === b.name && <Check className="size-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs (Code / Commits / Pull Requests) */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-foreground/5 border border-border/40">
            <button
              type="button"
              onClick={() => {
                setActiveTab("code");
                setSelectedCommitSha(null);
                setSelectedPrNumber(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "code"
                  ? "bg-foreground/15 text-foreground shadow-xs font-semibold"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Code className="size-3.5" />
              <span>Code</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("commits");
                setSelectedPrNumber(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "commits"
                  ? "bg-foreground/15 text-foreground shadow-xs font-semibold"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <GitCommit className="size-3.5 text-sky-400" />
              <span>Commits</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-foreground/10 text-foreground/70">
                {commits.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("pulls");
                setSelectedCommitSha(null);
                setSelectedIssueNumber(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "pulls"
                  ? "bg-foreground/15 text-foreground shadow-xs font-semibold"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <GitPullRequest className="size-3.5 text-purple-400" />
              <span>Pull Requests</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-foreground/10 text-foreground/70">
                {pullRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("issues");
                setSelectedCommitSha(null);
                setSelectedPrNumber(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "issues"
                  ? "bg-foreground/15 text-foreground shadow-xs font-semibold"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <AlertCircle className="size-3.5 text-amber-400" />
              <span>Issues</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-foreground/10 text-foreground/70">
                {issues.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CODE EXPLORER */}
      {activeTab === "code" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4 min-h-[520px]">
            {/* Left Side: Dynamic FileTree */}
            <div className="rounded-xl border border-border/50 bg-foreground/5 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 border-b border-border/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                  <FileText className="size-3.5 text-foreground/50" />
                  <span>Files & Folders</span>
                </div>
                <span className="text-[11px] font-mono text-foreground/40 tabular-nums">
                  {files.length} items
                </span>
              </div>

              <div className="p-2 border-b border-border/30">
                <div className="relative">
                  <Search className="size-3 text-foreground/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-foreground/5 border border-border/40 rounded-md pl-7 pr-2.5 py-1 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-border"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-1.5">
                <FileTree
                  nodes={treeNodes}
                  defaultExpanded={true}
                  selected={selectedPath}
                  onSelectedChange={(path, node) => {
                    if (!node.children) {
                      setSelectedPath(path);
                    }
                  }}
                  label={`${repoName} files`}
                  maxHeight="440px"
                />
              </div>
            </div>

            {/* Right Side: CodeBlock Viewer */}
            <div className="flex flex-col min-w-0 rounded-xl overflow-hidden border border-border/50 bg-foreground/5 shadow-sm">
              <CodeBlock
                className="w-full h-full min-h-[500px]"
                filename={selectedFile ? selectedFile.path : "README.md"}
                language={getLanguageForPath(selectedFile ? selectedFile.path : "README.md")}
                code={selectedFile ? selectedFile.code : "// No file selected"}
                showLineNumbers={true}
                collapseAfter={false}
              />
            </div>
          </div>

          {/* Automatic README Section */}
          {readmeFile && (
            <div className="rounded-xl border border-border/50 bg-foreground/5 overflow-hidden shadow-sm">
              <div className="p-3 border-b border-border/40 flex items-center justify-between gap-2 bg-foreground/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80 font-mono">
                  <BookOpen className="size-4 text-emerald-400" />
                  <span>README.md</span>
                </div>
                <span className="text-[11px] font-mono text-foreground/40">Repository Documentation</span>
              </div>
              <div className="p-6 prose-invert max-w-none space-y-2">
                {renderMarkdownContent(readmeFile.code)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMMIT HISTORY & COMMIT DIFF VIEWER */}
      {activeTab === "commits" && (
        <div className="space-y-4">
          {selectedCommitSha ? (
            /* OPTION B: Single Commit Diff Viewer */
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-foreground/5 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedCommitSha(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-foreground/60 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to all commits</span>
                </button>

                {loadingCommitDiff ? (
                  <div className="py-8 text-center text-xs font-mono text-foreground/50">
                    Computing commit diff from Neon DB...
                  </div>
                ) : commitDiffData ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-foreground">{commitDiffData.message}</h3>
                        <div className="flex items-center gap-2 text-xs text-foreground/60 font-mono mt-1">
                          <User className="size-3 text-emerald-400" />
                          <span>{commitDiffData.authorName}</span>
                          <span>•</span>
                          <Clock className="size-3" />
                          <span>{formatRelativeTime(commitDiffData.authoredAt)}</span>
                          {commitDiffData.parentSha && (
                            <>
                              <span>•</span>
                              <span className="text-[11px] text-foreground/40">parent {commitDiffData.parentSha.substring(0, 7)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded border border-border/50 bg-foreground/5 text-xs font-mono text-foreground/80">
                          {commitDiffData.commitSha.substring(0, 7)}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-emerald-400 font-semibold">+{commitDiffData.totalAdditions}</span>
                          <span className="text-rose-400 font-semibold">-{commitDiffData.totalDeletions}</span>
                          <span className="text-foreground/50">({commitDiffData.filesChangedCount} files)</span>
                        </div>
                      </div>
                    </div>

                    <DiffViewer files={commitDiffData.files} />
                  </div>
                ) : (
                  <div className="py-4 text-xs text-rose-400 font-mono">Failed to load diff for commit.</div>
                )}
              </div>
            </div>
          ) : (
            /* Commits Timeline List */
            <div className="rounded-xl border border-border/50 bg-foreground/5 overflow-hidden shadow-sm">
              <div className="p-3.5 border-b border-border/40 flex items-center justify-between bg-foreground/5">
                <div className="flex items-center gap-2">
                  <GitCommit className="size-4 text-sky-400" />
                  <span className="text-xs font-semibold text-foreground">Commit History</span>
                  <span className="text-xs text-foreground/50 font-mono">on branch '{currentBranch}'</span>
                </div>
                <span className="text-xs font-mono text-foreground/40">{commits.length} total commits</span>
              </div>

              {commits.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-foreground/50">
                  No commit records found for this repository.
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {commits.map((c) => (
                    <div
                      key={c.commitSha}
                      className="p-4 hover:bg-foreground/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => setSelectedCommitSha(c.commitSha)}
                            className="text-sm font-semibold text-foreground hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {c.message}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground/50 font-mono flex-wrap">
                          <span className="inline-flex items-center gap-1 text-foreground/75">
                            <User className="size-3" />
                            <span>{c.authorName}</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>{formatRelativeTime(c.authoredAt || c.pushedAt)}</span>
                          </span>
                          {c.parentSha && (
                            <>
                              <span>•</span>
                              <span className="text-[11px] text-foreground/40">
                                parent {c.parentSha.substring(0, 7)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => copySha(c.commitSha)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-foreground/5 hover:bg-foreground/10 text-xs font-mono text-foreground/80 hover:text-foreground transition-colors"
                          title="Copy full commit SHA"
                        >
                          {copiedSha === c.commitSha ? (
                            <Check className="size-3 text-emerald-400" />
                          ) : (
                            <Copy className="size-3 text-foreground/40" />
                          )}
                          <span>{c.commitSha.substring(0, 7)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedCommitSha(c.commitSha)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-400 transition-colors"
                          title="View commit diff"
                        >
                          <span>Diff</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OPTION A - PULL REQUESTS & BRANCH MERGING */}
      {activeTab === "pulls" && (
        <div className="space-y-4">
          {selectedPrNumber !== null && prDetail ? (
            /* Single Pull Request Detail View */
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setSelectedPrNumber(null)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-foreground/60 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Pull Requests</span>
              </button>

              {/* PR Header */}
              <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-bold text-foreground">{prDetail.title}</h2>
                      <span className="text-lg font-mono text-foreground/40">#{prDetail.number}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-foreground/60 font-mono flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          prDetail.status === "MERGED"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {prDetail.status === "MERGED" ? (
                          <>
                            <GitMerge className="size-3" /> Merged
                          </>
                        ) : (
                          <>
                            <GitPullRequest className="size-3" /> Open
                          </>
                        )}
                      </span>

                      <span>
                        <strong className="text-foreground">{prDetail.authorUsername}</strong> wants to merge into{" "}
                        <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-emerald-400 font-bold">{prDetail.targetBranch}</code> from{" "}
                        <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-sky-400 font-bold">{prDetail.sourceBranch}</code>
                      </span>

                      <span>•</span>
                      <span>{formatRelativeTime(prDetail.createdAt)}</span>
                    </div>
                  </div>

                  {/* Merge Action Button */}
                  {prDetail.status === "OPEN" && (
                    <div>
                      <button
                        type="button"
                        onClick={handleMergePr}
                        disabled={prMerging}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                      >
                        <GitMerge className="size-3.5" />
                        <span>{prMerging ? "Merging Branch..." : "Merge Pull Request"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* PR Description */}
                {prDetail.description && (
                  <div className="p-4 rounded-lg bg-foreground/5 border border-border/30 text-xs text-foreground/80 leading-relaxed font-sans">
                    {renderMarkdownContent(prDetail.description)}
                  </div>
                )}

                {/* Summary Metrics */}
                <div className="flex items-center gap-3 text-xs font-mono text-foreground/60 border-t border-border/20 pt-3">
                  <span>{prDetail.filesChangedCount || 0} files changed</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">+{prDetail.totalAdditions || 0}</span>
                  <span className="text-rose-400 font-semibold">-{prDetail.totalDeletions || 0}</span>
                </div>
              </div>

              {/* Discussion & Review Comments */}
              <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground font-mono">
                  <MessageSquare className="size-4 text-purple-400" />
                  <span>Discussion ({prDetail.comments?.length || 0})</span>
                </div>

                <div className="space-y-3">
                  {prDetail.comments && prDetail.comments.length > 0 ? (
                    prDetail.comments.map((cm) => (
                      <div key={cm.id} className="p-3 rounded-lg border border-border/30 bg-black/20 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-foreground/50">
                          <span className="font-semibold text-foreground">{cm.authorUsername}</span>
                          <span>{formatRelativeTime(cm.createdAt)}</span>
                        </div>
                        <p className="text-xs text-foreground/80 font-sans">{cm.commentText}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-mono text-foreground/40 italic">No comments on this pull request yet.</p>
                  )}
                </div>

                {/* Add Comment Box */}
                <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-border/30">
                  <textarea
                    rows={2}
                    placeholder="Leave a review comment..."
                    value={prCommentText}
                    onChange={(e) => setPrCommentText(e.target.value)}
                    className="w-full bg-foreground/5 border border-border/40 rounded-lg p-2.5 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-border"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!prCommentText.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-xs font-semibold text-foreground transition-colors disabled:opacity-40"
                    >
                      <Send className="size-3" />
                      <span>Comment</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Changed Files Diff */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground font-mono flex items-center gap-2">
                    <FileText className="size-4 text-emerald-400" />
                    <span>Files changed</span>
                  </h3>
                </div>
                <DiffViewer files={prDetail.files || []} />
              </div>
            </div>
          ) : isCreatingPr ? (
            /* Create Pull Request Form */
            <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="size-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">Open a Pull Request</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingPr(false)}
                  className="text-xs text-foreground/50 hover:text-foreground font-mono"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreatePr} className="space-y-4">
                {/* Branch Selection Bar */}
                <div className="p-3 rounded-lg bg-foreground/5 border border-border/40 flex items-center gap-3 text-xs font-mono">
                  <span className="text-foreground/60">base:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    main
                  </span>

                  <span className="text-foreground/40">⭠</span>

                  <span className="text-foreground/60">compare:</span>
                  <select
                    value={newPrSource}
                    onChange={(e) => setNewPrSource(e.target.value)}
                    className="bg-foreground/10 border border-border/50 rounded px-2.5 py-1 text-xs text-foreground font-mono outline-none"
                  >
                    <option value="">Select source branch</option>
                    {branches
                      .filter((b) => b.name !== "main")
                      .map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. feat: integrate banking ledger updates"
                    value={newPrTitle}
                    onChange={(e) => setNewPrTitle(e.target.value)}
                    className="w-full bg-foreground/5 border border-border/40 rounded-lg p-2.5 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Description (Markdown supported)</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the changes made in this branch..."
                    value={newPrDesc}
                    onChange={(e) => setNewPrDesc(e.target.value)}
                    className="w-full bg-foreground/5 border border-border/40 rounded-lg p-2.5 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-border font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPr(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-border/50 text-xs font-mono text-foreground/70 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={prSubmitting || !newPrTitle.trim() || !newPrSource.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                    <span>{prSubmitting ? "Creating PR..." : "Create Pull Request"}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Pull Requests List */
            <div className="rounded-xl border border-border/50 bg-foreground/5 overflow-hidden shadow-sm space-y-0">
              <div className="p-3.5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-foreground/5">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="size-4 text-purple-400" />
                  <span className="text-xs font-semibold text-foreground">Pull Requests</span>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 ml-3 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setPrStatusFilter("ALL")}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        prStatusFilter === "ALL" ? "bg-foreground/15 text-foreground font-bold" : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrStatusFilter("OPEN")}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        prStatusFilter === "OPEN" ? "bg-foreground/15 text-emerald-400 font-bold" : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrStatusFilter("MERGED")}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        prStatusFilter === "MERGED" ? "bg-foreground/15 text-purple-400 font-bold" : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      Merged
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingPr(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
                >
                  <Plus className="size-3" />
                  <span>New pull request</span>
                </button>
              </div>

              {loadingPulls ? (
                <div className="p-8 text-center text-xs font-mono text-foreground/50">
                  Loading pull requests from Neon DB...
                </div>
              ) : pullRequests.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <GitPullRequest className="size-8 text-foreground/20 mx-auto" />
                  <p className="text-xs font-mono text-foreground/60">No pull requests match this filter.</p>
                  <p className="text-[11px] text-foreground/40 font-sans">
                    Create a branch, push changes, and open a pull request to review code and merge.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {pullRequests.map((pr) => (
                    <div
                      key={pr.id}
                      onClick={() => setSelectedPrNumber(pr.number)}
                      className="p-4 hover:bg-foreground/5 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {pr.status === "MERGED" ? (
                          <GitMerge className="size-4 text-purple-400 shrink-0 mt-0.5" />
                        ) : (
                          <GitPullRequest className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                              {pr.title}
                            </span>
                            <span className="text-xs font-mono text-foreground/40">#{pr.number}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-foreground/50 font-mono flex-wrap">
                            <span>
                              by <strong className="text-foreground/75">{pr.authorUsername}</strong>
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400/90">{pr.targetBranch}</span>
                            <span>⭠</span>
                            <span className="text-sky-400/90">{pr.sourceBranch}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(pr.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 uppercase border ${
                          pr.status === "MERGED"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {pr.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ISSUES TRACKER & BUG REPORTS */}
      {activeTab === "issues" && (
        <div className="space-y-4">
          {selectedIssueNumber !== null && issueDetail ? (
            /* Single Issue Detail View */
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setSelectedIssueNumber(null)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-foreground/60 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Issues</span>
              </button>

              {/* Issue Header */}
              <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-bold text-foreground">{issueDetail.title}</h2>
                      <span className="text-lg font-mono text-foreground/40">#{issueDetail.number}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-foreground/60 font-mono flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          issueDetail.status === "CLOSED"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {issueDetail.status === "CLOSED" ? (
                          <>
                            <CheckCircle2 className="size-3" /> Closed
                          </>
                        ) : (
                          <>
                            <AlertCircle className="size-3" /> Open
                          </>
                        )}
                      </span>

                      <span>
                        <strong className="text-foreground">{issueDetail.authorUsername}</strong> opened this issue{" "}
                        {formatRelativeTime(issueDetail.createdAt)}
                      </span>

                      {issueDetail.closedAt && (
                        <>
                          <span>•</span>
                          <span className="text-purple-400/80">
                            closed by {issueDetail.closedByUsername || "author"} {formatRelativeTime(issueDetail.closedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Toggle Status Action Button */}
                  <button
                    type="button"
                    onClick={handleToggleIssueStatus}
                    disabled={updatingIssueStatus}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all self-start sm:self-auto disabled:opacity-50 ${
                      issueDetail.status === "OPEN"
                        ? "bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border/50"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {issueDetail.status === "OPEN" ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-purple-400" />
                        <span>{updatingIssueStatus ? "Closing..." : "Close issue"}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3.5 text-white" />
                        <span>{updatingIssueStatus ? "Reopening..." : "Reopen issue"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Issue Description & Labels */}
                <div className="space-y-3">
                  <div className="text-xs text-foreground/80 leading-relaxed font-sans bg-foreground/5 p-4 rounded-lg border border-border/30 whitespace-pre-wrap">
                    {issueDetail.description || "No description provided."}
                  </div>

                  {issueDetail.labels && issueDetail.labels.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-mono text-foreground/40">Labels:</span>
                      {issueDetail.labels.map((lbl, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Discussion Thread */}
              <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-semibold font-mono text-foreground/70 flex items-center gap-2">
                  <MessageSquare className="size-3.5 text-amber-400" />
                  <span>Discussion ({issueDetail.comments?.length || 0})</span>
                </h3>

                <div className="space-y-3">
                  {(!issueDetail.comments || issueDetail.comments.length === 0) ? (
                    <p className="text-xs font-mono text-foreground/40 py-2">
                      No comments on this issue yet. Join the discussion below.
                    </p>
                  ) : (
                    issueDetail.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-border/40 bg-foreground/5 p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs text-foreground/50 font-mono border-b border-border/20 pb-2">
                          <span className="flex items-center gap-1.5 font-semibold text-foreground/90">
                            <User className="size-3 text-amber-400" />
                            {comment.authorUsername}
                          </span>
                          <span>{formatRelativeTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-xs text-foreground/80 font-sans leading-relaxed whitespace-pre-wrap">
                          {comment.commentText}
                        </p>
                      </div>
                    ))
                  )}

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddIssueComment} className="pt-2 space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Leave a comment on this issue..."
                      value={issueCommentText}
                      onChange={(e) => setIssueCommentText(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border/50 bg-foreground/5 text-xs text-foreground outline-none focus:border-amber-500/50 transition-colors font-sans"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!issueCommentText.trim()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-foreground/10 hover:bg-foreground/15 border border-border/50 text-xs font-semibold text-foreground transition-all disabled:opacity-40"
                      >
                        <Send className="size-3" />
                        <span>Comment</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : isCreatingIssue ? (
            /* New Issue Form */
            <div className="rounded-xl border border-border/50 bg-foreground/5 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-foreground">Create a new Issue</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingIssue(false)}
                  className="text-xs font-mono text-foreground/50 hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-foreground/70">Issue Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audit token expiration in AuthService.java"
                    value={newIssueTitle}
                    onChange={(e) => setNewIssueTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-foreground/5 text-xs text-foreground outline-none focus:border-amber-500/60 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-foreground/70">Description / Reproduction Steps</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what happened, expected behavior, or tasks needed..."
                    value={newIssueDesc}
                    onChange={(e) => setNewIssueDesc(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border/50 bg-foreground/5 text-xs text-foreground outline-none focus:border-amber-500/60 font-sans"
                  />
                </div>

                {/* Preset Labels */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-foreground/70">Add Labels</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {["bug", "enhancement", "security", "documentation", "performance", "help-wanted"].map((label) => {
                      const isSelected = newIssueLabels.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewIssueLabels(newIssueLabels.filter((l) => l !== label));
                            } else {
                              setNewIssueLabels([...newIssueLabels, label]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                            isSelected
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                              : "bg-foreground/5 text-foreground/50 hover:text-foreground border border-border/40"
                          }`}
                        >
                          {isSelected ? `✓ ${label}` : `+ ${label}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                  <button
                    type="button"
                    onClick={() => setIsCreatingIssue(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-border/50 text-xs font-mono text-foreground/70 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={issueSubmitting || !newIssueTitle.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                    <span>{issueSubmitting ? "Submitting..." : "Submit new issue"}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Issues List View */
            <div className="rounded-xl border border-border/50 bg-foreground/5 overflow-hidden shadow-sm space-y-0">
              <div className="p-3.5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-foreground/5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">Issues</span>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 ml-3 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setIssueStatusFilter("ALL")}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        issueStatusFilter === "ALL" ? "bg-foreground/15 text-foreground font-bold" : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setIssueStatusFilter("OPEN")}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        issueStatusFilter === "OPEN" ? "bg-foreground/15 text-emerald-400 font-bold" : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setIssueStatusFilter("CLOSED")}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        issueStatusFilter === "CLOSED" ? "bg-foreground/15 text-purple-400 font-bold" : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingIssue(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
                >
                  <Plus className="size-3" />
                  <span>New issue</span>
                </button>
              </div>

              {loadingIssues ? (
                <div className="p-8 text-center text-xs font-mono text-foreground/50">
                  Loading issues from Neon DB...
                </div>
              ) : issues.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <AlertCircle className="size-8 text-foreground/20 mx-auto" />
                  <p className="text-xs font-mono text-foreground/60">No issues match this filter.</p>
                  <p className="text-[11px] text-foreground/40 font-sans">
                    Track bugs, tasks, and feature proposals for this repository.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {issues.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => setSelectedIssueNumber(i.number)}
                      className="p-4 hover:bg-foreground/5 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {i.status === "CLOSED" ? (
                          <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground group-hover:text-amber-400 transition-colors">
                              {i.title}
                            </span>
                            <span className="text-xs font-mono text-foreground/40">#{i.number}</span>

                            {i.labels && i.labels.length > 0 && (
                              <div className="flex items-center gap-1 ml-1">
                                {i.labels.map((lbl, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  >
                                    {lbl}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-foreground/50 font-mono flex-wrap">
                            <span>
                              opened by <strong className="text-foreground/75">{i.authorUsername}</strong>
                            </span>
                            <span>•</span>
                            <span>{formatRelativeTime(i.createdAt)}</span>
                            {i.closedAt && (
                              <>
                                <span>•</span>
                                <span className="text-purple-400/80">closed {formatRelativeTime(i.closedAt)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 uppercase border ${
                          i.status === "CLOSED"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {i.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RepoFileExplorer;
