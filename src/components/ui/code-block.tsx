"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import {
  type ThemedToken,
  type HighlighterCore,
  type GrammarState,
  type ThemeRegistration,
} from "shiki/core";
import { Icon, IconNode, createIcon } from "@/components/ui/file-tree";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export interface CodeBlockOptions {
  /** Line numbers in a sticky gutter. */
  showLineNumbers?: boolean;
  /** Number of the first line, for excerpts. Defaults to 1. */
  startLine?: number;
  /** Lines to mark, by number: `[3, 4]` or `"3-4,9"`. Counted from `startLine`. */
  highlightLines?: number[] | string;
  /** Wrap long lines. Horizontal scroll is the default. */
  wrap?: boolean;
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /**
   * Blocks longer than this collapse behind "Show N more lines". Blocks that stream in never
   * collapse, so the reader never loses their place. `false` turns it off. Defaults to 24.
   */
  collapseAfter?: number | false;
}

export interface CodeBlockProps
  extends CodeBlockOptions,
    Omit<React.ComponentProps<"figure">, "children"> {
  code: string;
  /** Fence language: `tsx`, `bash`, `python`. Aliases such as `ts` and `sh` resolve. */
  language?: string;
  /** Shown instead of the language in the header. */
  filename?: string;
  /** True while the model is writing this block: highlights incrementally and shows the caret. */
  streaming?: boolean;
  /** Extra header actions, placed before Copy. */
  actions?: React.ReactNode;
  /** Hide the header row (language, wrap and copy). */
  hideHeader?: boolean;
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const set = React.useCallback(
    (next: T) => {
      if (value === undefined) setInner(next);
      onChange?.(next);
    },
    [value, onChange]
  );
  return [current, set] as const;
}

/* -------------------------------------------------------------------------------------------------
 * Languages
 * -----------------------------------------------------------------------------------------------*/

const ALIASES: Record<string, string> = {
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  shellsession: "bash",
  py: "python",
  rb: "ruby",
  rs: "rust",
  golang: "go",
  yml: "yaml",
  md: "markdown",
  mdx: "mdx",
  "c++": "cpp",
  cs: "csharp",
  "c#": "csharp",
  kt: "kotlin",
  ps1: "powershell",
  dockerfile: "docker",
  tf: "hcl",
  jsonc: "jsonc",
  plaintext: "text",
  txt: "text",
  plain: "text",
};

function resolveLanguage(lang?: string | null): string {
  const id = (lang ?? "").trim().toLowerCase();
  if (!id) return "text";
  return ALIASES[id] ?? id;
}

const LABELS: Record<string, string> = {
  typescript: "TypeScript",
  tsx: "TSX",
  javascript: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  jsonc: "JSON",
  bash: "Bash",
  python: "Python",
  rust: "Rust",
  go: "Go",
  ruby: "Ruby",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sql: "SQL",
  yaml: "YAML",
  toml: "TOML",
  markdown: "Markdown",
  mdx: "MDX",
  diff: "Diff",
  docker: "Dockerfile",
  graphql: "GraphQL",
  swift: "Swift",
  kotlin: "Kotlin",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  php: "PHP",
  powershell: "PowerShell",
  hcl: "HCL",
  prisma: "Prisma",
  vue: "Vue",
  svelte: "Svelte",
  text: "Plain text",
};

function languageLabel(lang?: string | null): string {
  const id = resolveLanguage(lang);
  return LABELS[id] ?? id;
}

/* -------------------------------------------------------------------------------------------------
 * Frame and header
 * -----------------------------------------------------------------------------------------------*/

function CodeBlockFrame({ className, ...props }: React.ComponentProps<"figure">) {
  return (
    <figure
      data-slot="code-block"
      className={cn(
        "group/code-block rounded-(--chatcn-radius-lg) bg-(color:--chatcn-bg-subtle) shadow-(--chatcn-shadow-border) relative isolate overflow-clip",
        "text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg) forced-colors:outline-1 forced-colors:outline-solid",
        className
      )}
      {...props}
    />
  );
}

