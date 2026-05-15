"use client"

import { type FC, useCallback, useEffect, useRef, useState } from "react"
import type { Database as SqlJsDatabase } from "sql.js"
import { match } from "ts-pattern"
import EmptyState from "./empty-state"
import QueryEditor from "./query-editor"
import ResultView from "./result-view"
import TableSidebar from "./table-sidebar"
import type { DbState, QueryResult } from "./types"
import { PAGE_SIZE } from "./types"
import { useRecentFiles } from "./use-recent-files"
import { useSqlJs } from "./use-sql-js"

const DbExplorer: FC = () => {
  const [dbState, setDbState] = useState<DbState>({ phase: "empty" })
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<QueryResult | null>(null)
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState<QueryResult | string | null>(
    null,
  )
  const [page, setPage] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { buildDbState } = useSqlJs()
  const { recentFiles, addRecentFile, removeRecentFile } = useRecentFiles()

  const dbRef = useRef<SqlJsDatabase | null>(null)
  const abortCountRef = useRef(false)

  useEffect(() => {
    dbRef.current = dbState.phase === "ready" ? dbState.db : null
  }, [dbState])

  useEffect(() => {
    return () => {
      dbRef.current?.close()
    }
  }, [])

  const loadDb = useCallback(
    (file: File) => {
      abortCountRef.current = true
      dbRef.current?.close()

      setDbState({ phase: "loading" })
      setFileName(file.name)
      setSelectedTable(null)
      setTableData(null)
      setQueryResult(null)
      setPage(0)

      addRecentFile(file.name, file.size)

      buildDbState(file).then((state) => {
        setDbState(state)

        if (state.phase === "ready") {
          abortCountRef.current = false
          const { db, tables } = state
          const tableNames = tables.map((t) => t.name)

          const countNext = (index: number) => {
            if (abortCountRef.current || index >= tableNames.length) return
            try {
              const name = tableNames[index]
              const countResult = db.exec(`SELECT COUNT(*) FROM "${name}"`)
              const rowCount = (countResult[0]?.values[0]?.[0] as number) ?? 0
              setDbState((prev) => {
                if (prev.phase !== "ready") return prev
                const updated = [...prev.tables]
                updated[index] = { ...updated[index], rowCount }
                return { ...prev, tables: updated }
              })
            } catch {
              return
            }
            setTimeout(() => countNext(index + 1), 0)
          }

          setTimeout(() => countNext(0), 0)
        }
      })
    },
    [buildDbState, addRecentFile],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadDb(file)
    },
    [loadDb],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) loadDb(file)
    },
    [loadDb],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const selectTable = useCallback(
    (name: string) => {
      if (dbState.phase !== "ready") return
      const db = dbState.db
      setSelectedTable(name)
      setPage(0)
      setQueryResult(null)
      setQuery(`SELECT * FROM "${name}"`)

      const result = db.exec(
        `SELECT * FROM "${name}" LIMIT ${PAGE_SIZE} OFFSET 0`,
      )
      if (result[0]) {
        setTableData({ columns: result[0].columns, rows: result[0].values })
      } else {
        setTableData(null)
      }
    },
    [dbState],
  )

  const loadPage = useCallback(
    (newPage: number) => {
      if (dbState.phase !== "ready" || !selectedTable) return
      const db = dbState.db
      const offset = newPage * PAGE_SIZE
      setPage(newPage)

      const result = db.exec(
        `SELECT * FROM "${selectedTable}" LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      )
      if (result[0]) {
        setTableData({ columns: result[0].columns, rows: result[0].values })
      } else {
        setTableData(null)
      }
    },
    [dbState, selectedTable],
  )

  const runQuery = useCallback(() => {
    if (dbState.phase !== "ready" || !query.trim()) return
    const db = dbState.db

    try {
      const result = db.exec(query)
      if (result[0]) {
        setQueryResult({
          columns: result[0].columns,
          rows: result[0].values,
        })
      } else {
        setQueryResult("Query executed. No results returned.")
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Query execution failed"
      setQueryResult(message)
    }
  }, [dbState, query])

  const closeDb = useCallback(() => {
    abortCountRef.current = true
    if (dbState.phase === "ready") {
      dbState.db.close()
    }
    setDbState({ phase: "empty" })
    setFileName(null)
    setSelectedTable(null)
    setTableData(null)
    setQueryResult(null)
    setQuery("")
    setPage(0)
  }, [dbState])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="flex flex-col h-full bg-dev-canvas text-dev-text">
      <input
        ref={fileInputRef}
        type="file"
        accept=".db,.sqlite,.sqlite3"
        className="hidden"
        onChange={handleFileChange}
      />
      {match(dbState)
        .with({ phase: "empty" }, () => (
          <EmptyState
            recentFiles={recentFiles}
            onRemoveRecent={removeRecentFile}
            onOpenFilePicker={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        ))
        .with({ phase: "loading" }, () => (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-dev-text-secondary">Loading database...</div>
          </div>
        ))
        .with({ phase: "error" }, ({ message }) => (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-dev-accent-red mb-2">Error: {message}</div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
                onClick={() => {
                  setDbState({ phase: "empty" })
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        ))
        .with({ phase: "ready" }, ({ tables }) => (
          <div className="flex flex-1 overflow-hidden">
            <TableSidebar
              fileName={fileName}
              tables={tables}
              selectedTable={selectedTable}
              onSelectTable={selectTable}
              onOpenFilePicker={openFilePicker}
              onCloseDb={closeDb}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <QueryEditor
                query={query}
                onQueryChange={setQuery}
                onRunQuery={runQuery}
              />
              <ResultView
                queryResult={queryResult}
                tableData={tableData}
                selectedTable={selectedTable}
                tables={tables}
                page={page}
                onLoadPage={loadPage}
              />
            </div>
          </div>
        ))
        .exhaustive()}
    </div>
  )
}

export default DbExplorer
