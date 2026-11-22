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

// Generate realistic dynamic file tree based on repository name
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
      code: `import { Logger } from "./utils/logger";
import { AppConfig } from "./config/app.config";

export class Application {
  private config: AppConfig;
  private logger = new Logger("${repoName}");

  constructor() {
    this.config = new AppConfig();
  }

  public async bootstrap(): Promise<void> {
    this.logger.info("Initializing ${repoName} service...");
    this.logger.info("Cloud synchronization active on branch 'main'");
    console.log("Ready to handle decentralized VCS requests.");
  }
}

const app = new Application();
app.bootstrap().catch(console.error);
`,
    },
    {
      path: "src/utils/logger.ts",
      status: "modified",
      churn: { additions: 18, deletions: 4 },
      code: `export class Logger {
  constructor(private context: string) {}

  info(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(\`[\${timestamp}] [\${this.context}] [INFO]: \${message}\`);
  }

  warn(message: string): void {
    const timestamp = new Date().toISOString();
    console.warn(\`[\${timestamp}] [\${this.context}] [WARN]: \${message}\`);
  }

  error(message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();
    console.error(\`[\${timestamp}] [\${this.context}] [ERROR]: \${message}\`, error);
  }
}
`,
    },
    {
      path: "src/config/app.config.ts",
      status: "added",
      churn: { additions: 22, deletions: 0 },
      code: `export interface ConfigOptions {
  port: number;
  environment: "development" | "production";
  backendUrl: string;
}

export class AppConfig implements ConfigOptions {
  public port = 8080;
  public environment = "production" as const;
  public backendUrl = "https://mygit-backend-y27o.onrender.com/api";
}
`,
    },
    {
      path: "package.json",
      status: "modified",
      churn: { additions: 28, deletions: 3 },
      code: `{
  "name": "${repoName}",
  "version": "1.0.0",
  "description": "Decentralized project on mygit platform",
  "main": "src/main.ts",
  "scripts": {
    "start": "ts-node src/main.ts",
    "build": "tsc",
    "test": "jest"
  },
  "author": "${owner}",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.7.0"
  }
}
`,
    },
    {
      path: ".gitignore",
      status: "added",
      churn: { additions: 12, deletions: 0 },
      code: `node_modules/
dist/
.env
*.log
.DS_Store
.mygit/credentials
`,
    },
  ];
}

function buildTreeNodes(files: RepoFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLeaf = index === parts.length - 1;
      let existingNode = currentLevel.find((n) => n.name === part);

      if (!existingNode) {
        existingNode = isLeaf
          ? {
              name: part,
              status: file.status,
              churn: file.churn,
            }
          : {
              name: part,
              children: [],
            };
        currentLevel.push(existingNode);
      }

      if (!isLeaf && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  }

  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes
      .map((n) => (n.children ? { ...n, children: sortNodes(n.children) } : n))
      .sort((a, b) => Number(!a.children) - Number(!b.children) || a.name.localeCompare(b.name));
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
  const [copiedClone, setCopiedClone] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingFiles(true);
    api.get(`/repos/${encodeURIComponent(repoName)}/files`)
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
      .catch(() => {
        // Fallback to initial files if no database files exist yet
      })
      .finally(() => {
        if (isMounted) setLoadingFiles(false);
      });

    return () => { isMounted = false; };
  }, [repoName]);

  const cloneCmd = `mygit clone https://mygit-backend-y27o.onrender.com/api/repos/${repoName}`;

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(cloneCmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header & Navigation */}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyCloneCmd}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-foreground/5 hover:bg-foreground/10 text-xs font-mono text-foreground/75 hover:text-foreground transition-colors"
              title="Copy clone command"
            >
              {copiedClone ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span className="hidden sm:inline">Clone Command</span>
            </button>
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

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/80">
              <GitBranch className="size-3 text-emerald-400" />
              <span>main</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-border/40 text-foreground/60">
              <GitCommit className="size-3 text-sky-400" />
              <span>latest</span>
            </span>
          </div>
        </div>

        {/* Clone command strip */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/5 border border-border/40 text-xs font-mono text-foreground/70">
          <Terminal className="size-3.5 text-foreground/50 shrink-0" />
          <span className="text-foreground/40 select-none">$</span>
          <span className="truncate flex-1 select-all">{cloneCmd}</span>
          <button
            type="button"
            onClick={copyCloneCmd}
            className="text-foreground/50 hover:text-foreground shrink-0 transition-colors"
          >
            {copiedClone ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4 min-h-[520px]">
        {/* Left Side: Dynamic FileTree */}
        <div className="rounded-xl border border-border/50 bg-foreground/5 flex flex-col overflow-hidden shadow-sm">
          {/* Header of Tree */}
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

          {/* FileTree Component */}
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
    </div>
  );
}

export default RepoFileExplorer;