function useStuck(ref: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const header = ref.current;
    const frame = header?.parentElement?.closest("[data-slot=code-block]");
    if (!header || !frame || typeof IntersectionObserver === "undefined") return;
    let frameId = 0;
    const check = () => {
      frameId = 0;
      const offset = header.getBoundingClientRect().top - frame.getBoundingClientRect().top;
      header.toggleAttribute("data-stuck", offset > 1);
    };
    const onScroll = () => {
      frameId ||= requestAnimationFrame(check);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        document.addEventListener("scroll", onScroll, { capture: true, passive: true });
        check();
      } else {
        document.removeEventListener("scroll", onScroll, { capture: true });
        header.removeAttribute("data-stuck");
      }
    });
    observer.observe(frame);
    return () => {
      observer.disconnect();
      document.removeEventListener("scroll", onScroll, { capture: true });
      cancelAnimationFrame(frameId);
    };
  }, [ref]);
}

function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null);
  useStuck(ref);
  return (
    <div
      ref={ref}
      data-slot="code-block-header"
      className={cn(
        "bg-(color:--chatcn-bg-subtle) sticky top-(--chatcn-code-sticky-top,0px) z-10 flex h-9 min-w-0 items-center gap-2 ps-3.5 pe-1.5",
        "data-[stuck]:shadow-[0_1px_0_var(--chatcn-border)]",
        className
      )}
      {...props}
    />
  );
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  shortcut?: React.ReactNode;
}

export function Tooltip({ content, children, side = "top", align = "center", shortcut }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} align={align} sideOffset={6} className="z-50">
          <TooltipPrimitive.Popup
            data-slot="tooltip"
            className={cn(
              "rounded-(--chatcn-radius-sm) bg-(color:--chatcn-fg) text-[0.75rem]/[1rem] text-(color:--chatcn-bg) shadow-(--chatcn-shadow-md) flex max-w-xs origin-(--transform-origin) items-center gap-2 px-2 py-1 font-medium text-pretty",
              "ease-(--chatcn-ease-out) transition-[opacity,scale] duration-125",
              "data-[ending-style]:scale-97 data-[ending-style]:opacity-0 data-[ending-style]:duration-100 data-[starting-style]:scale-97 data-[starting-style]:opacity-0",
              "data-[instant]:transition-none motion-reduce:transition-opacity motion-reduce:data-[ending-style]:scale-100 motion-reduce:data-[starting-style]:scale-100"
            )}
          >
            {content}
            {shortcut ? <span className="font-normal opacity-60">{shortcut}</span> : null}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export type ButtonVariant = "solid" | "outline" | "ghost" | "subtle";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg";

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base = cn(
  "chatcn-focus inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none",
  "ease-(--chatcn-ease-standard) transition-[background-color,color,box-shadow,scale] duration-150",
  "active:scale-(--chatcn-press-scale) active:duration-100 disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0"
);

const variants: Record<ButtonVariant, string> = {
  solid: "bg-(color:--chatcn-primary) text-(color:--chatcn-primary-fg) hover:bg-(color:--chatcn-primary-hover)",
  outline: "bg-(color:--chatcn-card) text-(color:--chatcn-fg) shadow-(--chatcn-shadow-xs) hover:bg-(color:--chatcn-fill-hover)",
  ghost: "text-(color:--chatcn-fg-muted) hover:bg-(color:--chatcn-fill-hover) hover:text-(color:--chatcn-fg)",
  subtle: "bg-(color:--chatcn-fill) text-(color:--chatcn-fg) hover:bg-(color:--chatcn-fill-hover)",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-6 rounded-(--chatcn-radius-sm) px-2 text-[0.75rem]/[1rem] [&_svg]:size-3.5",
  sm: "h-7 rounded-(--chatcn-radius-sm) px-2.5 text-[0.8125rem]/[1.25rem] [&_svg]:size-3.5",
  md: "h-8 rounded-(--chatcn-radius-md) px-3 text-[0.875rem]/[1.25rem] tracking-[-0.003em] [&_svg]:size-4",
  lg: "h-9 rounded-(--chatcn-radius-md) px-3.5 text-[0.875rem]/[1.25rem] tracking-[-0.003em] [&_svg]:size-4",
  "icon-xs": "size-6 rounded-(--chatcn-radius-sm) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-3.5",
  "icon-sm": "size-7 rounded-(--chatcn-radius-sm) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-3.5",
  "icon-md": "size-8 rounded-(--chatcn-radius-md) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-4",
  "icon-lg": "size-9 rounded-(--chatcn-radius-md) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-4",
};

