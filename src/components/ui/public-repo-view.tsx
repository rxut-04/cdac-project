"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { authApi, repoApi, RepositoryItem } from "@/lib/api";
import { RepoFileExplorer } from "@/components/ui/repo-file-explorer";
import { Lock, ArrowLeft, LogIn } from "lucide-react";
import { BarsSpinner } from "@/components/bars-spinner";

interface PublicRepoViewProps {
  owner: string;
  repoName: string;
  onBackHome: () => void;
  onLogin: () => void;
}

export function PublicRepoView({ owner, repoName, onBackHome, onLogin }: PublicRepoViewProps) {
  const [repo, setRepo] = useState<RepositoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storedUser = authApi.getStoredUser();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    repoApi
      .getByOwner(owner, repoName)
      .then((data) => {
        if (!active) return;
        setRepo(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        const msg = err?.response?.data?.error || "Repository not found or is private.";
        setError(msg);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [owner, repoName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm font-mono text-foreground/60">
          <BarsSpinner size={20} />
          <span>Loading {owner}/{repoName}...</span>
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border/50 bg-foreground/5 text-center space-y-4">
          <div className="size-12 rounded-xl bg-foreground/10 border border-border/50 flex items-center justify-center mx-auto">
            <Lock className="size-5 text-foreground/60" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Repository unavailable</h1>
          <p className="text-xs font-mono text-foreground/60">
            {error || `${owner}/${repoName} does not exist or is private.`}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border/50 text-xs font-mono text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent-pro text-white text-xs font-medium"
            >
              <LogIn className="size-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-full mx-auto px-4 sm:px-8 py-6">
        <RepoFileExplorer
          repoName={repo.name}
          ownerUsername={repo.ownerUsername || owner}
          isPrivate={repo.isPrivate}
          description={repo.description || ""}
          forkedFrom={repo.forkedFrom}
          currentUsername={storedUser?.username || ""}
          onBack={onBackHome}
        />
      </div>
    </div>
  );
}
