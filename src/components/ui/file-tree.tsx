"use client"

// From chatcn, chat, voice and agent UI for shadcn: https://chatcn.dev

import * as React from "react"
import { forwardRef, createElement, type SVGAttributes, type ForwardRefExoticComponent, type RefAttributes } from "react"
import { cn } from "@/lib/utils"
import { useVirtualizer } from "@tanstack/react-virtual"

/** chatcn theme variables and utilities this file uses, light and dark. */
const CHATCN_CSS = ":root{--chatcn-accent:var(--chatcn-gray-1000);--chatcn-alpha-500:oklch(0 0 0 / 0.14);--chatcn-alpha-600:oklch(0 0 0 / 0.2);--chatcn-amber:oklch(0.555 0.125 60);--chatcn-bg:oklch(1 0 0);--chatcn-bg-subtle:oklch(0.985 0 0);--chatcn-blue:oklch(0.550 0.180 258);--chatcn-border:var(--chatcn-gray-400);--chatcn-border-strong:var(--chatcn-gray-600);--chatcn-card:oklch(1 0 0);--chatcn-diff-add-bg:oklch(0.720 0.170 150 / 0.13);--chatcn-diff-add-fg:oklch(0.500 0.130 150);--chatcn-diff-del-bg:oklch(0.660 0.200 25 / 0.10);--chatcn-diff-del-fg:oklch(0.540 0.200 27);--chatcn-ease-out:cubic-bezier(0.23, 1, 0.32, 1);--chatcn-ease-standard:ease;--chatcn-fg:var(--chatcn-gray-1000);--chatcn-fg-faint:var(--chatcn-gray-700);--chatcn-fg-muted:var(--chatcn-gray-900);--chatcn-fg-subtle:var(--chatcn-gray-800);--chatcn-fill:var(--chatcn-gray-100);--chatcn-fill-active:var(--chatcn-gray-300);--chatcn-fill-hover:var(--chatcn-gray-200);--chatcn-gray-100:oklch(0.970 0 0);--chatcn-gray-1000:oklch(0.145 0 0);--chatcn-gray-200:oklch(0.950 0 0);--chatcn-gray-300:oklch(0.930 0 0);--chatcn-gray-400:oklch(0.910 0 0);--chatcn-gray-600:oklch(0.800 0 0);--chatcn-gray-700:oklch(0.700 0 0);--chatcn-gray-800:oklch(0.525 0 0);--chatcn-gray-900:oklch(0.440 0 0);--chatcn-press-scale:0.97;--chatcn-press-scale-icon:0.94;--chatcn-primary:var(--chatcn-gray-1000);--chatcn-primary-fg:var(--chatcn-bg);--chatcn-primary-hover:var(--chatcn-gray-900);--chatcn-radius-lg:12px;--chatcn-radius-md:8px;--chatcn-radius-sm:6px;--chatcn-radius-xs:4px;--chatcn-scrollbar:var(--chatcn-alpha-500);--chatcn-scrollbar-hover:var(--chatcn-alpha-600);--chatcn-shadow-border:0 0 0 1px oklch(0 0 0 / 0.08);--chatcn-shadow-md:0 0 0 1px oklch(0 0 0 / 0.06), 0 2px 4px -1px oklch(0 0 0 / 0.06), 0 8px 16px -4px oklch(0 0 0 / 0.08);--chatcn-shadow-sm:0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04);--chatcn-shadow-xs:0 0 0 1px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.04);--chatcn-syntax-attribute:var(--chatcn-syntax-constant);--chatcn-syntax-comment:oklch(0.525 0 0);--chatcn-syntax-constant:oklch(0.480 0.160 255);--chatcn-syntax-function:oklch(0.500 0.200 300);--chatcn-syntax-keyword:oklch(0.540 0.190 25);--chatcn-syntax-plain:var(--chatcn-fg);--chatcn-syntax-punctuation:var(--chatcn-fg-muted);--chatcn-syntax-string:oklch(0.400 0.120 255);--chatcn-syntax-tag:oklch(0.480 0.120 150);--chatcn-syntax-type:oklch(0.500 0.120 55)}.dark{--chatcn-accent:var(--chatcn-gray-1000);--chatcn-alpha-500:oklch(1 0 0 / 0.16);--chatcn-alpha-600:oklch(1 0 0 / 0.24);--chatcn-amber:oklch(0.800 0.140 74);--chatcn-bg:oklch(0.145 0 0);--chatcn-bg-subtle:oklch(0.178 0 0);--chatcn-blue:oklch(0.710 0.140 252);--chatcn-border:var(--chatcn-gray-400);--chatcn-border-strong:var(--chatcn-gray-600);--chatcn-card:oklch(0.175 0 0);--chatcn-diff-add-bg:oklch(0.700 0.160 152 / 0.12);--chatcn-diff-add-fg:oklch(0.780 0.150 152);--chatcn-diff-del-bg:oklch(0.640 0.190 22 / 0.13);--chatcn-diff-del-fg:oklch(0.740 0.160 22);--chatcn-fg:var(--chatcn-gray-1000);--chatcn-fg-faint:var(--chatcn-gray-700);--chatcn-fg-muted:var(--chatcn-gray-900);--chatcn-fg-subtle:var(--chatcn-gray-800);--chatcn-fill:var(--chatcn-gray-100);--chatcn-fill-active:var(--chatcn-gray-300);--chatcn-fill-hover:var(--chatcn-gray-200);--chatcn-gray-100:oklch(0.195 0 0);--chatcn-gray-1000:oklch(0.970 0 0);--chatcn-gray-200:oklch(0.225 0 0);--chatcn-gray-300:oklch(0.255 0 0);--chatcn-gray-400:oklch(0.285 0 0);--chatcn-gray-600:oklch(0.410 0 0);--chatcn-gray-700:oklch(0.500 0 0);--chatcn-gray-800:oklch(0.620 0 0);--chatcn-gray-900:oklch(0.720 0 0);--chatcn-primary:var(--chatcn-gray-1000);--chatcn-primary-fg:var(--chatcn-bg);--chatcn-primary-hover:var(--chatcn-gray-900);--chatcn-scrollbar:var(--chatcn-alpha-500);--chatcn-scrollbar-hover:var(--chatcn-alpha-600);--chatcn-shadow-border:0 0 0 1px oklch(1 0 0 / 0.08);--chatcn-shadow-md:0 0 0 1px oklch(1 0 0 / 0.09), inset 0 1px 0 oklch(1 0 0 / 0.04), 0 8px 16px -4px oklch(0 0 0 / 0.5);--chatcn-shadow-sm:0 0 0 1px oklch(1 0 0 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.03), 0 2px 4px oklch(0 0 0 / 0.4);--chatcn-shadow-xs:0 0 0 1px oklch(1 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.4);--chatcn-syntax-attribute:var(--chatcn-syntax-constant);--chatcn-syntax-comment:oklch(0.620 0 0);--chatcn-syntax-constant:oklch(0.790 0.120 245);--chatcn-syntax-function:oklch(0.800 0.120 300);--chatcn-syntax-keyword:oklch(0.740 0.150 22);--chatcn-syntax-plain:var(--chatcn-fg);--chatcn-syntax-punctuation:var(--chatcn-fg-muted);--chatcn-syntax-string:oklch(0.830 0.080 240);--chatcn-syntax-tag:oklch(0.800 0.130 150);--chatcn-syntax-type:oklch(0.800 0.110 65)}.chatcn-focus{}.chatcn-focus:focus-visible{outline: 2px solid var(--chatcn-accent); outline-offset: 2px;}.chatcn-scroll{scrollbar-width: thin; scrollbar-color: var(--chatcn-scrollbar) transparent;}.chatcn-scroll:hover{scrollbar-color: var(--chatcn-scrollbar-hover) transparent;}.chatcn-scroll::-webkit-scrollbar{width: 10px; height: 10px;}.chatcn-scroll::-webkit-scrollbar-track, .chatcn-scroll::-webkit-scrollbar-corner{background: transparent;}.chatcn-scroll::-webkit-scrollbar-thumb{background-color: var(--chatcn-scrollbar); background-clip: content-box; border: 3px solid transparent; border-radius: 9999px;}.chatcn-scroll::-webkit-scrollbar-thumb:hover{background-color: var(--chatcn-scrollbar-hover);}.chatcn-scroll-fade{}@supports (animation-timeline: scroll()){.chatcn-scroll-fade{mask-size: 100% calc(100% + 24px); mask-repeat: no-repeat; animation: chatcn-scroll-fade linear both; animation-timeline: scroll(self); animation-range: 0 48px;}}@keyframes chatcn-scroll-fade { from { mask-image: linear-gradient(to bottom, transparent, #000 24px); mask-position: 0 -24px; } to { mask-image: linear-gradient(to bottom, transparent, #000 24px); mask-position: 0 0; } }@media (prefers-reduced-motion: reduce){:root{--chatcn-press-scale:1;--chatcn-press-scale-icon:1;--chatcn-enter-scale:1}}"
if (typeof document !== "undefined" && !document.getElementById("chatcn-file-tree")) {
  const style = document.createElement("style")
  style.id = "chatcn-file-tree"
  style.textContent = CHATCN_CSS
  document.head.appendChild(style)
}