export function buttonVariants({
  variant = "ghost",
  size = "md",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}) {
  return cn(base, variants[variant], sizes[size]);
}

export function Button({
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

const iconNodeWrap: IconNode = [
  ["path", { d: "M3 6h18" }],
  ["path", { d: "M3 12h15a3 3 0 0 1 0 6h-1.5" }],
  ["path", { d: "m15 15.5-1.62 1.62a1.25 1.25 0 0 0 0 1.76L15 20.5" }],
  ["path", { d: "M3 18h5.5" }],
];

const WrapTextIcon: Icon = /* @__PURE__ */ createIcon("wrap-text", iconNodeWrap);

export function WrapToggle({ wrap, onChange }: { wrap: boolean; onChange: (wrap: boolean) => void }) {
  return (
    <Tooltip content={wrap ? "Scroll long lines" : "Wrap long lines"}>
      <Button
        size="icon-sm"
        aria-label="Wrap lines"
        aria-pressed={wrap}
        onClick={() => onChange(!wrap)}
        className={cn(wrap && "bg-(color:--chatcn-fill-active) text-(color:--chatcn-fg)")}
      >
        <WrapTextIcon />
      </Button>
    </Tooltip>
  );
}

export interface CopyButtonProps extends Omit<ButtonProps, "value" | "onCopy"> {
  value: string | (() => string);
  label?: string;
  onCopy?: (value: string) => void;
}

const iconNodeCopy: IconNode = [
  ["path", { d: "M11.5 9h7a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 9 18.5v-7A2.5 2.5 0 0 1 11.5 9" }],
  ["path", { d: "M6 15h-.5A2.5 2.5 0 0 1 3 12.5v-7A2.5 2.5 0 0 1 5.5 3h7A2.5 2.5 0 0 1 15 5.5V6" }],
];

const CopyIcon: Icon = /* @__PURE__ */ createIcon("copy", iconNodeCopy);

const iconNodeCheck: IconNode = [
  ["path", { d: "m4.5 12.75 3.23 3.23a2.5 2.5 0 0 0 3.54 0l8.48-8.48" }],
];

const CheckIcon: Icon = /* @__PURE__ */ createIcon("check", iconNodeCheck);

export function CopyButton({
  value,
  label = "Copy",
  onCopy,
  onClick,
  children,
  size = "icon-sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copies, setCopies] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copies) return;
    setCopied(true);
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copies]);

  const layer = cn(
    "ease-(--chatcn-ease-out) absolute transition-[opacity,scale,filter] duration-150",
    "motion-reduce:scale-100 motion-reduce:blur-none motion-reduce:transition-opacity"
  );
  return (
    <Button
      {...props}
      size={size}
      aria-label={children ? undefined : copied ? "Copied" : label}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const text = typeof value === "function" ? value() : value;
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopies((n) => n + 1);
            onCopy?.(text);
          })
          .catch(() => {});
      }}
      className={cn("relative", className)}
    >
      {children ? (
        <>
          <span className="relative grid size-3.5 place-items-center">
            <CopyIcon
              className={cn(
                layer,
                copied ? "scale-75 opacity-0 blur-[2px]" : "scale-100 opacity-100"
              )}
            />
            <CheckIcon
              className={cn(
                layer,
                copied ? "scale-100 opacity-100" : "scale-75 opacity-0 blur-[2px]"
              )}
            />
          </span>
          {children}
        </>
      ) : (
        <>
          <CopyIcon
            className={cn(
              layer,
              copied ? "scale-75 opacity-0 blur-[2px]" : "scale-100 opacity-100"
            )}
          />
          <CheckIcon
            className={cn(
              layer,
              copied ? "scale-100 opacity-100" : "scale-75 opacity-0 blur-[2px]"
            )}
          />
        </>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Shiki Highlight Engine
 * -----------------------------------------------------------------------------------------------*/

type ChatcnTokenRole =
  | "plain"
  | "keyword"
  | "comment"
  | "string"
  | "constant"
  | "function"
  | "type"
  | "tag"
  | "attribute"
  | "punctuation";

interface ChatcnToken {
  content: string;
  role: ChatcnTokenRole;
}

type ChatcnTokenLine = ChatcnToken[];

interface UseChatcnHighlightResult {
  lines: ChatcnTokenLine[];
  highlighted: boolean;
}

const PLAIN = new Set(["text", "txt", "plain", "plaintext", "ansi", "log", "output"]);
let ready: HighlighterCore | undefined;
const loaded = new Set<string>();

function isLanguageReady(lang?: string | null) {
  const id = resolveLanguage(lang);
  return PLAIN.has(id) || (ready !== undefined && loaded.has(id));
}

const missing = new Set<string>();
const pending = new Map<string, Promise<boolean>>();
let core: Promise<HighlighterCore> | undefined;

const role = (name: ChatcnTokenRole) => `var(--chatcn-code-${name})`;

const chatcnTheme: ThemeRegistration = {
  name: "chatcn",
  type: "light",
  colors: { "editor.foreground": role("plain"), "editor.background": "transparent" },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment", "string.quoted.docstring"],
      settings: { foreground: role("comment") },
    },
    {
      scope: ["string", "string.template", "string.regexp", "markup.inline.raw", "markup.fenced_code"],
      settings: { foreground: role("string") },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character", "constant.other", "support.constant", "variable.other.enummember"],
      settings: { foreground: role("constant") },
    },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "variable.language", "markup.heading", "markup.bold"],
      settings: { foreground: role("keyword") },
    },
    {
      scope: ["keyword.operator", "keyword.operator.assignment", "keyword.operator.arithmetic", "storage.type.function.arrow"],
      settings: { foreground: role("punctuation") },
    },
    {
      scope: ["keyword.operator.new", "keyword.operator.expression", "keyword.operator.logical.python", "keyword.operator.typeof", "keyword.operator.instanceof"],
      settings: { foreground: role("keyword") },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function", "entity.name.method"],
      settings: { foreground: role("function") },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "entity.other.inherited-class", "support.type", "support.class", "meta.type.annotation", "entity.name.namespace"],
      settings: { foreground: role("type") },
    },
    {
      scope: ["entity.name.tag", "support.class.component", "meta.tag.sgml"],
      settings: { foreground: role("tag") },
    },
    {
      scope: ["entity.other.attribute-name", "meta.object-literal.key", "variable.other.property", "variable.parameter"],
      settings: { foreground: role("attribute") },
    },
    {
      scope: ["punctuation", "meta.brace", "punctuation.definition.tag", "punctuation.separator", "punctuation.terminator", "punctuation.accessor", "meta.delimiter"],
      settings: { foreground: role("punctuation") },
    },
    {
      scope: ["support.type.property-name", "meta.mapping.key", "string.unquoted.argument"],
      settings: { foreground: role("plain") },
    },
    {
      scope: ["punctuation.definition.string", "punctuation.definition.template-expression"],
      settings: { foreground: role("string") },
    },
    {
      scope: ["markup.deleted", "markup.inserted", "markup.changed"],
      settings: { foreground: role("plain") },
    },
  ],
};

