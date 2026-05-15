"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import clsx from "clsx"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { X, AlignLeft, Braces, List, Hash, Copy, Check } from "lucide-react"
import type { QueryResult } from "./types"

const ROW_HEIGHT = 29

type ResultTableProps = {
  result: QueryResult
}

type ViewMode = "text" | "json" | "jsonl" | "markdown"

function detectMode(value: string): ViewMode {
  const trimmed = value.trim()
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed)
      return "json"
    } catch {}
  }
  const lines = trimmed.split("\n")
  if (lines.length > 1 && lines.every((l) => {
    try { JSON.parse(l.trim()); return l.trim().length > 0 } catch { return false }
  })) {
    return "jsonl"
  }
  if (
    trimmed.includes("\n") &&
    (trimmed.includes("# ") || trimmed.includes("- ") || trimmed.includes("* ") || trimmed.includes("```"))
  ) {
    return "markdown"
  }
  return "text"
}

const VIEW_MODES: { mode: ViewMode; label: string; icon: typeof AlignLeft }[] = [
  { mode: "text", label: "Text", icon: AlignLeft },
  { mode: "json", label: "JSON", icon: Braces },
  { mode: "jsonl", label: "JSONL", icon: List },
  { mode: "markdown", label: "Markdown", icon: Hash },
]

type CellDialogProps = {
  columnName: string
  value: string
  onClose: () => void
}

function formatJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value.trim()), null, 2)
  } catch {
    return value
  }
}

function formatJsonl(value: string): string {
  return value
    .split("\n")
    .map((line) => {
      try {
        return JSON.stringify(JSON.parse(line.trim()), null, 2)
      } catch {
        return line
      }
    })
    .join("\n")
}

const JSON_TOKEN_RE = /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|true|false|null|[{}\[\]:,]/g

function highlightJson(formatted: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  JSON_TOKEN_RE.lastIndex = 0
  while ((match = JSON_TOKEN_RE.exec(formatted)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(formatted.slice(lastIndex, match.index))
    }
    const token = match[0]
    let className: string
    if (token === "true" || token === "false") {
      className = "text-dev-syntax-boolean"
    } else if (token === "null") {
      className = "text-dev-syntax-null"
    } else if (token === "{" || token === "}" || token === "[" || token === "]" || token === ":" || token === ",") {
      className = "text-dev-syntax-punctuation"
    } else if (token.startsWith('"')) {
      const afterToken = formatted.slice(JSON_TOKEN_RE.lastIndex)
      className = /^\s*:/.test(afterToken)
        ? "text-dev-syntax-property"
        : "text-dev-syntax-string"
    } else {
      className = "text-dev-syntax-number"
    }
    nodes.push(
      <span key={match.index} className={className}>{token}</span>,
    )
    lastIndex = JSON_TOKEN_RE.lastIndex
  }
  if (lastIndex < formatted.length) {
    nodes.push(formatted.slice(lastIndex))
  }
  return nodes
}

function highlightJsonl(formatted: string): React.ReactNode[] {
  const lines = formatted.split("\n")
  return lines.flatMap((line, i) => {
    const highlighted = highlightJson(line)
    if (i < lines.length - 1) {
      highlighted.push("\n")
    }
    return highlighted
  })
}

function CellDialog({ columnName, value, onClose }: CellDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<ViewMode>(() => detectMode(value))
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [value])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const formatted = useMemo(() => {
    switch (mode) {
      case "json":
        return formatJson(value)
      case "jsonl":
        return formatJsonl(value)
      default:
        return value
    }
  }, [mode, value])

  const highlighted = useMemo(() => {
    switch (mode) {
      case "json":
        return highlightJson(formatted)
      case "jsonl":
        return highlightJsonl(formatted)
      default:
        return null
    }
  }, [mode, formatted])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cell-dialog-title"
        tabIndex={-1}
        className="relative bg-dev-surface border border-dev-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-dev-border">
          <h2
            id="cell-dialog-title"
            className="text-sm font-medium text-dev-text"
          >
            {columnName}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-dev-border overflow-hidden">
              {VIEW_MODES.map(({ mode: m, label, icon: Icon }) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  title={label}
                  className={clsx(
                    "px-1.5 py-1 transition-colors",
                    mode === m
                      ? "bg-dev-inset text-dev-text"
                      : "bg-dev-surface text-dev-text-secondary hover:text-dev-text",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="text-dev-text-secondary hover:text-dev-text"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto min-h-0 relative group">
          {mode === "markdown" ? (
            <div className="px-4 py-3 prose prose-invert prose-sm max-w-none text-dev-text">
              <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
            </div>
          ) : highlighted ? (
            <pre className="px-4 py-3 font-mono text-xs whitespace-pre-wrap break-all">
              {highlighted}
            </pre>
          ) : (
            <pre className="px-4 py-3 font-mono text-xs text-dev-text whitespace-pre-wrap break-all">
              {formatted}
            </pre>
          )}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 rounded bg-dev-surface border border-dev-border text-dev-text-secondary hover:text-dev-text opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Copy"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

const ResultTable = ({ result }: ResultTableProps) => {
  const rows = result.rows
  const parentRef = useRef<HTMLDivElement>(null)
  const [dialogCell, setDialogCell] = useState<{
    columnName: string
    value: string
  } | null>(null)

  const closeDialog = useCallback(() => setDialogCell(null), [])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const afterSize =
    totalSize > 0
      ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0)
      : 0
  const beforeSize = virtualItems[0]?.start ?? 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="overflow-auto flex-1 min-h-0" ref={parentRef}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-dev-border bg-dev-inset">
              {result.columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-1.5 text-dev-text-secondary font-medium whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beforeSize > 0 && (
              <tr>
                <td style={{ height: beforeSize }} colSpan={result.columns.length} />
              </tr>
            )}
            {virtualItems.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <tr
                  key={virtualRow.index}
                  className="border-b border-dev-border/50 hover:bg-dev-surface/50"
                >
                  {row.map((cell, cellIndex) => {
                    const text = cell === null ? "NULL" : String(cell)
                    const columnName = result.columns[cellIndex]
                    return (
                      <td
                        key={cellIndex}
                        className={clsx(
                          "px-3 py-1 whitespace-nowrap font-mono text-xs max-w-80 truncate cursor-pointer",
                          cell === null
                            ? "text-dev-text-secondary italic"
                            : "text-dev-text",
                        )}
                        onClick={() => setDialogCell({ columnName, value: text })}
                      >
                        {text}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {afterSize > 0 && (
              <tr>
                <td style={{ height: afterSize }} colSpan={result.columns.length} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-1.5 text-xs text-dev-text-secondary border-t border-dev-border shrink-0">
        {rows.length} row{rows.length !== 1 ? "s" : ""}
      </div>
      {dialogCell && (
        <CellDialog
          columnName={dialogCell.columnName}
          value={dialogCell.value}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}

export default ResultTable
