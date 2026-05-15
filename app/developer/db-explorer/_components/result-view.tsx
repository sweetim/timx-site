"use client"

import type { FC } from "react"
import ResultTable from "./result-table"
import type { QueryResult, TableInfo } from "./types"
import { PAGE_SIZE } from "./types"

type ResultViewProps = {
  queryResult: QueryResult | string | null
  tableData: QueryResult | null
  selectedTable: string | null
  tables: TableInfo[]
  page: number
  onLoadPage: (page: number) => void
}

const ResultView: FC<ResultViewProps> = ({
  queryResult,
  tableData,
  selectedTable,
  tables,
  page,
  onLoadPage,
}) => (
  <div className="flex-1 overflow-auto">
    {queryResult !== null ? (
      typeof queryResult === "string" ? (
        <div className="p-4 text-sm text-dev-text-secondary">{queryResult}</div>
      ) : (
        <ResultTable result={queryResult} />
      )
    ) : tableData ? (
      <>
        <ResultTable result={tableData} />
        {selectedTable
          && (() => {
            const table = tables.find((t) => t.name === selectedTable)
            if (!table || table.rowCount <= PAGE_SIZE) return null
            const totalPages = Math.ceil(table.rowCount / PAGE_SIZE)
            return (
              <div className="flex items-center justify-center gap-2 py-2 border-t border-dev-border text-sm text-dev-text-secondary">
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text disabled:opacity-40 disabled:cursor-default"
                  disabled={page === 0}
                  onClick={() => onLoadPage(page - 1)}
                >
                  Prev
                </button>
                <span>
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text disabled:opacity-40 disabled:cursor-default"
                  disabled={page >= totalPages - 1}
                  onClick={() => onLoadPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )
          })()}
      </>
    ) : (
      <div className="flex items-center justify-center h-full text-dev-text-secondary text-sm">
        Select a table from the sidebar
      </div>
    )}
  </div>
)

export default ResultView