function getCore() {
  core ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
    const highlighter = await createHighlighterCore({
      themes: [chatcnTheme],
      langs: [],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    });
    ready = highlighter;
    return highlighter;
  })();
  return core;
}

function loadLanguage(lang?: string | null): Promise<boolean> {
  const id = resolveLanguage(lang);
  if (PLAIN.has(id) || missing.has(id)) return Promise.resolve(false);
  if (loaded.has(id) && ready) return Promise.resolve(true);
  const existing = pending.get(id);
  if (existing) return existing;
  const task = (async () => {
    try {
      const [highlighter, { bundledLanguages, bundledLanguagesAlias }] = await Promise.all([
        getCore(),
        import("shiki/langs"),
      ]);
      const input =
        (bundledLanguages as Record<string, unknown>)[id] ??
        (bundledLanguagesAlias as Record<string, unknown>)[id];
      if (!input) {
        missing.add(id);
        return false;
      }
      await highlighter.loadLanguage(input as Parameters<HighlighterCore["loadLanguage"]>[0]);
      loaded.add(id);
      return true;
    } catch {
      missing.add(id);
      return false;
    } finally {
      pending.delete(id);
    }
  })();
  pending.set(id, task);
  return task;
}

function plainLines(code: string): ChatcnTokenLine[] {
  return code.split("\n").map((content) => (content ? [{ content, role: "plain" as const }] : []));
}

