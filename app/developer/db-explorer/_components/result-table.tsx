"use client"

import clsx from "clsx"
import type { FC } from "react"
import type { QueryResult } from "./types"

type ResultTableProps = {
  result: QueryResult
}

const ResultTable: FC<ResultTableProps> = ({ result }) => {
  const rows = result.rows.map((row) =>
    row.map((v) => (v === null ? "NULL" : String(v))),
  )

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
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
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-dev-border/50 hover:bg-dev-surface/50"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={clsx(
                    "px-3 py-1 whitespace-nowrap font-mono text-xs max-w-80 truncate",
                    cell === "NULL"
                      ? "text-dev-text-secondary italic"
                      : "text-dev-text",
                  )}
                  title={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-1.5 text-xs text-dev-text-secondary border-t border-dev-border">
        {rows.length} row{rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}

export default ResultTable