const LOCK = /(\.lock$|-lock\.(json|yaml)$|^bun\.lockb?$|^go\.sum$)/i

interface IconProps extends SVGAttributes<SVGSVGElement> {
  /** Width and height. Number means px. Default 24. */
  size?: number | string
  /** Stroke width in viewBox units (24 grid). Default 1.5. */
  strokeWidth?: number | string
  /** Keep the rendered stroke at `strokeWidth` px at any size. */
  absoluteStrokeWidth?: boolean
  /** Stroke color. Default currentColor. */
  color?: string
  /** Accessible name. Renders <title> and sets role="img"; without it the icon is aria-hidden. */
  title?: string
}

export type Icon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>

/** Shape elements an icon may contain. */
type IconElement = "path" | "circle" | "rect" | "ellipse" | "line" | "polyline" | "polygon"

/** An icon's drawing: a flat list of [element, attributes] pairs, lucide compatible. */
export type IconNode = ReadonlyArray<readonly [IconElement, Readonly<Record<string, string>>]>

const toPascal = (name: string): string =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

/**
 * Builds a React icon component from an icon node.
 * `name` is the kebab-case icon name, used for the class `chatcn-icon-<name>` and displayName.
 */
export function createIcon(name: string, iconNode: IconNode): Icon {
  // biome-ignore lint/correctness/noComponentHookFactories: runs once per icon at module load
  const Component = forwardRef<SVGSVGElement, IconProps>(function ChatcnIcon(
    {
      size = 24,
      strokeWidth = 1.5,
      absoluteStrokeWidth = false,
      color = "currentColor",
      title,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const stroke = absoluteStrokeWidth
      ? (Number(strokeWidth) * 24) / Number.parseFloat(String(size))
      : strokeWidth
    const labelled = Boolean(title || rest["aria-label"] || rest["aria-labelledby"])
    return createElement(
      "svg",
      {
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: stroke,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "data-slot": "icon",
        className: className
          ? `chatcn-icon chatcn-icon-${name} ${className}`
          : `chatcn-icon chatcn-icon-${name}`,
        ...(labelled ? { role: "img" } : { "aria-hidden": true }),
        ...rest,
      },
      title ? createElement("title", null, title) : null,
      ...iconNode.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs })),
      children,
    )
  })
  Component.displayName = `${toPascal(name)}Icon`
  return Component
}