const ROLE = /--chatcn-code-([a-z]+)/;

function toLine(tokens: ThemedToken[] | undefined): ChatcnTokenLine {
  const line: ChatcnTokenLine = [];
  for (const token of tokens ?? []) {
    const match = token.color ? ROLE.exec(token.color) : null;
    const tokenRole = (match?.[1] as ChatcnTokenRole | undefined) ?? "plain";
    const last = line.at(-1);
    if (last && last.role === tokenRole) last.content += token.content;
    else line.push({ content: token.content, role: tokenRole });
  }
  return line;
}

function tokenize(code: string, lang?: string | null): ChatcnTokenLine[] | null {
  const id = resolveLanguage(lang);
  if (PLAIN.has(id) || missing.has(id)) return plainLines(code);
  if (!ready || !loaded.has(id)) return null;
  try {
    return ready.codeToTokens(code, { lang: id, theme: "chatcn" }).tokens.map(toLine);
  } catch {
    return plainLines(code);
  }
}

function useChatcnHighlight(
  code: string,
  language?: string
): UseChatcnHighlightResult {
  const lang = resolveLanguage(language);
  const [, setVersion] = React.useState(0);
  const isReady = isLanguageReady(lang);

  React.useEffect(() => {
    if (isReady) return;
    let alive = true;
    void loadLanguage(lang).then(() => {
      if (alive) setVersion((v) => v + 1);
    });
    return () => {
      alive = false;
    };
  }, [lang, isReady]);

  return React.useMemo(() => {
    const lines = tokenize(code, lang);
    if (lines) return { lines, highlighted: isReady };
    return { lines: plainLines(code), highlighted: false };
  }, [code, lang, isReady]);
}

function parseLineRanges(value: number[] | string | undefined): Set<number> {
  const out = new Set<number>();
  if (!value) return out;
  if (Array.isArray(value)) {
    for (const n of value) out.add(n);
    return out;
  }
  for (const part of value.split(",")) {
    const [a, b] = part.split("-").map((s) => Number.parseInt(s.trim(), 10));
    if (a === undefined || Number.isNaN(a)) continue;
    const end = b === undefined || Number.isNaN(b) ? a : b;
    for (let n = Math.min(a, end); n <= Math.max(a, end); n++) out.add(n);
  }
  return out;
}

