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
import {
  ArrowLeft,
  GitBranch,
  GitCommit,
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
  Calendar,
  Layers,
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

interface BranchItem {
  name: string;
  isDefault: boolean;
}

// Generate fallback initial files
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

## Architecture & Notes
- Byte-compatible with standard Git protocols
- Stored across high-availability Neon PostgreSQL objects table
- Connected to cloud API services on Render
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
  let codeLanguage = "";

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
        codeLanguage = line.slice(3).trim();
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
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Tabs: "code" vs "commits"
  const [activeTab, setActiveTab] = useState<"code" | "commits">("code");

  // Branches
  const [branches, setBranches] = useState<BranchItem[]>([{ name: "main", isDefault: true }]);
  const [currentBranch, setCurrentBranch] = useState<string>("main");
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  // Commits
  const [commits, setCommits] = useState<RepoCommitItem[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<RepoCommitItem | null>(null);

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
        }
      })
      .catch(() => {});
  }, [repoName]);

  // Fetch files whenever branch changes
  useEffect(() => {
    let isMounted = true;
    setLoadingFiles(true);
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
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingFiles(false);
      });

    return () => { isMounted = false; };
  }, [repoName, currentBranch]);

  // Fetch commits
  useEffect(() => {
    let isMounted = true;
    setLoadingCommits(true);
    api.get(`/repos/${encodeURIComponent(repoName)}/commits`)
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res.data)) {
          setCommits(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingCommits(false);
      });

    return () => { isMounted = false; };
  }, [repoName]);

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

  // Auto-detect README file for GitHub-style bottom preview
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

                {/* HTTPS Clone URL */}
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

                {/* CLI Command */}
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

                {/* Download ZIP button */}
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

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/75">
              <Layers className="size-3 text-emerald-400" />
              <span>{files.length} files</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/75">
              <GitCommit className="size-3 text-sky-400" />
              <span>{commits.length} commits</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation & Branch Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* GitHub-style Branch Dropdown */}
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

          {/* Navigation Tabs (Code vs Commits) */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-foreground/5 border border-border/40">
            <button
              type="button"
              onClick={() => setActiveTab("code")}
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
              onClick={() => setActiveTab("commits")}
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

              {/* Quick Filter */}
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

              {/* Virtualized FileTree */}
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

          {/* GitHub-style Automatic README Section */}
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

      {/* TAB 2: COMMIT HISTORY & DIFFS */}
      {activeTab === "commits" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-foreground/5 overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-border/40 flex items-center justify-between bg-foreground/5">
              <div className="flex items-center gap-2">
                <GitCommit className="size-4 text-sky-400" />
                <span className="text-xs font-semibold text-foreground">Commit History</span>
                <span className="text-xs text-foreground/50 font-mono">on branch '{currentBranch}'</span>
              </div>
              <span className="text-xs font-mono text-foreground/40">{commits.length} total commits</span>
            </div>

            {loadingCommits ? (
              <div className="p-8 text-center text-xs font-mono text-foreground/50">
                Loading commits from Neon DB...
              </div>
            ) : commits.length === 0 ? (
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
                        <span className="text-sm font-semibold text-foreground hover:text-emerald-400 transition-colors">
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
                        onClick={() => {
                          setSelectedCommit(c);
                          setActiveTab("code");
                        }}
                        className="p-1 rounded text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-colors"
                        title="View files at this commit"
                      >
                        <Code className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RepoFileExplorer;
