"use client"

import clsx from "clsx"
import {
  Check,
  Code,
  Copy,
  Download,
  Eraser,
  Eye,
  FileCode,
  FileText,
  Wand2,
  Zap,
} from "lucide-react"
import { type FC, type ReactNode, useCallback, useMemo, useRef, useState } from "react"
import { match } from "ts-pattern"
import MarkdownPreview from "./markdown-preview"
import { formatMarkdown } from "../_lib/format-markdown"
import { SAMPLE_MARKDOWN } from "../_lib/sample-markdown"

type View = "formatted" | "preview"
type CopiedKey = "markdown" | "html" | null

type Stats = {
  words: number
  characters: number
  lines: number
  readingTime: number
}

function computeStats(text: string): Stats {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  const lines = text === "" ? 0 : text.split("\n").length
  const readingTime = words === 0 ? 0 : Math.max(1, Math.round(words / 200))
  return { words, characters: text.length, lines, readingTime }
}

function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

type ToolbarButtonProps = {
  icon: typeof Wand2
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children?: ReactNode
}

const ToolbarButton: FC<ToolbarButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  children,
}) => (
  <button
    type="button"
    className={clsx(
      "inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 text-sm rounded transition-colors cursor-pointer",
      active
        ? "bg-dev-accent-blue text-white"
        : "bg-dev-button hover:bg-dev-button-hover text-dev-text",
      disabled && "opacity-40 cursor-not-allowed hover:bg-dev-button",
    )}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon size={14} />
    <span className="hidden sm:inline">{children ?? label}</span>
  </button>
)

const MarkdownFormatter: FC = () => {
  const [input, setInput] = useState(SAMPLE_MARKDOWN)
  const [autoFormat, setAutoFormat] = useState(true)
  const [committed, setCommitted] = useState(() => formatMarkdown(SAMPLE_MARKDOWN))
  const [view, setView] = useState<View>("formatted")
  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const liveFormatted = useMemo(() => formatMarkdown(input), [input])
  const formatted = autoFormat ? liveFormatted : committed
  const stats = useMemo(() => computeStats(input), [input])

  const flashCopied = useCallback((key: Exclude<CopiedKey, null>) => {
    setCopiedKey(key)
    if (copiedTimer.current) clearTimeout(copiedTimer.current)
    copiedTimer.current = setTimeout(() => setCopiedKey(null), 1200)
  }, [])

  const handleFormat = useCallback(() => {
    setCommitted(liveFormatted)
  }, [liveFormatted])

  const handleToggleAutoFormat = useCallback(
    (next: boolean) => {
      if (!next) setCommitted(liveFormatted)
      setAutoFormat(next)
    },
    [liveFormatted],
  )

  const handleCopyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatted)
      flashCopied("markdown")
    } catch {
      // clipboard unavailable
    }
  }, [formatted, flashCopied])

  const handleCopyHtml = useCallback(async () => {
    const node = previewRef.current
    if (!node) return
    try {
      await navigator.clipboard.writeText(node.innerHTML)
      flashCopied("html")
    } catch {
      // clipboard unavailable
    }
  }, [flashCopied])

  const handleDownload = useCallback(() => {
    downloadText("formatted.md", formatted)
  }, [formatted])

  const handleSample = useCallback(() => {
    setInput(SAMPLE_MARKDOWN)
  }, [])

  const handleClear = useCallback(() => {
    setInput("")
  }, [])

  return (
    <div className="flex flex-col h-full bg-dev-canvas text-dev-text">
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-dev-border">
        <div className="min-w-0 shrink">
          <h1 className="text-sm font-medium leading-relaxed text-dev-text truncate">
            Markdown Formatter
          </h1>
          <p className="hidden sm:block text-xs leading-relaxed text-dev-text-secondary truncate">
            Paste markdown to format tables, normalize lists, and preview the
            rendered output.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <ToolbarButton
            icon={Zap}
            label="Auto-format"
            onClick={() => handleToggleAutoFormat(!autoFormat)}
            active={autoFormat}
          >
            Auto-format
          </ToolbarButton>
          <ToolbarButton
            icon={Wand2}
            label="Format"
            onClick={handleFormat}
            disabled={autoFormat || input.trim() === ""}
          />
          <ToolbarButton
            icon={FileText}
            label="Sample"
            onClick={handleSample}
          />
          <ToolbarButton
            icon={copiedKey === "markdown" ? Check : Copy}
            label="Copy"
            onClick={handleCopyMarkdown}
            disabled={formatted.trim() === ""}
          >
            {copiedKey === "markdown" ? "Copied" : "Copy"}
          </ToolbarButton>
          <ToolbarButton
            icon={copiedKey === "html" ? Check : Code}
            label="Copy HTML"
            onClick={handleCopyHtml}
            disabled={formatted.trim() === ""}
          >
            {copiedKey === "html" ? "Copied" : "Copy HTML"}
          </ToolbarButton>
          <ToolbarButton
            icon={Download}
            label="Download"
            onClick={handleDownload}
            disabled={formatted.trim() === ""}
          />
          <ToolbarButton
            icon={Eraser}
            label="Clear"
            onClick={handleClear}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-dev-border">
          <div className="px-3 py-2 text-xs text-dev-text-secondary uppercase tracking-wider border-b border-dev-border">
            Input
          </div>
          <textarea
            aria-label="Markdown input"
            className="flex-1 p-4 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-dev-text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your markdown here..."
            spellCheck={false}
          />
        </div>
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-dev-border">
            <button
              type="button"
              className={clsx(
                "px-3 py-2 text-xs uppercase tracking-wider cursor-pointer transition-colors",
                view === "formatted"
                  ? "text-dev-text border-b-2 border-dev-accent-blue"
                  : "text-dev-text-secondary hover:text-dev-text",
              )}
              onClick={() => setView("formatted")}
            >
              <FileCode
                size={12}
                className="inline mr-1 -mt-0.5"
              />
              Formatted
            </button>
            <button
              type="button"
              className={clsx(
                "px-3 py-2 text-xs uppercase tracking-wider cursor-pointer transition-colors",
                view === "preview"
                  ? "text-dev-text border-b-2 border-dev-accent-blue"
                  : "text-dev-text-secondary hover:text-dev-text",
              )}
              onClick={() => setView("preview")}
            >
              <Eye
                size={12}
                className="inline mr-1 -mt-0.5"
              />
              Preview
            </button>
            <div className="ml-auto px-3 text-xs text-dev-text-secondary">
              {match(view)
                .with("formatted", () => "markdown source")
                .with("preview", () => "rendered")
                .exhaustive()}
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <pre
              className={clsx(
                "absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-auto",
                view === "formatted" ? "visible" : "invisible",
              )}
            >
              {formatted}
            </pre>
            <div
              ref={previewRef}
              className={clsx(
                "absolute inset-0 p-4 overflow-auto",
                view === "preview" ? "visible" : "invisible",
              )}
            >
              <MarkdownPreview content={formatted} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-1.5 border-t border-dev-border text-xs text-dev-text-secondary">
        <span>{stats.words} words</span>
        <span>{stats.characters} chars</span>
        <span>{stats.lines} lines</span>
        <span>
          {stats.readingTime === 0
            ? "—"
            : `${stats.readingTime} min read`}
        </span>
      </div>
    </div>
  )
}

export default MarkdownFormatter