const chatcnTokenClass: Record<ChatcnTokenRole, string> = {
  plain: "text-(color:--chatcn-syntax-plain)",
  keyword: "text-(color:--chatcn-syntax-keyword)",
  comment: "text-(color:--chatcn-syntax-comment)",
  string: "text-(color:--chatcn-syntax-string)",
  constant: "text-(color:--chatcn-syntax-constant)",
  function: "text-(color:--chatcn-syntax-function)",
  type: "text-(color:--chatcn-syntax-type)",
  tag: "text-(color:--chatcn-syntax-tag)",
  attribute: "text-(color:--chatcn-syntax-attribute)",
  punctuation: "text-(color:--chatcn-syntax-punctuation)",
};

interface LineProps {
  tokens: ChatcnTokenLine;
  number: number;
  numbered: boolean;
  marked: boolean;
  caret: boolean;
  diff?: "add" | "del";
}

const Line = React.memo(
  function Line({ tokens, number, numbered, marked, diff }: LineProps) {
    return (
      <span
        data-line={number}
        data-highlighted={marked ? "" : undefined}
        data-diff={diff}
        className={cn(
          "flex min-h-5 bg-inherit",
          (diff || marked) && "bg-[linear-gradient(var(--row),var(--row))]",
          diff === "add" && "[&_span]:text-(color:--chatcn-diff-add-fg) [--row:var(--chatcn-diff-add-bg)]",
          diff === "del" && "[&_span]:text-(color:--chatcn-diff-del-fg) [--row:var(--chatcn-diff-del-bg)]",
          marked && "shadow-[inset_2px_0_0_var(--chatcn-fg-subtle)] [--row:var(--chatcn-fill)]"
        )}
      >
        {numbered ? (
          <span
            aria-hidden="true"
            className={cn(
              "sticky start-0 shrink-0 bg-inherit [background-image:inherit] ps-4 pe-4 text-end tabular-nums [box-shadow:inherit] select-none",
              "w-[calc(var(--chatcn-code-digits)*1ch+2rem)]",
              marked ? "text-(color:--chatcn-fg-muted)" : "text-(color:--chatcn-fg-subtle)"
            )}
          >
            {number}
          </span>
        ) : null}
        <span className={cn("min-w-0 flex-1 pe-4", !numbered && "ps-4")}>
          {tokens.map((token, i) => (
            <span key={i} className={chatcnTokenClass[token.role]}>
              {token.content}
            </span>
          ))}
        </span>
      </span>
    );
  }
);

function diffKind(tokens: ChatcnTokenLine): LineProps["diff"] {
  const text = tokens.map((t) => t.content).join("");
  if (text.startsWith("+") && !text.startsWith("+++")) return "add";
  if (text.startsWith("-") && !text.startsWith("---")) return "del";
  return undefined;
}

const iconNodeChevronDown: IconNode = [
  ["path", { d: "m6 9.25 4.23 4.23a2.5 2.5 0 0 0 3.54 0L18 9.25" }],
];

const ChevronDownIcon: Icon = /* @__PURE__ */ createIcon("chevron-down", iconNodeChevronDown);

const iconNodeChevronUp: IconNode = [
  ["path", { d: "m18 14.75-4.23-4.23a2.5 2.5 0 0 0-3.54 0L6 14.75" }],
];

const ChevronUpIcon: Icon = /* @__PURE__ */ createIcon("chevron-up", iconNodeChevronUp);

interface CodeBlockBodyProps extends CodeBlockOptions {
  code: string;
  language?: string;
  streaming?: boolean;
  wrap: boolean;
  label: string;
}