const iconNode: IconNode = [
  ["path", {"d":"M7 10.5h10a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-4.5a3 3 0 0 1 3-3"}],
  ["path", {"d":"M8 7.5V7a4 4 0 0 1 4-4 4 4 0 0 1 4 4v.5"}],
]

const LockIcon: Icon = /* @__PURE__ */ createIcon("lock", iconNode)

const CONFIG = /(^\.|config\.|rc$|rc\.|^dockerfile$|^makefile$)/i

const iconNode2: IconNode = [
  ["path", {"d":"M7 2.5h5.88a1.5 1.5 0 0 1 1.06.44l5.12 5.12a1.5 1.5 0 0 1 .44 1.06V19a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5"}],
  ["path", {"d":"M13.5 3.25v3.5a1.75 1.75 0 0 0 1.75 1.75h3.5"}],
  ["path", {"d":"M9.75 14.75a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 1 0-4.5 0"}],
  ["path", {"d":"M14.25 14.75h2"}],
  ["path", {"d":"m13.13 16.7 1 1.73"}],
  ["path", {"d":"m10.88 16.7-1 1.73"}],
  ["path", {"d":"M9.75 14.75h-2"}],
  ["path", {"d":"m10.88 12.8-1.01-1.73"}],
  ["path", {"d":"m13.13 12.8 1-1.73"}],
]

const FileCogIcon: Icon = /* @__PURE__ */ createIcon("file-cog", iconNode2)

const CODE =
  /\.(tsx?|jsx?|mjs|cjs|py|go|rs|rb|java|kt|swift|c|cc|cpp|h|hpp|cs|php|vue|svelte|astro|sh|sql|css|scss|html)$/i

const iconNode3: IconNode = [
  ["path", {"d":"M7 2.5h5.88a1.5 1.5 0 0 1 1.06.44l5.12 5.12a1.5 1.5 0 0 1 .44 1.06V19a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5"}],
  ["path", {"d":"M13.5 3.25v3.5a1.75 1.75 0 0 0 1.75 1.75h3.5"}],
  ["path", {"d":"m10 12-1.5 1.88a1 1 0 0 0 0 1.24L10 17"}],
  ["path", {"d":"m14 12 1.5 1.88a1 1 0 0 1 0 1.24L14 17"}],
]

const FileCodeIcon: Icon = /* @__PURE__ */ createIcon("file-code", iconNode3)

const DATA = /\.(json|jsonc|ya?ml|toml|xml|graphql)$/i

const iconNode4: IconNode = [
  ["path", {"d":"M9.5 3.5h-1a2 2 0 0 0-2 2V10a2 2 0 0 1-2 2h-1"}],
  ["path", {"d":"M9.5 20.5h-1a2 2 0 0 1-2-2V14a2 2 0 0 0-2-2h-1"}],
  ["path", {"d":"M14.5 3.5h1a2 2 0 0 1 2 2V10a2 2 0 0 0 2 2h1"}],
  ["path", {"d":"M14.5 20.5h1a2 2 0 0 0 2-2V14a2 2 0 0 1 2-2h1"}],
]

const BracesIcon: Icon = /* @__PURE__ */ createIcon("braces", iconNode4)

const DOC = /\.(mdx?|txt|rst|log)$/i

const iconNode5: IconNode = [
  ["path", {"d":"M7 2.5h5.88a1.5 1.5 0 0 1 1.06.44l5.12 5.12a1.5 1.5 0 0 1 .44 1.06V19a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5"}],
  ["path", {"d":"M13.5 3.25v3.5a1.75 1.75 0 0 0 1.75 1.75h3.5"}],
  ["path", {"d":"M8.25 12.5h7.5"}],
  ["path", {"d":"M8.25 16.5h7.5"}],
  ["path", {"d":"M8.25 8.5H10"}],
]

const FileTextIcon: Icon = /* @__PURE__ */ createIcon("file-text", iconNode5)

const IMAGE = /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i

const iconNode6: IconNode = [
  ["path", {"d":"M7 2.5h5.88a1.5 1.5 0 0 1 1.06.44l5.12 5.12a1.5 1.5 0 0 1 .44 1.06V19a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5"}],
  ["path", {"d":"M13.5 3.25v3.5a1.75 1.75 0 0 0 1.75 1.75h3.5"}],
  ["path", {"d":"M8.25 11.75a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 1 0-2.5 0"}],
  ["path", {"d":"m7.75 18.5 3-3a1.5 1.5 0 0 1 2.06-.06l3.44 3.06"}],
]

const FileImageIcon: Icon = /* @__PURE__ */ createIcon("file-image", iconNode6)

const SHEET = /\.(csv|tsv|xlsx?)$/i

const iconNode7: IconNode = [
  ["path", {"d":"M7 2.5h5.88a1.5 1.5 0 0 1 1.06.44l5.12 5.12a1.5 1.5 0 0 1 .44 1.06V19a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5"}],
  ["path", {"d":"M13.5 3.25v3.5a1.75 1.75 0 0 0 1.75 1.75h3.5"}],
  ["path", {"d":"M8 13h2"}],
  ["path", {"d":"M14 13h2"}],
  ["path", {"d":"M8 17h2"}],
  ["path", {"d":"M14 17h2"}],
]

