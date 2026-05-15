"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import clsx from "clsx"
import { type FC, useCallback, useRef, useState } from "react"
import CellDialog from "./cell-dialog"
import type { QueryResult } from "./types"

const ROW_HEIGHT = 29

type ResultTableProps = {
  result: QueryResult
}

const ResultTable: FC<ResultTableProps> = ({ result }) => {
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
      <div
        className="overflow-auto flex-1 min-h-0"
        ref={parentRef}
      >
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
                <td
                  style={{ height: beforeSize }}
                  colSpan={result.columns.length}
                />
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
                    const openCell = () =>
                      setDialogCell({ columnName, value: text })
                    return (
                      <td
                        key={columnName}
                        className={clsx(
                          "px-3 py-1 whitespace-nowrap font-mono text-xs max-w-80 truncate",
                          cell === null
                            ? "text-dev-text-secondary italic"
                            : "text-dev-text",
                        )}
                      >
                        <button
                          type="button"
                          className="cursor-pointer text-left w-full"
                          onClick={openCell}
                        >
                          {text}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {afterSize > 0 && (
              <tr>
                <td
                  style={{ height: afterSize }}
                  colSpan={result.columns.length}
                />
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