function CodeBlockBody({
  code,
  language,
  wrap,
  label,
  showLineNumbers = true,
  startLine = 1,
  highlightLines,
  collapseAfter = 30,
}: CodeBlockBodyProps) {
  const source = code.endsWith("\n") ? code.slice(0, -1) : code;
  const { lines } = useChatcnHighlight(source, language);
  const marked = React.useMemo(() => parseLineRanges(highlightLines), [highlightLines]);

  const limit = collapseAfter === false ? Number.POSITIVE_INFINITY : collapseAfter;
  const collapsible = lines.length > limit + 3;
  const [expanded, setExpanded] = React.useState(false);
  const collapsed = collapsible && !expanded;
  const visible = collapsed ? lines.slice(0, limit) : lines;
  const hidden = lines.length - visible.length;
  const lastNumber = startLine + lines.length - 1;
  const isDiff = language !== undefined && /^(diff|patch)$/i.test(language);

  return (
    <div data-slot="code-block-body" className="relative bg-inherit">
      <section aria-label={`${label} code`} className="bg-inherit">
        <pre
          dir="ltr"
          tabIndex={0}
          data-wrap={wrap ? "" : undefined}
          className={cn(
            "chatcn-scroll overflow-x-auto overscroll-x-contain bg-inherit pt-2 pb-4 font-mono text-[0.8125rem]/[1.35rem] outline-none",
            wrap ? "[overflow-wrap:anywhere] break-words whitespace-pre-wrap" : "whitespace-pre"
          )}
          style={{ "--chatcn-code-digits": String(lastNumber).length } as React.CSSProperties}
        >
          <code className={cn("flex min-w-full flex-col bg-inherit", !wrap && "w-max")}>
            {visible.map((tokens, i) => (
              <Line
                key={i}
                tokens={tokens}
                number={startLine + i}
                numbered={showLineNumbers}
                marked={marked.has(startLine + i)}
                caret={false}
                diff={isDiff ? diffKind(tokens) : undefined}
              />
            ))}
          </code>
        </pre>
      </section>
      {collapsible ? (
        <div
          className={cn(
            "flex justify-center pb-2.5",
            collapsed ? "absolute inset-x-0 bottom-0" : "pt-1"
          )}
        >
          <Button
            size="xs"
            variant="outline"
            aria-expanded={!collapsed}
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full ps-2.5 pe-2"
          >
            {collapsed ? (
              <>
                Show {hidden} more {hidden === 1 ? "line" : "lines"}
                <ChevronDownIcon />
              </>
            ) : (
              <>
                Show fewer lines
                <ChevronUpIcon />
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CodeBlock
 * -----------------------------------------------------------------------------------------------*/

export function CodeBlock({
  code,
  language,
  filename,
  streaming = false,
  actions,
  hideHeader = false,
  wrap: wrapProp,
  defaultWrap = false,
  onWrapChange,
  showLineNumbers = true,
  startLine,
  highlightLines,
  collapseAfter = 30,
  className,
  ...props
}: CodeBlockProps) {
  const [wrap, setWrap] = useControllable(wrapProp, defaultWrap, onWrapChange);
  const label = languageLabel(language);

  return (
    <CodeBlockFrame
      data-language={language}
      data-streaming={streaming ? "" : undefined}
      aria-busy={streaming || undefined}
      className={className}
      {...props}
    >
      {hideHeader ? null : (
        <CodeBlockHeader>
          <figcaption
            className={cn(
              "min-w-0 flex-1 truncate",
              filename
                ? "text-[0.75rem]/[1rem] text-(color:--chatcn-fg-muted) font-mono"
                : "text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle)"
            )}
          >
            {filename ?? label}
          </figcaption>
          <div className="flex shrink-0 items-center gap-0.5">
            {actions}
            <WrapToggle wrap={wrap} onChange={setWrap} />
            <CopyButton value={code.replace(/\n$/, "")} label="Copy code" />
          </div>
        </CodeBlockHeader>
      )}
      <CodeBlockBody
        code={code}
        language={language}
        streaming={streaming}
        wrap={wrap}
        label={filename ?? label}
        showLineNumbers={showLineNumbers}
        startLine={startLine}
        highlightLines={highlightLines}
        collapseAfter={collapseAfter}
      />
    </CodeBlockFrame>
  );
}

export default CodeBlock;