const FileSpreadsheetIcon: Icon = /* @__PURE__ */ createIcon("file-spreadsheet", iconNode7)

const ARCHIVE = /\.(zip|tar|gz|tgz|rar|7z)$/i

const iconNode8: IconNode = [
  ["path", {"d":"M7 2.5h5.88a1.5 1.5 0 0 1 1.06.44l5.12 5.12a1.5 1.5 0 0 1 .44 1.06V19a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5"}],
  ["path", {"d":"M13.5 3.25v3.5a1.75 1.75 0 0 0 1.75 1.75h3.5"}],
  ["path", {"d":"M10 5.5h.01"}],
  ["path", {"d":"M10 8.5h.01"}],
  ["path", {"d":"M10 11.5h.01"}],
  ["path", {"d":"M9.5 14h1a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 8 17v-1.5A1.5 1.5 0 0 1 9.5 14"}],
]

const FileArchiveIcon: Icon = /* @__PURE__ */ createIcon("file-archive", iconNode8)

const iconNode9: IconNode = [
  ["path", {"d":"M7 2.5h5.88a1.5 1.5 0 0 1 1.06.44l5.12 5.12a1.5 1.5 0 0 1 .44 1.06V19a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5"}],
  ["path", {"d":"M13.5 3.25v3.5a1.75 1.75 0 0 0 1.75 1.75h3.5"}],
]

const FileIcon: Icon = /* @__PURE__ */ createIcon("file", iconNode9)

/** Picks a file icon by name. Exported so other file lists can match the tree. */
export function fileIconFor(name: string): React.ReactNode {
  if (LOCK.test(name)) return <LockIcon />
  if (CONFIG.test(name)) return <FileCogIcon />
  if (CODE.test(name)) return <FileCodeIcon />
  if (DATA.test(name)) return <BracesIcon />
  if (DOC.test(name)) return <FileTextIcon />
  if (IMAGE.test(name)) return <FileImageIcon />
  if (SHEET.test(name)) return <FileSpreadsheetIcon />
  if (ARCHIVE.test(name)) return <FileArchiveIcon />
  return <FileIcon />
}

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export type FileTreeStatus = "added" | "modified" | "deleted" | "renamed"

export interface FileTreeNode {
  name: string
  /** Present (even empty) for folders. */
  children?: FileTreeNode[]
  /** Change marker against the base, like `git status`. */
  status?: FileTreeStatus
  /** Lines added and removed, shown as `+12 −3`. */
  churn?: { additions: number; deletions: number }
  /** Override the icon picked from the extension. */
  icon?: React.ReactNode
  disabled?: boolean
}

export interface FileTreeProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  nodes: FileTreeNode[]
  /** Open folders, by path (`src/app`). Controlled. */
  expanded?: string[]
  /** Open folders on first render. `true` opens every folder. */
  defaultExpanded?: string[] | true
  onExpandedChange?: (expanded: string[]) => void
  /** Selected path. Controlled. */
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (path: string, node: FileTreeNode) => void
  /** Click or Enter on a file. */
  onOpen?: (path: string, node: FileTreeNode) => void
  /** Change markers as letters (A, M, D, R) or as dots. Default `letter`. */
  markers?: "letter" | "dot"
  /** Show `+12 −3` next to changed files that have churn data. Default true. */
  showChurn?: boolean
  /** Render only the rows in view. `auto` turns on above 500 visible rows. Default `auto`. */
  virtualize?: boolean | "auto"
  /** Height of the scroll area. Required in practice when virtualizing. Default 480 then. */
  maxHeight?: number | string
  /** Shows skeleton rows in the final layout. */
  loading?: boolean
  /** Shown when `nodes` is empty. */
  emptyText?: React.ReactNode
  /** Accessible name for the tree. Default "Files". */
  label?: string
}

function useControllable<T>(prop: T | undefined, initial: () => T, onChange?: (value: T) => void) {
  const [state, setState] = React.useState(initial)
  const value = prop !== undefined ? prop : state
  const set = React.useCallback(
    (next: T) => {
      if (prop === undefined) setState(next)
      onChange?.(next)
    },
    [prop, onChange],
  )
  return [value, set] as const
}

function joinPath(parent: string | null, name: string) {
  return parent ? `${parent}/${name}` : name
}

function collectFolders(nodes: FileTreeNode[], parent: string | null, out: string[] = []) {
  for (const node of nodes) {
    if (!node.children) continue
    const path = joinPath(parent, node.name)
    out.push(path)
    collectFolders(node.children, path, out)
  }
  return out
}

function sortNodes(nodes: FileTreeNode[]) {
  // Folders first, then files, each alphabetical, the way every editor lists them.
  return [...nodes].sort((a, b) => {
    const af = a.children ? 0 : 1
    const bf = b.children ? 0 : 1
    return af - bf || a.name.localeCompare(b.name, undefined, { numeric: true })
  })
}

/** One visible row of a flattened tree. */
interface ChatcnTreeRow<T = unknown> {
  id: string
  parentId: string | null
  /** 1-based, as `aria-level` wants it. */
  level: number
  /** 1-based position among siblings, for `aria-posinset`. */
  posinset: number
  /** Number of siblings, for `aria-setsize`. */
  setsize: number
  /** Has children (a folder). */
  isGroup: boolean
  expanded: boolean
  /** Text typeahead matches against. */
  label: string
  /** Ids of every ancestor, root first. Used for indentation guides. */
  ancestors: string[]
  disabled?: boolean
  node: T
}

