"use client";

import * as React from "react";
import { FileCode, Plus, Minus, FilePlus2, FileDiff as FileDiffIcon, FileMinus2 } from "lucide-react";

export interface FileDiff {
  filePath: string;
  status: "ADDED" | "MODIFIED" | "DELETED" | string;
  additions: number;
  deletions: number;
  diffText: string;
}

export interface DiffViewerProps {
  files: FileDiff[];
}

export function DiffViewer({ files }: DiffViewerProps) {
  if (!files || files.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-mono text-foreground/50 border border-border/40 rounded-xl bg-foreground/5">
        No file changes detected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => {
        const lines = file.diffText ? file.diffText.split("\n") : [];

        return (
          <div
            key={file.filePath}
            className="rounded-xl border border-border/50 bg-foreground/5 overflow-hidden shadow-sm"
          >
            {/* File Diff Header */}
            <div className="p-3 bg-foreground/5 border-b border-border/40 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0">
                {file.status === "ADDED" && <FilePlus2 className="size-4 text-emerald-400 shrink-0" />}
                {file.status === "MODIFIED" && <FileDiffIcon className="size-4 text-amber-400 shrink-0" />}
                {file.status === "DELETED" && <FileMinus2 className="size-4 text-rose-400 shrink-0" />}

                <span className="font-semibold text-foreground truncate">{file.filePath}</span>

                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-sans font-semibold shrink-0 ${
                    file.status === "ADDED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : file.status === "DELETED"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {file.status}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {file.additions > 0 && (
                  <span className="inline-flex items-center text-emerald-400 font-semibold">
                    +{file.additions}
                  </span>
                )}
                {file.deletions > 0 && (
                  <span className="inline-flex items-center text-rose-400 font-semibold">
                    -{file.deletions}
                  </span>
                )}
              </div>
            </div>

            {/* Line-by-Line Unified Diff Display */}
            <div className="overflow-x-auto text-xs font-mono py-1 select-text bg-black/40">
              {lines.map((line, idx) => {
                if (!line && idx === lines.length - 1) return null;

                const isChunkHeader = line.startsWith("@@");
                const isAddition = line.startsWith("+");
                const isDeletion = line.startsWith("-");

                let rowBg = "hover:bg-foreground/5";
                let textCol = "text-foreground/80";
                let indicator = " ";

                if (isChunkHeader) {
                  rowBg = "bg-sky-500/10 text-sky-400 font-semibold py-1";
                  textCol = "text-sky-300";
                } else if (isAddition) {
                  rowBg = "bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-500";
                  indicator = "+";
                } else if (isDeletion) {
                  rowBg = "bg-rose-950/40 text-rose-200 border-l-2 border-rose-500";
                  indicator = "-";
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-start px-3 py-0.5 leading-relaxed font-mono ${rowBg}`}
                  >
                    {!isChunkHeader && (
                      <span className="w-5 shrink-0 text-foreground/30 select-none text-right pr-2">
                        {indicator}
                      </span>
                    )}
                    <span className={`flex-1 break-all whitespace-pre-wrap ${textCol}`}>
                      {line.startsWith("+") || line.startsWith("-") ? line.substring(1) : line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DiffViewer;
