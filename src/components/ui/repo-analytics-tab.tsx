"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Chart } from "@/components/chart";
import { api } from "@/lib/api";
import {
  Activity,
  Clock,
  Code2,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Loader2,
  RefreshCw,
  Rocket,
  Star,
  Users,
  HardDrive,
} from "lucide-react";

interface SeriesData {
  labels: string[];
  values: number[];
}

interface RepoAnalyticsData {
  repo: string;
  owner: string;
  branch: string;
  commitActivity: {
    daily: SeriesData;
    weekly: SeriesData;
    monthly: SeriesData;
  };
  heatmap: {
    days: Record<string, number>;
    totalCommits: number;
  };
  contributors: Array<{
    name: string;
    email: string;
    commits: number;
    sharePct: number;
  }>;
  languages: Array<{
    name: string;
    color: string;
    bytes: number;
    files: number;
    percentage: number;
  }>;
  repoSize: {
    totalFiles: number;
    totalBytes: number;
  };
  commitTimePatterns: {
    matrix: number[][];
  };
  deployments: {
    total: number;
    live: number;
    failed: number;
    labels: string[];
    durations: number[];
    history: Array<{
      id: number;
      status: string;
      framework: string;
      durationMs: number;
    }>;
  };
  collaboration: {
    stars: number;
    issues: { open: number; closed: number; total: number };
    pulls: { open: number; merged: number; closed: number; total: number; avgMergeHours: number };
  };
}

interface RepoAnalyticsTabProps {
  ownerUsername: string;
  repoName: string;
  branch: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const RepoAnalyticsTab: React.FC<RepoAnalyticsTabProps> = ({
  ownerUsername,
  repoName,
  branch,
}) => {
  const [data, setData] = useState<RepoAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
      const res = await api.get<RepoAnalyticsData>(
        `/repos/${encodeURIComponent(ownerUsername)}/${encodeURIComponent(repoName)}/analytics`,
        { params: { branch, tz: tz || "UTC" } }
      );
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [ownerUsername, repoName, branch]);