/** Flattens a nested tree into the rows that are visible with the current expansion. */
function flattenChatcnTree<T>(
  nodes: readonly T[],
  options: {
    getId: (node: T, parentId: string | null) => string
    getChildren: (node: T) => readonly T[] | undefined
    getLabel: (node: T) => string
    isExpanded: (id: string) => boolean
    isDisabled?: (node: T) => boolean
  },
): ChatcnTreeRow<T>[] {
  const rows: ChatcnTreeRow<T>[] = []
  const walk = (list: readonly T[], parentId: string | null, ancestors: string[]) => {
    list.forEach((node, index) => {
      const id = options.getId(node, parentId)
      const children = options.getChildren(node)
      const isGroup = children !== undefined
      const expanded = isGroup && options.isExpanded(id)
      rows.push({
        id,
        parentId,
        level: ancestors.length + 1,
        posinset: index + 1,
        setsize: list.length,
        isGroup,
        expanded,
        label: options.getLabel(node),
        ancestors,
        disabled: options.isDisabled?.(node),
        node,
      })
      if (expanded && children) walk(children, id, [...ancestors, id])
    })
  }
  walk(nodes, null, [])
  return rows
}

/** Folders that contain changed files somewhere below. */
function collectChangedFolders(nodes: FileTreeNode[], parent: string | null, out: Set<string>) {
  let any = false
  for (const node of nodes) {
    const path = joinPath(parent, node.name)
    if (node.children) {
      if (collectChangedFolders(node.children, path, out)) {
        out.add(path)
        any = true
      }
    } else if (node.status) any = true
  }
  return any
}

/** Every path in the tree, folders included. */
function collectPaths(nodes: FileTreeNode[], parent: string | null, out: Set<string>) {
  for (const node of nodes) {
    const path = joinPath(parent, node.name)
    out.add(path)
    if (node.children) collectPaths(node.children, path, out)
  }
  return out
}

/** Paths that appeared after mount, held for a moment so new files flash once. */
function useFreshPaths(nodes: FileTreeNode[]) {
  const known = React.useRef<Set<string> | null>(null)
  const [fresh, setFresh] = React.useState<ReadonlySet<string>>(new Set())
  const timers = React.useRef(new Set<number>())
  React.useEffect(() => {
    const pending = timers.current
    return () => {
      for (const id of pending) window.clearTimeout(id)
      pending.clear()
    }
  }, [])
  React.useEffect(() => {
    const all = collectPaths(nodes, null, new Set())
    const prev = known.current
    known.current = all
    if (!prev) return
    const added = [...all].filter((p) => !prev.has(p))
    if (added.length === 0) return
    setFresh((f) => new Set([...f, ...added]))
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      setFresh((f) => {
        const next = new Set(f)
        for (const p of added) next.delete(p)
        return next
      })
    }, 900)
    timers.current.add(id)
  }, [nodes])
  return fresh
}

interface UseChatcnTreeNavigationOptions<T> {
  rows: readonly ChatcnTreeRow<T>[]
  focusedId: string | null
  onFocusChange: (id: string) => void
  onExpandedChange: (id: string, expanded: boolean) => void
  onSelect?: (id: string) => void
  onActivate?: (id: string) => void
}

const TYPEAHEAD_RESET_MS = 500

function useChatcnTreeNavigation<T>({
  rows,
  focusedId,
  onFocusChange,
  onExpandedChange,
  onSelect,
  onActivate,
}: UseChatcnTreeNavigationOptions<T>) {
  const typeahead = React.useRef({ text: "", at: 0 })

  const tabStop = rows.some((row) => row.id === focusedId) ? focusedId : (rows[0]?.id ?? null)

  const getTabIndex = React.useCallback((id: string) => (id === tabStop ? 0 : -1), [tabStop])

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey) return
      const index = rows.findIndex((row) => row.id === tabStop)
      const row = rows[index]
      if (!row) return

      const move = (to: number) => {
        const next = rows[Math.max(0, Math.min(rows.length - 1, to))]
        if (next) onFocusChange(next.id)
      }

      switch (event.key) {
        case "ArrowDown":
          move(index + 1)
          break
        case "ArrowUp":
          move(index - 1)
          break
        case "Home":
          move(0)
          break
        case "End":
          move(rows.length - 1)
          break
        case "ArrowRight":
          if (!row.isGroup) return
          if (!row.expanded) onExpandedChange(row.id, true)
          else if (rows[index + 1]?.parentId === row.id) move(index + 1)
          break
        case "ArrowLeft":
          if (row.isGroup && row.expanded) onExpandedChange(row.id, false)
          else if (row.parentId) onFocusChange(row.parentId)
          break
        case "Enter":
          if (row.disabled) break
          if (row.isGroup) onExpandedChange(row.id, !row.expanded)
          else {
            onSelect?.(row.id)
            onActivate?.(row.id)
          }
          break
        case " ":
          if (row.disabled) break
          onSelect?.(row.id)
          break
        case "*":
          for (const sibling of rows) {
            if (sibling.parentId === row.parentId && sibling.isGroup && !sibling.expanded) {
              onExpandedChange(sibling.id, true)
            }
          }
          break
        default: {
          if (event.key.length !== 1 || event.key === " ") return
          const now = Date.now()
          const t = typeahead.current
          t.text = now - t.at > TYPEAHEAD_RESET_MS ? event.key : t.text + event.key
          t.at = now
          const query = t.text.toLowerCase()
          const repeat = query.length > 1 && query.split("").every((c) => c === query[0])
          const needle = repeat ? (query[0] ?? "") : query
          const start = repeat || query.length === 1 ? index + 1 : index
          for (let i = 0; i < rows.length; i++) {
            const candidate = rows[(start + i) % rows.length]
            if (candidate?.label.toLowerCase().startsWith(needle)) {
              onFocusChange(candidate.id)
              break
            }
          }
        }
      }
      event.preventDefault()
    },
    [rows, tabStop, onFocusChange, onExpandedChange, onSelect, onActivate],
  )

  return { onKeyDown, getTabIndex, tabStop }
}

