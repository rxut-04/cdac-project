import React, { useState, useEffect } from "react";
import { Sparkles, Flame, Trophy } from "lucide-react";
import { BarsSpinner } from "@/components/bars-spinner";
import { api } from "@/lib/api";

interface ContributionData {
  username: string;
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  daily: Record<string, number>;
}

interface ContributionHeatmapProps {
  username?: string;
  onCreateRepo?: () => void;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  username,
  onCreateRepo,
}) => {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchContributions = (showLoader = false) => {
      if (showLoader) setLoading(true);
      // Prefer authenticated /user/contributions when token exists, fallback to /users/:username/contributions
      const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("token"));
      const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
      const baseUrl = hasToken
        ? "/user/contributions"
        : username
          ? `/users/${encodeURIComponent(username)}/contributions`
          : "/user/contributions";
      const url = `${baseUrl}?tz=${encodeURIComponent(tz || "UTC")}`;

      api.get<ContributionData>(url)
        .then((res) => {
          if (isMounted && res.data) {
            setData(res.data);
          }
        })
        .catch((err) => {
          console.debug("Contribution fetch error:", err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchContributions(true);
    const onFocus = () => fetchContributions(false);
    const onContribUpdated = () => fetchContributions(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("mygit:contributions-updated", onContribUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("mygit:contributions-updated", onContribUpdated);
    };
  }, [username]);

  // Generate 52 weeks (364 days) up to today
  const { weeks, monthLabels } = React.useMemo(() => {
    const today = new Date();
    // Normalize to end of today
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
    // Total days: 52 weeks = 364 days
    const totalDays = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1 - (6 - dayOfWeek)));

    const resultWeeks: Array<Array<{ date: string; count: number; dayOfWeek: number }>> = [];
    const months: Array<{ label: string; weekIndex: number }> = [];
    let currentWeek: Array<{ date: string; count: number; dayOfWeek: number }> = [];
    let lastMonth = -1;

    const cur = new Date(startDate);
    let weekIdx = 0;

    for (let i = 0; i < totalDays; i++) {
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, "0");
      const day = String(cur.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (cur.getMonth() !== lastMonth) {
        lastMonth = cur.getMonth();
        const monthName = cur.toLocaleString("default", { month: "short" });
        months.push({ label: monthName, weekIndex: weekIdx });
      }

      const count = data?.daily?.[dateStr] || 0;
      currentWeek.push({
        date: dateStr,
        count,
        dayOfWeek: cur.getDay(),
      });

      if (currentWeek.length === 7) {
        resultWeeks.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }

      cur.setDate(cur.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      resultWeeks.push(currentWeek);
    }

    if (months.length >= 2 && months[1].weekIndex - months[0].weekIndex <= 2) {
      months.shift();
    }

    return { weeks: resultWeeks, monthLabels: months };
  }, [data]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-zinc-800/40 border-zinc-700/30 hover:border-zinc-500";
    if (count <= 2) return "bg-emerald-950 border-emerald-800 text-emerald-300";
    if (count <= 5) return "bg-emerald-700 border-emerald-600 text-emerald-100";
    if (count <= 9) return "bg-emerald-500 border-emerald-400 text-white shadow-xs";
    return "bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.6)]";
  };

  const total = data?.totalCommits ?? 0;
  const streak = data?.currentStreak ?? 0;
  const longest = data?.longestStreak ?? 0;

  return (
    <div className="p-6 rounded-xl border border-border/50 bg-foreground/5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-400" />
            <span>Continuous Contribution Ledger</span>
          </h2>
          <p className="text-xs text-foreground/50 mt-0.5 font-mono flex items-center gap-2">
            {loading ? (
              <>
                <BarsSpinner size={13} />
                <span>Synchronizing verified commits from Neon DB...</span>
              </>
            ) : (
              `${total} verified byte-compatible commit${total === 1 ? "" : "s"} in the last year`
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              <Flame className="size-3.5" />
              <span>{streak} day streak</span>
            </div>
          )}
          {longest > 1 && (
            <div className="hidden md:flex items-center gap-1.5 text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-md border border-purple-400/20">
              <Trophy className="size-3.5" />
              <span>{longest} day best</span>
            </div>
          )}
          {onCreateRepo && (
            <button
              type="button"
              onClick={onCreateRepo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-foreground/10 text-foreground hover:bg-foreground/15 border border-border/50 transition-all"
            >
              <span>+ New Repository</span>
            </button>
          )}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="inline-flex flex-col gap-1.5 min-w-[740px]">
          {/* Months Header */}
          <div className="flex text-[10px] text-foreground/40 font-mono pl-6 h-3 relative">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${24 + m.weekIndex * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex items-start gap-2">
            {/* Days Column */}
            <div className="flex flex-col justify-between text-[9px] text-foreground/40 font-mono h-[86px] pr-1 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`size-2.5 rounded-[2px] border transition-all cursor-pointer ${getColorClass(
                        day.count
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Legend & Hover Tooltip */}
          <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-2 font-mono border-t border-border/30 mt-1">
            <div className="text-xs">
              {hoveredDay ? (
                <span className="text-emerald-400 font-semibold">
                  {hoveredDay.count} commit{hoveredDay.count === 1 ? "" : "s"} on {hoveredDay.date}
                </span>
              ) : (
                <span className="text-foreground/40">Hover over any square to inspect commit frequency</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="size-2.5 rounded-[2px] border bg-zinc-800/40 border-zinc-700/30" />
              <span className="size-2.5 rounded-[2px] border bg-emerald-950 border-emerald-800" />
              <span className="size-2.5 rounded-[2px] border bg-emerald-700 border-emerald-600" />
              <span className="size-2.5 rounded-[2px] border bg-emerald-500 border-emerald-400" />
              <span className="size-2.5 rounded-[2px] border bg-emerald-400 border-emerald-300" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
