"use client"

import type { FC } from "react"
import Pagination from "./pagination"
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
  tableData,
  selectedTable,
  tables,
  page,
  onLoadPage,
}) => {
  const pagination = getPagination(selectedTable, tables, page)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {queryResult !== null ? (
        typeof queryResult === "string" ? (
          <div className="p-4 text-sm text-dev-text-secondary">
            {queryResult}
          </div>
        ) : (
          <ResultTable result={queryResult} />
        )
      ) : tableData ? (
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
      ) : (
        <div className="flex items-center justify-center h-full text-dev-text-secondary text-sm">
          Select a table from the sidebar
        </div>
      )}
    </div>
  )
}

export default ResultView