function useCoarsePointer() {
  const [coarse, setCoarse] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia?.("(pointer: coarse)")
    if (!mq) return
    setCoarse(mq.matches)
    const on = () => setCoarse(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return coarse
}

const AUTO_VIRTUALIZE = 500

/* -------------------------------------------------------------------------------------------------
 * Row
 * -----------------------------------------------------------------------------------------------*/

interface RowProps {
  row: ChatcnTreeRow<FileTreeNode>
  selected: boolean
  tabIndex: number
  changedFolder: boolean
  fresh: boolean
  strongGuide: string | null
  markers: "letter" | "dot"
  showChurn: boolean
  onRowClick: (row: ChatcnTreeRow<FileTreeNode>) => void
  onRowFocus: (id: string) => void
  style?: React.CSSProperties
  index?: number
}

const iconNode10: IconNode = [
  ["path", {"d":"M3.25 13V6a2 2 0 0 1 2-2h3.03a1.5 1.5 0 0 1 1.17.56l1.1 1.38a1.5 1.5 0 0 0 1.17.56h5.03"}],
  ["path", {"d":"M8.72 10h10.81a1.5 1.5 0 0 1 1.45 1.9l-1.93 7a1.5 1.5 0 0 1-1.44 1.1H5.57a1.5 1.5 0 0 1-1.37-2.12l3.15-7A1.5 1.5 0 0 1 8.72 10"}],
]

const FolderOpenIcon: Icon = /* @__PURE__ */ createIcon("folder-open", iconNode10)

const iconNode11: IconNode = [
  ["path", {"d":"M4.75 4h3.24a1.5 1.5 0 0 1 1.21.62l1.1 1.51a1.5 1.5 0 0 0 1.21.62h7.24a2.5 2.5 0 0 1 2.5 2.5v8.25a2.5 2.5 0 0 1-2.5 2.5H5.25a2.5 2.5 0 0 1-2.5-2.5V6a2 2 0 0 1 2-2"}],
]

const FolderIcon: Icon = /* @__PURE__ */ createIcon("folder", iconNode11)

const PAD = 8
const INDENT = 12

const iconNode12: IconNode = [
  ["path", {"d":"m9.25 18 4.23-4.23a2.5 2.5 0 0 0 0-3.54L9.25 6"}],
]

const ChevronRightIcon: Icon = /* @__PURE__ */ createIcon("chevron-right", iconNode12)

const MINUS = "\u2212"

const STATUS_LABEL: Record<FileTreeStatus, string> = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
}

const STATUS_LETTER: Record<FileTreeStatus, string> = {
  added: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
}

