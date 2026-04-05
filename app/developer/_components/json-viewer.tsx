"use client"

import classNames from "classnames"
import { type FC, useCallback, useMemo, useState } from "react"

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
          className="text-[#484f58]"
        >
          ·
        </span>,
      )
    else if (char === "\t")
      tokens.push(
        <span
          key={key}
          className="text-[#484f58]"
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

  if (value === null) {
    return (
      <div style={{ paddingLeft: depth * 20 }}>
        {label !== undefined && (
          <span className="text-[#9CDCFE]">{JSON.stringify(label)}</span>
        )}
        {label !== undefined && <span className="text-[#D4D4D4]">: </span>}
        <span className="text-[#569CD6]">null</span>
      </div>
    )
  }

  if (typeof value === "boolean") {
    return (
      <div style={{ paddingLeft: depth * 20 }}>
        {label !== undefined && (
          <span className="text-[#9CDCFE]">{JSON.stringify(label)}</span>
        )}
        {label !== undefined && <span className="text-[#D4D4D4]">: </span>}
        <span className="text-[#569CD6]">{value.toString()}</span>
      </div>
    )
  }

  if (typeof value === "number") {
    return (
      <div style={{ paddingLeft: depth * 20 }}>
        {label !== undefined && (
          <span className="text-[#9CDCFE]">{JSON.stringify(label)}</span>
        )}
        {label !== undefined && <span className="text-[#D4D4D4]">: </span>}
        <span className="text-[#B5CEA8]">{value}</span>
      </div>
    )
  }

  if (typeof value === "string") {
    return (
      <div style={{ paddingLeft: depth * 20 }}>
        {label !== undefined && (
          <span className="text-[#9CDCFE]">{JSON.stringify(label)}</span>
        )}
        {label !== undefined && <span className="text-[#D4D4D4]">: </span>}
        <span className="text-[#CE9178]">
          {'"'}
          {renderWhitespace(value)}
          {'"'}
        </span>
      </div>
    )
  }

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
        className="cursor-pointer hover:bg-[#161b22] inline-flex w-full text-left"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="text-[#484f58] select-none mr-1 w-3 inline-block">
          {collapsed ? "▶" : "▼"}
        </span>
        {label !== undefined && (
          <span className="text-[#9CDCFE]">{JSON.stringify(label)}</span>
        )}
        {label !== undefined && <span className="text-[#D4D4D4]">: </span>}
        <span className="text-[#D4D4D4]">{bracketOpen}</span>
        {!collapsed && entries.length > 0 && (
          <span className="text-[#484f58] ml-1">{summary}</span>
        )}
        {collapsed && (
          <span className="text-[#484f58] ml-1">{bracketClose}</span>
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
            <span className="text-[#D4D4D4]">{bracketClose}</span>
          </div>
        </div>
      )}
    </div>
  )
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
  const [error, setError] = useState<string | null>(null)
  const [showWhitespace, setShowWhitespace] = useState(true)

  const parsed = useMemo(() => {
    if (!input.trim()) return null
    try {
      const value = JSON.parse(input) as JsonValue
      setError(null)
      return value
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
      return null
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
    setError(null)
  }, [])

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#e6edf3]">
      <div className="flex items-center justify-end px-4 py-2 border-b border-[#30363d]">
        <div className="flex gap-2">
          <button
            type="button"
            className={classNames(
              "px-3 py-1 text-sm rounded transition-colors",
              showWhitespace
                ? "bg-[#388bfd] text-white"
                : "bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9]",
            )}
            onClick={() => setShowWhitespace((v) => !v)}
          >
            Whitespace
          </button>
          <button
            type="button"
            className="px-3 py-1 text-sm rounded bg-[#21262d] hover:bg-[#30363d] transition-colors text-[#c9d1d9]"
            onClick={handleFormat}
            disabled={!parsed}
          >
            Format
          </button>
          <button
            type="button"
            className="px-3 py-1 text-sm rounded bg-[#21262d] hover:bg-[#30363d] transition-colors text-[#c9d1d9]"
            onClick={handleMinify}
            disabled={!parsed}
          >
            Minify
          </button>
          <button
            type="button"
            className="px-3 py-1 text-sm rounded bg-[#21262d] hover:bg-[#30363d] transition-colors text-[#c9d1d9]"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          <div className="px-3 py-2 text-xs text-[#8b949e] uppercase tracking-wider border-b border-[#30363d]">
            Input
          </div>
          <div className="relative flex-1 overflow-hidden">
            <textarea
              className={classNames(
                "absolute inset-0 p-4 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed w-full h-full",
                error ? "text-[#f85149]" : "text-[#c9d1d9]",
                showWhitespace && "opacity-0",
              )}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              spellCheck={false}
            />
            {showWhitespace && (
              <pre
                className={classNames(
                  "absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-auto w-full h-full pointer-events-none",
                  error ? "text-[#f85149]" : "text-[#c9d1d9]",
                )}
                aria-hidden="true"
              >
                {renderWhitespace(input)}
              </pre>
            )}
          </div>
        </div>
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="px-3 py-2 text-xs text-[#8b949e] uppercase tracking-wider border-b border-[#30363d]">
            Tree View
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
            {error && (
              <div className="text-[#f85149] bg-[#f85149]/10 rounded p-3 mb-3 text-xs">
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
              <span className="text-[#484f58]">No data</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JsonViewer
