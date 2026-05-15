"use client"

import { Play } from "lucide-react"
import { type FC, useCallback } from "react"

type QueryEditorProps = {
  query: string
  onQueryChange: (query: string) => void
  onRunQuery: () => void
}

const QueryEditor: FC<QueryEditorProps> = ({
  query,
  onQueryChange,
  onRunQuery,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        onRunQuery()
      }
    },
    [onRunQuery],
  )

  return (
    <div className="border-b border-dev-border p-3">
      <div className="flex items-start gap-2">
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-dev-inset text-dev-text font-mono text-sm p-2 rounded border border-dev-border resize-none outline-none min-h-20"
          placeholder="SELECT * FROM table_name"
          spellCheck={false}
          rows={3}
        />
        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-dev-accent-blue text-white text-sm hover:opacity-90 transition-opacity cursor-pointer"
          onClick={onRunQuery}
        >
          <Play size={14} />
          Run
        </button>
      </div>
      <div className="text-xs text-dev-text-secondary mt-1">
        Ctrl+Enter to run
      </div>
    </div>
  )
}

export default QueryEditor
