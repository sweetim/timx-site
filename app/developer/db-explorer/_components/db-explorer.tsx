"use client"

import { type FC, type ReactNode, useCallback, useReducer, useRef } from "react"
import { match } from "ts-pattern"
import {
  dbExplorerReducer,
  initialDbExplorerState,
} from "./db-explorer-reducer"
import EmptyState from "./empty-state"
import QueryEditor from "./query-editor"
import ResultView from "./result-view"
import TableSidebar from "./table-sidebar"
import { escapeSqlIdentifier, PAGE_SIZE } from "./types"
import useDbWorker from "./use-db-worker"
import { loadFileFromHandle, useFileHandles } from "./use-file-handle"

const isFileSystemAccessSupported =
  typeof window !== "undefined" && "showOpenFilePicker" in window

const DbExplorer: FC<{ landingContent: ReactNode }> = ({ landingContent }) => {
  const [state, dispatch] = useReducer(
    dbExplorerReducer,
    initialDbExplorerState,
  )
  const {
    dbState,
    selectedTable,
    tableData,
    tableLoading,
    query,
    queryResult,
    queryRunning,
    page,
    fileName,
  } = state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef(0)

  const { recentFiles, addHandle, removeHandle, refreshFiles } =
    useFileHandles()

  const {
    initDb,
    execQuery,
    getTablePage,
    closeDb: closeDbWorker,
  } = useDbWorker({
    onCountUpdate: (index, rowCount) =>
      dispatch({ type: "UPDATE_TABLE_COUNT", index, rowCount }),
  })

  const loadDb = useCallback(
    (file: File) => {
      dispatch({ type: "LOAD_START", fileName: file.name })

      initDb(file)
        .then(({ tables }) => {
          dispatch({ type: "LOAD_READY", tables })
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Failed to open database"
          dispatch({ type: "LOAD_ERROR", message })
        })
    },
    [initDb],
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
      const queryStr = `SELECT * FROM ${escapeSqlIdentifier(name)}`
      dispatch({
        type: "SELECT_TABLE",
        name,
        tableData: null,
        query: queryStr,
      })
      const requestId = ++requestIdRef.current
      getTablePage(name, PAGE_SIZE, 0).then((result) => {
        if (result && requestId === requestIdRef.current) {
          dispatch({
            type: "SELECT_TABLE",
            name,
            tableData: result,
            query: queryStr,
          })
        }
      })
    },
    [dbState, getTablePage],
  )

  const loadPage = useCallback(
    (newPage: number) => {
      if (dbState.phase !== "ready" || !selectedTable) return
      dispatch({
        type: "SET_PAGE",
        page: newPage,
        tableData: null,
      })
      const requestId = ++requestIdRef.current
      getTablePage(selectedTable, PAGE_SIZE, newPage * PAGE_SIZE).then(
        (result) => {
          if (requestId === requestIdRef.current) {
            dispatch({ type: "SET_PAGE", page: newPage, tableData: result })
          }
        },
      )
    },
    [dbState, selectedTable, getTablePage],
  )

  const runQuery = useCallback(() => {
    if (dbState.phase !== "ready" || !query.trim() || queryRunning) return

    dispatch({ type: "SET_QUERY_RUNNING", running: true })

    execQuery(query)
      .then((result) => {
        dispatch({ type: "SET_QUERY_RESULT", result })
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Query execution failed"
        dispatch({ type: "SET_QUERY_RESULT", result: message })
      })
  }, [dbState, query, queryRunning, execQuery])

  const closeDb = useCallback(() => {
    closeDbWorker().catch(() => {})
    dispatch({ type: "RESET" })
  }, [closeDbWorker])

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
            landingContent={landingContent}
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
                queryRunning={queryRunning}
                onQueryChange={setQuery}
                onRunQuery={runQuery}
              />
              <ResultView
                queryResult={queryResult}
                queryRunning={queryRunning}
                tableData={tableData}
                tableLoading={tableLoading}
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
