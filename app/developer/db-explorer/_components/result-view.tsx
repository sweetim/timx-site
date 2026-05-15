"use client"

import { Loader2 } from "lucide-react"
import type { FC } from "react"
import { match, P } from "ts-pattern"
import Pagination from "./pagination"
import ResultTable from "./result-table"
import type { QueryResult, TableInfo } from "./types"
import { PAGE_SIZE } from "./types"

type ResultViewProps = {
  queryResult: QueryResult | string | null
  queryRunning: boolean
  tableData: QueryResult | null
  tableLoading: boolean
  selectedTable: string | null
  tables: TableInfo[]
  page: number
  onLoadPage: (page: number) => void
}

function getPagination(
  selectedTable: string | null,
  tables: TableInfo[],
  page: number,
): { currentPage: number; totalPages: number } | null {
  if (!selectedTable) return null
  const table = tables.find((t) => t.name === selectedTable)
  if (!table || table.rowCount <= PAGE_SIZE) return null
  return {
    currentPage: page,
    totalPages: Math.ceil(table.rowCount / PAGE_SIZE),
  }
}

const ResultView: FC<ResultViewProps> = ({
  queryResult,
  queryRunning,
  tableData,
  tableLoading,
  selectedTable,
  tables,
  page,
  onLoadPage,
}) => {
  const pagination = getPagination(selectedTable, tables, page)

  const isLoading = queryRunning || tableLoading

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {match({ isLoading, queryResult, tableData })
        .with({ isLoading: true }, () => (
          <div className="flex items-center justify-center h-full text-dev-text-secondary text-sm gap-2">
            <Loader2 size={16} className="animate-spin" />
            {queryRunning ? "Running query…" : "Loading…"}
          </div>
        ))
        .with({ queryResult: P.string }, ({ queryResult }) => (
          <div className="p-4 text-sm text-dev-text-secondary">
            {queryResult}
          </div>
        ))
        .with(
          { queryResult: P.when((r): r is QueryResult => r !== null && typeof r !== "string") },
          ({ queryResult }) => (
            <ResultTable result={queryResult} />
          ),
        )
        .with({ tableData: P.nonNullable }, ({ tableData }) => (
          <>
            <ResultTable result={tableData} />
            {pagination && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onLoadPage}
              />
            )}
          </>
        ))
        .otherwise(() => (
          <div className="flex items-center justify-center h-full text-dev-text-secondary text-sm">
            Select a table from the sidebar
          </div>
        ))}
    </div>
  )
}

export default ResultView
