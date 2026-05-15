"use client"

import clsx from "clsx"
import { Upload, X } from "lucide-react"
import type { FC } from "react"
import type { TableInfo } from "./types"

type TableSidebarProps = {
  fileName: string | null
  tables: TableInfo[]
  selectedTable: string | null
  onSelectTable: (name: string) => void
  onOpenFilePicker: () => void
  onCloseDb: () => void
}

const TableSidebar: FC<TableSidebarProps> = ({
  fileName,
  tables,
  selectedTable,
  onSelectTable,
  onOpenFilePicker,
  onCloseDb,
}) => (
  <div className="w-56 shrink-0 flex flex-col border-r border-dev-border bg-dev-inset">
    <div className="flex items-center justify-between px-3 py-2 border-b border-dev-border">
      <span
        className="text-xs text-dev-text-secondary truncate"
        title={fileName ?? ""}
      >
        {fileName}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="p-1 rounded hover:bg-dev-button transition-colors cursor-pointer text-dev-text-secondary"
          onClick={onOpenFilePicker}
          title="Open a different database"
        >
          <Upload size={14} />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-dev-button transition-colors cursor-pointer text-dev-text-secondary"
          onClick={onCloseDb}
          title="Close database"
        >
          <X size={14} />
        </button>
      </div>
    </div>
    <div className="px-3 py-1.5 border-b border-dev-border">
      <span className="text-xs text-dev-text-secondary uppercase tracking-wider">
        Tables ({tables.length})
      </span>
    </div>
    <div className="flex-1 overflow-auto">
      {tables.map((table) => (
        <button
          key={table.name}
          type="button"
          className={clsx(
            "w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors flex items-center justify-between gap-2",
            selectedTable === table.name
              ? "bg-dev-border text-dev-text"
              : "text-dev-text-secondary hover:text-dev-text hover:bg-dev-surface",
          )}
          onClick={() => onSelectTable(table.name)}
        >
          <span className="truncate">{table.name}</span>
          <span className="text-xs text-dev-text-secondary shrink-0">
            {table.rowCount.toLocaleString()}
          </span>
        </button>
      ))}
    </div>
  </div>
)

export default TableSidebar
