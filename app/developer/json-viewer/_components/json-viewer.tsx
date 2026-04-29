"use client"

import clsx from "clsx"
import { AlignLeft, Eraser, Minimize2, Pilcrow, Unlink2 } from "lucide-react"
import { type FC, useCallback, useMemo, useState } from "react"
import { match, P } from "ts-pattern"

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

function renderWhitespace(value: string): React.ReactNode {
  const tokens: React.ReactNode[] = []
  let charIndex = 0
  for (const char of value) {
    const key = `ws-${charIndex++}`
    if (char === " ")
      tokens.push(
        <span
          key={key}
          className="text-dev-text-secondary"
        >
          ·
        </span>,
      )
    else if (char === "\t")
      tokens.push(
        <span
          key={key}
          className="text-dev-text-secondary"
        >
          →
        </span>,
      )
    else tokens.push(char)
  }
  return tokens
}

type JsonTreeNodeProps = {
  label?: string
  value: JsonValue
  depth: number
}

const JsonTreeNode: FC<JsonTreeNodeProps> = ({ label, value, depth }) => {
  const [collapsed, setCollapsed] = useState(depth > 2)

  const labelElement =
    label !== undefined ? (
      <>
        <span className="text-dev-syntax-property">
          {JSON.stringify(label)}
        </span>
        <span className="text-dev-syntax-punctuation">: </span>
      </>
    ) : null

  if (value !== null && typeof value === "object") {
    const isArr = Array.isArray(value)
    const entries: [string, JsonValue][] = isArr
      ? value.map((v, i) => [String(i), v])
      : Object.entries(value)
    const bracketOpen = isArr ? "[" : "{"
    const bracketClose = isArr ? "]" : "}"
    const summary = isArr ? `${entries.length} items` : `${entries.length} keys`

    return (
      <div>
        <button
          type="button"
          style={{ paddingLeft: depth * 20 }}
          className="no-bounce cursor-pointer hover:bg-dev-inset inline-flex w-full text-left"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          <span className="text-dev-text-secondary select-none mr-1 w-3 inline-block">
            {collapsed ? "▶" : "▼"}
          </span>
          {labelElement}
          <span className="text-dev-syntax-punctuation">{bracketOpen}</span>
          {!collapsed && entries.length > 0 && (
            <span className="text-dev-text-secondary ml-1">{summary}</span>
          )}
          {collapsed && (
            <span className="text-dev-text-secondary ml-1">{bracketClose}</span>
          )}
        </button>
        {!collapsed && (
          <div>
            {entries.map(([key, val]) => (
              <JsonTreeNode
                key={key}
                label={isArr ? undefined : key}
                value={val}
                depth={depth + 1}
              />
            ))}
            <div style={{ paddingLeft: depth * 20 }}>
              <span className="text-dev-syntax-punctuation">
                {bracketClose}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return match(value as JsonPrimitive)
    .with(null, () => (
      <div style={{ paddingLeft: depth * 20 }}>
        {labelElement}
        <span className="text-dev-syntax-null">null</span>
      </div>
    ))
    .with(P.boolean, (value) => (
      <div style={{ paddingLeft: depth * 20 }}>
        {labelElement}
        <span className="text-dev-syntax-boolean">{value.toString()}</span>
      </div>
    ))
    .with(P.number, (value) => (
      <div style={{ paddingLeft: depth * 20 }}>
        {labelElement}
        <span className="text-dev-syntax-number">{value}</span>
      </div>
    ))
    .with(P.string, (value) => (
      <div style={{ paddingLeft: depth * 20 }}>
        {labelElement}
        <span className="text-dev-syntax-string">
          {'"'}
          {renderWhitespace(value)}
          {'"'}
        </span>
      </div>
    ))
    .exhaustive()
}

const SAMPLE_JSON = JSON.stringify(
  {
    name: "Developer Tools",
    description: "A suite of tools\tfor developers.\nTry editing this JSON!",
    version: 1,
    features: ["json-viewer", "formatter", "validator"],
    config: {
      theme: "dark",
      indent: 2,
      autoFormat: true,
    },
    multiline: "line one\nline two\r\nline three",
    metadata: null,
  },
  null,
  2,
)

const JsonViewer: FC = () => {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [showWhitespace, setShowWhitespace] = useState(true)

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: null }
    try {
      const value = JSON.parse(input) as JsonValue
      return { parsed: value, error: null }
    } catch (error) {
      return {
        parsed: null,
        error: match(error)
          .with(P.instanceOf(Error), (error) => error.message)
          .otherwise(() => "Invalid JSON"),
      }
    }
  }, [input])

  const handleFormat = useCallback(() => {
    if (!parsed) return
    setInput(JSON.stringify(parsed, null, 2))
  }, [parsed])

  const handleMinify = useCallback(() => {
    if (!parsed) return
    setInput(JSON.stringify(parsed))
  }, [parsed])

  const handleClear = useCallback(() => {
    setInput("")
  }, [])

  const handleUnescape = useCallback(() => {
    if (!parsed) return

    function unescapeJson(value: JsonValue): JsonValue {
      if (value !== null && typeof value === "object") {
        if (Array.isArray(value)) {
          return value.map(unescapeJson)
        }
        const result: { [key: string]: JsonValue } = {}
        for (const [key, val] of Object.entries(value)) {
          result[key] = unescapeJson(val)
        }
        return result
      }
      if (typeof value === "string") {
        try {
          const unescaped = JSON.parse(value) as JsonValue
          if (unescaped !== null && typeof unescaped === "object") {
            return unescapeJson(unescaped)
          }
        } catch {
          // not valid JSON, return original string
        }
      }
      return value
    }

    const result = unescapeJson(parsed)
    setInput(JSON.stringify(result, null, 2))
  }, [parsed])

  return (
    <div className="flex flex-col h-full bg-dev-canvas text-dev-text">
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-dev-border">
        <h1 className="text-sm font-medium leading-relaxed text-dev-text-secondary truncate min-w-0 shrink">
          Paste JSON to validate, format, minify, unescape nested strings, and
          inspect data in a collapsible tree.
        </h1>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            className={clsx(
              "p-1.5 sm:px-3 sm:py-1 text-sm rounded transition-colors cursor-pointer",
              "inline-flex items-center gap-1.5",
              showWhitespace
                ? "bg-dev-accent-blue text-white"
                : "bg-dev-button hover:bg-dev-button-hover text-dev-text",
            )}
            onClick={() => setShowWhitespace((v) => !v)}
          >
            <Pilcrow size={14} />
            <span className="hidden sm:inline">Whitespace</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 text-sm rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={handleFormat}
            disabled={!parsed}
          >
            <AlignLeft size={14} />
            <span className="hidden sm:inline">Format</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 text-sm rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={handleUnescape}
            disabled={!parsed}
          >
            <Unlink2 size={14} />
            <span className="hidden sm:inline">Unescape</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 text-sm rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={handleMinify}
            disabled={!parsed}
          >
            <Minimize2 size={14} />
            <span className="hidden sm:inline">Minify</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 text-sm rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={handleClear}
          >
            <Eraser size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-dev-border">
          <div className="px-3 py-2 text-xs text-dev-text-secondary uppercase tracking-wider border-b border-dev-border">
            Input
          </div>
          <div className="relative flex-1 overflow-hidden">
            <textarea
              aria-label="JSON input"
              className={clsx(
                "absolute inset-0 p-4 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed w-full h-full z-10",
                error
                  ? "text-dev-accent-red"
                  : showWhitespace
                    ? "text-transparent caret-dev-text"
                    : "text-dev-text",
              )}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              spellCheck={false}
            />
            {showWhitespace && (
              <pre
                className={clsx(
                  "absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-auto w-full h-full pointer-events-none",
                  error ? "text-dev-accent-red" : "text-dev-text",
                )}
                aria-hidden="true"
              >
                {renderWhitespace(input)}
              </pre>
            )}
          </div>
        </div>
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="px-3 py-2 text-xs text-dev-text-secondary uppercase tracking-wider border-b border-dev-border">
            Tree View
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
            {error && (
              <div className="text-dev-accent-red bg-dev-accent-red/10 rounded p-3 mb-3 text-xs">
                {error}
              </div>
            )}
            {parsed !== null && !error && (
              <JsonTreeNode
                value={parsed}
                depth={0}
              />
            )}
            {!parsed && !error && (
              <span className="text-dev-text-secondary">No data</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JsonViewer
