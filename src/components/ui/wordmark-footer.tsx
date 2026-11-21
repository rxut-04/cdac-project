"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// at least 44 px tall wherever a finger taps it
const tap =
  "max-md:inline-flex max-md:min-h-11 max-md:items-center pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center";

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export interface WordmarkFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** The product name: the wordmark top left and the large name at the bottom. */
  name: string;
  /** The name in the © line. */
  legalName?: string;
  year: number;
  description?: string;
  email?: string;
  /** A short status line next to a green dot, such as "All systems normal". */
  status?: string;
  /** What screen readers call the footer navigation. */
  navLabel?: string;
  columns: FooterColumn[];
  /** A small link at the end of the bottom line. */
  credit?: { label: string; href: string };
}

/**
 * A footer with a short description, link columns that fold on phones, and the product name set large,
 * fading into the background.
 */
export function WordmarkFooter({
  name,
  legalName,
  year,
  description,
  email,
  status,
  navLabel = "Footer",
  columns,
  credit,
  className,
  ...props
}: WordmarkFooterProps) {
  return (
    <footer
      className={cn(
        "relative w-full overflow-hidden border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-md text-neutral-900 dark:text-neutral-100 transition-colors duration-300",
        className
      )}
      {...props}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 pt-16 pb-10 max-md:gap-8 max-md:pt-12 max-md:pb-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="font-black text-2xl tracking-tighter text-neutral-950 dark:text-white">
              {name}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#c8ff29]/20 text-neutral-900 dark:text-[#b8ff3c] border border-[#b8ff3c]/30">
              v0.1.0
            </span>
          </div>

          {description && (
            <p className="max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}

          {status && (
            <p className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 pt-2">
              <span className="size-2 rounded-full bg-[#b8ff3c] animate-pulse" aria-hidden="true" />
              {status}
            </p>
          )}
        </div>

        {/* Desktop link columns */}
        <nav
          aria-label={navLabel}
          className="grid grid-cols-2 gap-8 max-md:hidden md:col-span-7 md:col-start-6 lg:grid-cols-3"
        >
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-xs font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                {col.title}
              </p>
              <ul className="mt-4 grid gap-2.5 pointer-coarse:mt-2 pointer-coarse:gap-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className={cn(
                        "text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-950 dark:hover:text-[#b8ff3c]",
                        tap
                      )}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Mobile: Folding Accordion Columns */}
        <nav aria-label={navLabel} className="-mx-4 grid gap-1 md:hidden">
          {columns.map((col) => (
            <details
              key={col.title}
              className="group rounded-2xl open:bg-neutral-100/50 dark:open:bg-neutral-900/50"
            >
              <summary className="flex h-14 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-xs font-semibold tracking-wider text-neutral-700 dark:text-neutral-300 uppercase">
                  {col.title}
                </span>
                <Plus
                  className="size-4 text-neutral-500 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </summary>
              <ul className="px-4 pb-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="block py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 pb-6 text-xs text-neutral-500 dark:text-neutral-400 sm:flex-row sm:items-center sm:gap-6 md:px-10 border-t border-neutral-200/50 dark:border-neutral-800/50 pt-6">
        <p className="font-mono tabular-nums">
          © {year} {legalName ?? name}
        </p>
        {email && (
          <a
            href={`mailto:${email}`}
            className={cn("hover:text-neutral-950 dark:hover:text-white transition-colors", tap)}
          >
            {email}
          </a>
        )}
        {credit && (
          <a
            href={credit.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("hover:text-neutral-950 dark:hover:text-white transition-colors sm:ml-auto", tap)}
          >
            {credit.label}
          </a>
        )}
      </div>

      {/* Giant Wordmark Fading into the Background */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.2em] text-center text-[clamp(64px,24vw,340px)] font-black leading-[0.85] tracking-tighter text-transparent select-none bg-linear-to-b from-neutral-950/[0.14] to-transparent dark:from-white/[0.09] dark:to-transparent bg-clip-text max-md:text-[24vw] overflow-hidden"
      >
        {name}
      </p>
    </footer>
  );
}

export default WordmarkFooter;