  const heatmapWeeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1 - (6 - today.getDay())));

    const weeks: Array<Array<{ date: string; count: number }>> = [];
    let currentWeek: Array<{ date: string; count: number }> = [];
    const cur = new Date(startDate);

    for (let i = 0; i < totalDays; i++) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      currentWeek.push({ date: key, count: data?.heatmap?.days?.[key] || 0 });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      cur.setDate(cur.getDate() + 1);
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [data]);

  const maxTimePattern = useMemo(() => {
    if (!data?.commitTimePatterns?.matrix) return 1;
    let m = 1;
    for (const row of data.commitTimePatterns.matrix) {
      for (const val of row) if (val > m) m = val;
    }
    return m;
  }, [data]);

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-border/50 bg-foreground/5 p-12 flex items-center justify-center gap-2 text-xs font-mono text-foreground/60">
        <Loader2 className="size-4 animate-spin text-accent-pro" />
        <span>Loading real-time repository analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-border/50 bg-foreground/5 p-8 text-center text-xs font-mono text-foreground/60">
        Unable to load repository analytics.
      </div>
    );
  }

  const activeSeries = data.commitActivity[granularity];
  const chartData = activeSeries.values.length > 1 ? activeSeries.values : [0, ...(activeSeries.values || [0])];
  const chartLabels = activeSeries.labels.length > 1 ? activeSeries.labels : ["", ...(activeSeries.labels || [""])];

  const depDurations = data.deployments.durations.length > 1
    ? data.deployments.durations
    : [0, ...(data.deployments.durations || [0])];
  const depLabels = data.deployments.labels.length > 1
    ? data.deployments.labels
    : ["Init", ...(data.deployments.labels || ["#1"])];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-foreground/55">
            <GitCommit className="size-3.5 text-sky-400" />
            <span>Commits</span>
          </div>
          <div className="text-xl font-bold mt-1 font-mono">{data.heatmap.totalCommits}</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-foreground/55">
            <HardDrive className="size-3.5 text-emerald-400" />
            <span>Repo Size</span>
          </div>
          <div className="text-xl font-bold mt-1 font-mono">{data.repoSize.totalFiles} files</div>
          <div className="text-[10px] font-mono text-foreground/50">{formatBytes(data.repoSize.totalBytes)}</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-foreground/55">
            <Rocket className="size-3.5 text-emerald-400" />
            <span>Deployments</span>
          </div>
          <div className="text-xl font-bold mt-1 font-mono">
            {data.deployments.live} <span className="text-xs font-normal text-foreground/50">/ {data.deployments.total} live</span>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-foreground/55">
            <AlertCircle className="size-3.5 text-amber-400" />
            <span>Issues</span>
          </div>
          <div className="text-xl font-bold mt-1 font-mono">
            {data.collaboration.issues.open} <span className="text-xs font-normal text-foreground/50">open · {data.collaboration.issues.closed} closed</span>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-foreground/55">
            <GitPullRequest className="size-3.5 text-purple-400" />
            <span>Pull Requests</span>
          </div>
          <div className="text-xl font-bold mt-1 font-mono">
            {data.collaboration.pulls.merged} <span className="text-xs font-normal text-foreground/50">merged · {data.collaboration.pulls.open} open</span>
          </div>
          <div className="text-[10px] font-mono text-foreground/50 flex items-center gap-2">
            <span>Avg merge: {data.collaboration.pulls.avgMergeHours}h</span>
            <span>· <Star className="size-2.5 inline text-amber-400" /> {data.collaboration.stars}</span>
          </div>
        </div>
      </div>

      {/* 1. Main Chart: Commit Activity Over Time */}
      <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="size-4 text-sky-400" />
              <span>Commit Activity Over Time</span>
            </h3>
            <p className="text-[11px] font-mono text-foreground/55 mt-0.5">
              Real-time commit frequency across {ownerUsername}/{repoName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border/50 bg-background/60 p-0.5">
              {(["daily", "weekly", "monthly"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-colors ${
                    granularity === g
                      ? "bg-foreground/15 text-foreground font-semibold"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-1.5 rounded-lg border border-border/50 hover:bg-foreground/10 text-foreground/70"
              title="Refresh analytics"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <Chart
          data={chartData}
          labels={chartLabels}
          name="Commits"
          color="#0090FD"
          formatValue={(v) => `${v} commit${v === 1 ? "" : "s"}`}
        />
      </div>

      {/* 2. Repository Contribution Heatmap */}
      <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">Repository Commit Heatmap (Past Year)</span>
          <span className="font-mono text-foreground/55">
            {hoveredCell || `${data.heatmap.totalCommits} total commits`}
          </span>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex gap-1">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => {
                  const bg =
                    day.count === 0
                      ? "bg-foreground/10"
                      : day.count === 1
                      ? "bg-emerald-500/35"
                      : day.count <= 3
                      ? "bg-emerald-500/60"
                      : "bg-emerald-400";
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredCell(`${day.date}: ${day.count} commit${day.count === 1 ? "" : "s"}`)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${day.date}: ${day.count} commit(s)`}
                      className={`size-2.5 rounded-[2px] ${bg} transition-transform hover:scale-125`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 & 4. Language Breakdown + Commits by Contributor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Language Breakdown */}
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Code2 className="size-4 text-emerald-400" />
            <span>Language Breakdown</span>
          </h4>
          {data.languages.length === 0 ? (
            <p className="text-xs font-mono text-foreground/50">No recognized source files yet.</p>
          ) : (
            <>
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-foreground/10">
                {data.languages.map((lang) => (
                  <div
                    key={lang.name}
                    style={{ width: `${Math.max(lang.percentage, 1)}%`, backgroundColor: lang.color }}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.languages.map((lang) => (
                  <div key={lang.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
                      <span className="truncate">{lang.name}</span>
                    </div>
                    <span className="text-foreground/60 shrink-0">
                      {lang.percentage}% <span className="text-[10px]">({lang.files})</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Commits by Contributor */}
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Users className="size-4 text-sky-400" />
            <span>Commits by Contributor</span>
          </h4>
          {data.contributors.length === 0 ? (
            <p className="text-xs font-mono text-foreground/50">No commits recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {data.contributors.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium truncate">{c.name}</span>
                    <span className="text-foreground/60">
                      {c.commits} commit{c.commits === 1 ? "" : "s"} ({c.sharePct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{ width: `${Math.max(c.sharePct, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5 & 6. Commit Time Patterns + Deployment Duration Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commit Time Patterns (Day x Hour) */}
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="size-4 text-amber-400" />
            <span>Commit Time Patterns (Day × Hour)</span>
          </h4>
          <div className="space-y-1.5 overflow-x-auto">
            {DAY_NAMES.map((dayLabel, dow) => (
              <div key={dayLabel} className="flex items-center gap-1.5">
                <span className="w-8 text-[10px] font-mono text-foreground/55 shrink-0">{dayLabel}</span>
                <div className="grid grid-cols-24 gap-0.5 flex-1 min-w-[260px]">
                  {(data.commitTimePatterns.matrix[dow] || Array(24).fill(0)).map((cnt, hr) => {
                    const intensity = cnt / maxTimePattern;
                    const bg =
                      cnt === 0
                        ? "bg-foreground/10"
                        : intensity < 0.35
                        ? "bg-sky-500/35"
                        : intensity < 0.7
                        ? "bg-sky-500/65"
                        : "bg-sky-400";
                    return (
                      <div
                        key={hr}
                        title={`${dayLabel} ${String(hr).padStart(2, "0")}:00 — ${cnt} commit(s)`}
                        className={`h-3.5 rounded-[2px] ${bg}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-foreground/45 pl-9">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Deployments & Duration Trend */}
        <div className="rounded-xl border border-border/50 bg-foreground/5 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Rocket className="size-4 text-emerald-400" />
              <span>Deployment Duration Trend</span>
            </h4>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                {data.deployments.live} Live
              </span>
              <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400">
                {data.deployments.failed} Failed
              </span>
            </div>
          </div>
          <Chart
            data={depDurations}
            labels={depLabels}
            name="Duration"
            color="#10b981"
            formatValue={(v) => `${v} ms`}
          />
        </div>
      </div>
    </div>
  );
};
