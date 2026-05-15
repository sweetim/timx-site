"use client"

import { type FC, useCallback, useEffect, useRef, useReducer } from "react"
import type { Database as SqlJsDatabase } from "sql.js"
import { match } from "ts-pattern"
import { dbExplorerReducer, initialDbExplorerState } from "./db-explorer-reducer"
import EmptyState from "./empty-state"
import QueryEditor from "./query-editor"
import ResultView from "./result-view"
import TableSidebar from "./table-sidebar"
import type { QueryResult } from "./types"
import { PAGE_SIZE } from "./types"
import {
  loadFileFromHandle,
  useFileHandles,
} from "./use-file-handle"
import { useSqlJs } from "./use-sql-js"

const isFileSystemAccessSupported =
  typeof window !== "undefined" && "showOpenFilePicker" in window

function escapeSqlIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

function countTableRows(
  db: SqlJsDatabase,
  tableNames: string[],
  onUpdate: (index: number, rowCount: number) => void,
  aborted: () => boolean,
): void {
  const countNext = (index: number) => {
    if (aborted() || index >= tableNames.length) return
    try {
      const name = tableNames[index]
      const countResult = db.exec(
        `SELECT COUNT(*) FROM ${escapeSqlIdentifier(name)}`,
      )
      const rowCount = (countResult[0]?.values[0]?.[0] as number) ?? 0
      onUpdate(index, rowCount)
    } catch {
      return
    }
    setTimeout(() => countNext(index + 1), 0)
  }
  setTimeout(() => countNext(0), 0)
}

function execTableQuery(
  db: SqlJsDatabase,
  tableName: string,
  limit: number,
  offset: number,
): QueryResult | null {
  const result = db.exec(
    `SELECT * FROM ${escapeSqlIdentifier(tableName)} LIMIT ${limit} OFFSET ${offset}`,
  )
  if (result[0]) {
    return { columns: result[0].columns, rows: result[0].values }
  }
  return null
}

const DbExplorer: FC = () => {
  const [state, dispatch] = useReducer(
    dbExplorerReducer,
    initialDbExplorerState,
  )
  const {
    dbState,
    selectedTable,
    tableData,
    query,
    queryResult,
    page,
    fileName,
  } = state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortCountRef = useRef(false)
  const dbRef = useRef<SqlJsDatabase | null>(null)

  const { buildDbState } = useSqlJs()
  const { recentFiles, addHandle, removeHandle, refreshFiles } =
    useFileHandles()

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
      dispatch({ type: "LOAD_START", fileName: file.name })

      buildDbState(file).then((newDbState) => {
        if (newDbState.phase === "ready") {
          dispatch({
            type: "LOAD_READY",
            db: newDbState.db,
            tables: newDbState.tables,
          })
          abortCountRef.current = false
          countTableRows(
            newDbState.db,
            newDbState.tables.map((t) => t.name),
            (index, rowCount) =>
              dispatch({ type: "UPDATE_TABLE_COUNT", index, rowCount }),
            () => abortCountRef.current,
          )
        } else if (newDbState.phase === "error") {
          dispatch({ type: "LOAD_ERROR", message: newDbState.message })
        }
      })
    },
    [buildDbState],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadDb(file)
    },
    [loadDb],
  )

  const selectTable = useCallback(
    (name: string) => {
      if (dbState.phase !== "ready") return
      dispatch({
        type: "SELECT_TABLE",
        name,
        tableData: execTableQuery(dbState.db, name, PAGE_SIZE, 0),
        query: `SELECT * FROM ${escapeSqlIdentifier(name)}`,
      })
    },
    [dbState],
  )

  const loadPage = useCallback(
    (newPage: number) => {
      if (dbState.phase !== "ready" || !selectedTable) return
      dispatch({
        type: "SET_PAGE",
        page: newPage,
        tableData: execTableQuery(
          dbState.db,
          selectedTable,
          PAGE_SIZE,
          newPage * PAGE_SIZE,
        ),
      })
    },
    [dbState, selectedTable],
  )

  const runQuery = useCallback(() => {
    if (dbState.phase !== "ready" || !query.trim()) return

    try {
      const result = dbState.db.exec(query)
      if (result[0]) {
        dispatch({
          type: "SET_QUERY_RESULT",
          result: {
            columns: result[0].columns,
            rows: result[0].values,
          },
        })
      } else {
        dispatch({
          type: "SET_QUERY_RESULT",
          result: "Query executed. No results returned.",
        })
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Query execution failed"
      dispatch({ type: "SET_QUERY_RESULT", result: message })
    }
  }, [dbState, query])

  const closeDb = useCallback(() => {
    abortCountRef.current = true
    if (dbState.phase === "ready") {
      dbState.db.close()
    }
    dispatch({ type: "RESET" })
  }, [dbState])

  const openFilePicker = useCallback(async () => {
    if (isFileSystemAccessSupported) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: "SQLite databases",
              accept: {
                "application/x-sqlite3": [".db", ".sqlite", ".sqlite3"],
              },
            },
          ],
        })
        const file = await handle.getFile()
        loadDb(file)
        addHandle(handle).catch(() => {})
      } catch {}
    } else {
      fileInputRef.current?.click()
    }
  }, [addHandle, loadDb])

  const handleOpenRecent = useCallback(
    async (name: string) => {
      dispatch({ type: "LOAD_START", fileName: name })
      try {
        const file = await loadFileFromHandle(name)
        if (file) {
          await refreshFiles()
          loadDb(file)
        } else {
          dispatch({ type: "RESET" })
        }
      } catch {
        dispatch({ type: "RESET" })
      }
    },
    [loadDb, refreshFiles],
  )

  const setQuery = useCallback(
    (q: string) => dispatch({ type: "SET_QUERY", query: q }),
    [],
  )

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
            onRemoveRecent={removeHandle}
            onOpenRecent={handleOpenRecent}
            onOpenFilePicker={openFilePicker}
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
                  dispatch({ type: "RESET" })
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
                tables={tables}
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