const FileTreeRow = React.memo(function FileTreeRow({
  row,
  selected,
  tabIndex,
  changedFolder,
  fresh,
  strongGuide,
  markers,
  showChurn,
  onRowClick,
  onRowFocus,
  style,
  index,
}: RowProps) {
  const { node } = row
  const status = node.status
  const depth = row.level - 1
  const icon =
    node.icon ??
    (row.isGroup ? row.expanded ? <FolderOpenIcon /> : <FolderIcon /> : fileIconFor(node.name))

  return (
    <div
      role="treeitem"
      data-slot="file-tree-item"
      data-tree-id={row.id}
      data-index={index}
      data-status={status}
      data-fresh={fresh ? "" : undefined}
      aria-level={row.level}
      aria-posinset={row.posinset}
      aria-setsize={row.setsize}
      aria-expanded={row.isGroup ? row.expanded : undefined}
      aria-selected={selected}
      aria-disabled={row.disabled || undefined}
      tabIndex={tabIndex}
      onClick={() => onRowClick(row)}
      onFocus={() => onRowFocus(row.id)}
      style={{ ...style, paddingInlineStart: PAD + depth * INDENT }}
      className={cn(
        "group/row relative isolate flex h-7 cursor-default items-center gap-1.5 pe-3.5 outline-none select-none pointer-coarse:h-9",
        "text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg-muted)",
        "hover:bg-(color:--chatcn-fill-hover) hover:text-(color:--chatcn-fg)",
        "focus-visible:outline-(color:--chatcn-accent) focus-visible:outline-2 focus-visible:-outline-offset-2",
        selected && "bg-(color:--chatcn-fill-active) text-(color:--chatcn-fg) hover:bg-(color:--chatcn-fill-active)",
        row.disabled && "opacity-50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "bg-(color:--chatcn-fill-active) pointer-events-none absolute inset-0 -z-10 opacity-0",
          "ease-(--chatcn-ease-standard) transition-opacity duration-300",
          fresh && "opacity-100 duration-0",
        )}
      />
      {row.ancestors.map((ancestor, d) => (
        <span
          key={ancestor}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 w-px",
            ancestor === strongGuide ? "bg-(color:--chatcn-border-strong)" : "bg-(color:--chatcn-border)",
          )}
          style={{ insetInlineStart: PAD + d * INDENT + 7.5 }}
        />
      ))}

      <span className="text-(color:--chatcn-fg-subtle) grid size-4 shrink-0 place-items-center [&_svg]:size-3.5">
        {row.isGroup ? (
          <ChevronRightIcon
            aria-hidden="true"
            className={cn(
              "ease-(--chatcn-ease-out) transition-transform duration-150 motion-reduce:transition-none rtl:-scale-x-100",
              "group-data-[keyboard]/tree:transition-none",
              row.expanded && "rotate-90 rtl:-rotate-90",
            )}
          />
        ) : null}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center [&_svg]:size-4",
          selected
            ? "text-(color:--chatcn-fg)"
            : "text-(color:--chatcn-fg-subtle) group-hover/row:text-(color:--chatcn-fg-muted)",
        )}
      >
        {icon}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          status === "deleted" &&
            "text-(color:--chatcn-fg-subtle) decoration-(color:--chatcn-fg-faint) line-through decoration-1",
        )}
      >
        {node.name}
      </span>

      {showChurn && node.churn && !row.isGroup ? (
        <span
          data-slot="file-tree-churn"
          className="text-[0.75rem]/[1rem] flex shrink-0 gap-1 font-mono tabular-nums"
        >
          {node.churn.additions > 0 ? (
            <span className="text-(color:--chatcn-diff-add-fg)">+{node.churn.additions}</span>
          ) : null}
          {node.churn.deletions > 0 ? (
            <span className="text-(color:--chatcn-diff-del-fg)">
              {MINUS}
              {node.churn.deletions}
            </span>
          ) : null}
          <span className="sr-only">
            {`${node.churn.additions} ${node.churn.additions === 1 ? "line" : "lines"} added, ${node.churn.deletions} removed`}
          </span>
        </span>
      ) : null}

      {status ? (
        markers === "letter" ? (
          <span
            data-slot="file-tree-marker"
            title={STATUS_LABEL[status]}
            className={cn(
              "text-[0.75rem]/[1rem] w-3 shrink-0 text-center font-mono font-medium",
              status === "added" && "text-(color:--chatcn-diff-add-fg)",
              status === "modified" && "text-(color:--chatcn-amber)",
              status === "renamed" && "text-(color:--chatcn-blue)",
              status === "deleted" && "text-(color:--chatcn-diff-del-fg)",
            )}
          >
            <span aria-hidden="true">{STATUS_LETTER[status]}</span>
            <span className="sr-only">{STATUS_LABEL[status]}</span>
          </span>
        ) : (
          <span
            data-slot="file-tree-marker"
            title={STATUS_LABEL[status]}
            className="grid w-3 shrink-0 place-items-center"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                status === "added" && "bg-(color:--chatcn-diff-add-fg)",
                status === "modified" && "bg-(color:--chatcn-amber)",
                status === "renamed" && "bg-(color:--chatcn-blue)",
                status === "deleted" && "shadow-[inset_0_0_0_1.5px_var(--chatcn-diff-del-fg)]",
              )}
            />
            <span className="sr-only">{STATUS_LABEL[status]}</span>
          </span>
        )
      ) : changedFolder && !row.expanded ? (
        <span title="Contains changes" className="grid w-3 shrink-0 place-items-center">
          <span aria-hidden="true" className="bg-(color:--chatcn-fg-faint) size-1 rounded-full" />
          <span className="sr-only">Contains changes</span>
        </span>
      ) : null}
    </div>
  )
})

/* -------------------------------------------------------------------------------------------------
 * FileTree
 * -----------------------------------------------------------------------------------------------*/

export function FileTree({
  nodes,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  onOpen,
  markers = "letter",
  showChurn = true,
  virtualize = "auto",
  maxHeight,
  loading = false,
  emptyText = "No files",
  label = "Files",
  className,
  ...props
}: FileTreeProps) {
  const [expandedList, setExpandedList] = useControllable(
    expandedProp,
    () => (defaultExpanded === true ? collectFolders(nodes, null) : (defaultExpanded ?? [])),
    onExpandedChange,
  )
  const expandedSet = React.useMemo(() => new Set(expandedList), [expandedList])

  const [selectedState, setSelectedState] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : selectedState

  const sorted = React.useMemo(() => {
    const sortDeep = (list: FileTreeNode[]): FileTreeNode[] =>
      sortNodes(list).map((n) => (n.children ? { ...n, children: sortDeep(n.children) } : n))
    return sortDeep(nodes)
  }, [nodes])

  const rows = React.useMemo(
    () =>
      flattenChatcnTree(sorted, {
        getId: (node, parentId) => joinPath(parentId, node.name),
        getChildren: (node) => node.children,
        getLabel: (node) => node.name,
        isExpanded: (id) => expandedSet.has(id),
        isDisabled: (node) => node.disabled === true,
      }),
    [sorted, expandedSet],
  )
  const rowIndex = React.useMemo(() => new Map(rows.map((r, i) => [r.id, i])), [rows])
  const changedFolders = React.useMemo(() => {
    const out = new Set<string>()
    collectChangedFolders(nodes, null, out)
    return out
  }, [nodes])
  const fresh = useFreshPaths(nodes)

  const [focusedId, setFocusedId] = React.useState<string | null>(selected)
  const [keyboard, setKeyboard] = React.useState(false)
  const focusRequest = React.useRef<string | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const setExpanded = React.useCallback(
    (id: string, open: boolean) => {
      const has = expandedSet.has(id)
      if (open === has) return
      setExpandedList(open ? [...expandedList, id] : expandedList.filter((p) => p !== id))
    },
    [expandedSet, expandedList, setExpandedList],
  )

  const select = React.useCallback(
    (id: string) => {
      const row = rows[rowIndex.get(id) ?? -1]
      if (!row || row.disabled) return
      if (selectedProp === undefined) setSelectedState(id)
      onSelectedChange?.(id, row.node)
    },
    [rows, rowIndex, selectedProp, onSelectedChange],
  )

  const activate = React.useCallback(
    (id: string) => {
      const row = rows[rowIndex.get(id) ?? -1]
      if (row && !row.isGroup && !row.disabled) onOpen?.(id, row.node)
    },
    [rows, rowIndex, onOpen],
  )

  const focusRow = React.useCallback((id: string) => {
    focusRequest.current = id
    setFocusedId(id)
  }, [])

  const { onKeyDown, getTabIndex, tabStop } = useChatcnTreeNavigation({
    rows,
    focusedId,
    onFocusChange: focusRow,
    onExpandedChange: setExpanded,
    onSelect: select,
    onActivate: activate,
  })

  React.useEffect(() => {
    if (!focusedId || rowIndex.has(focusedId)) return
    const parts = focusedId.split("/")
    for (let i = parts.length - 1; i > 0; i--) {
      const ancestor = parts.slice(0, i).join("/")
      if (rowIndex.has(ancestor)) {
        const hadFocus = listRef.current?.contains(document.activeElement)
        if (hadFocus) focusRow(ancestor)
        else setFocusedId(ancestor)
        return
      }
    }
  }, [focusedId, rowIndex, focusRow])

  const coarse = useCoarsePointer()
  const rowHeight = coarse ? 36 : 28
  const virtual = virtualize === "auto" ? rows.length > AUTO_VIRTUALIZE : virtualize
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  })

  React.useLayoutEffect(() => {
    const id = focusRequest.current
    if (!id) return
    const find = () =>
      listRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)
    const el = find()
    if (el) {
      focusRequest.current = null
      el.focus({ preventScroll: virtual })
      if (virtual) virtualizer.scrollToIndex(rowIndex.get(id) ?? 0, { align: "auto" })
      return
    }
    if (virtual) {
      virtualizer.scrollToIndex(rowIndex.get(id) ?? 0, { align: "auto" })
      const raf = requestAnimationFrame(() => {
        const later = find()
        if (later) {
          focusRequest.current = null
          later.focus({ preventScroll: true })
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  })

  const onRowClick = React.useCallback(
    (row: ChatcnTreeRow<FileTreeNode>) => {
      if (row.disabled) return
      setFocusedId(row.id)
      if (row.isGroup) setExpanded(row.id, !row.expanded)
      select(row.id)
      if (!row.isGroup) activate(row.id)
    },
    [setExpanded, select, activate],
  )
  const onRowFocus = React.useCallback((id: string) => setFocusedId(id), [])

  const activeRow = rows[rowIndex.get(tabStop ?? "") ?? -1]
  const strongGuide = activeRow
    ? activeRow.isGroup && activeRow.expanded
      ? activeRow.id
      : activeRow.parentId
    : null

  const renderRow = (
    row: ChatcnTreeRow<FileTreeNode>,
    style?: React.CSSProperties,
    index?: number,
  ) => (
    <FileTreeRow
      key={row.id}
      row={row}
      index={index}
      style={style}
      selected={row.id === selected}
      tabIndex={getTabIndex(row.id)}
      changedFolder={changedFolders.has(row.id)}
      fresh={fresh.has(row.id)}
      strongGuide={strongGuide}
      markers={markers}
      showChurn={showChurn}
      onRowClick={onRowClick}
      onRowFocus={onRowFocus}
    />
  )

  const height = maxHeight ?? (virtual ? 480 : undefined)

  return (
    <div
      ref={scrollRef}
      data-slot="file-tree"
      style={{ maxHeight: height, height: virtual ? height : undefined }}
      className={cn("chatcn-scroll chatcn-scroll-fade overflow-auto py-1", className)}
      {...props}
    >
      {loading ? (
        <div
          role="status"
          aria-busy="true"
          aria-label={`Loading ${label.toLowerCase()}`}
          className="flex flex-col"
        >
          {[64, 48, 56, 40, 72, 52].map((w, i) => (
            <div
              key={i}
              className="flex h-7 items-center gap-1.5 pe-3.5"
              style={{ paddingInlineStart: PAD + (i > 0 && i < 4 ? INDENT : 0) + 22 }}
            >
              <span className="bg-(color:--chatcn-fill) rounded-(--chatcn-radius-xs) size-4" />
              <span className="bg-(color:--chatcn-fill) rounded-(--chatcn-radius-xs) h-2.5" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg-subtle) px-3.5 py-6 text-center text-balance">
          {emptyText}
        </p>
      ) : (
        <div
          ref={listRef}
          role="tree"
          aria-label={label}
          data-keyboard={keyboard ? "" : undefined}
          onKeyDown={(event) => {
            if (!keyboard) setKeyboard(true)
            onKeyDown(event)
          }}
          onPointerDown={() => {
            if (keyboard) setKeyboard(false)
          }}
          className="group/tree relative"
          style={virtual ? { height: virtualizer.getTotalSize() } : undefined}
        >
          {virtual
            ? virtualizer.getVirtualItems().map((item) => {
                const row = rows[item.index]
                if (!row) return null
                return renderRow(
                  row,
                  {
                    position: "absolute",
                    insetInline: 0,
                    top: 0,
                    transform: `translateY(${item.start}px)`,
                  },
                  item.index,
                )
              })
            : rows.map((row) => renderRow(row))}
        </div>
      )}
    </div>
  )
}

export default FileTree
