import { useCallback, useEffect, useRef, useState } from "react"
import initSqlJs from "sql.js"
import type { DbState } from "./types"

export function useSqlJs() {
  const [error, setError] = useState<string | null>(null)
  const sqlJsRef = useRef<Awaited<ReturnType<typeof initSqlJs>> | null>(null)

  useEffect(() => {
    initSqlJs({ locateFile: () => "/sql-wasm.wasm" })
      .then((SQL) => {
        sqlJsRef.current = SQL
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load SQLite WASM",
        )
      })
  }, [])

  const buildDbState = useCallback(
    (file: File): Promise<DbState> =>
      new Promise((resolve) => {
        if (!sqlJsRef.current) {
          resolve({
            phase: "error",
            message: "SQLite WASM not loaded yet",
          })
          return
        }
        if (error) {
          resolve({ phase: "error", message: error })
          return
        }

        const reader = new FileReader()
        reader.onload = () => {
          try {
            const SQL = sqlJsRef.current!
            const db = new SQL.Database(
              new Uint8Array(reader.result as ArrayBuffer),
            )
            const tableRows = db.exec(
              "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
            )
            const tableNames: string[] =
              tableRows[0]?.values.map((row) => row[0] as string) ?? []
            const tables = tableNames.map((name) => ({
              name,
              rowCount: 0,
            }))
            resolve({ phase: "ready", db, tables })
          } catch (err: unknown) {
            resolve({
              phase: "error",
              message:
                err instanceof Error ? err.message : "Failed to open database",
            })
          }
        }
        reader.onerror = () => {
          resolve({ phase: "error", message: "Failed to read file" })
        }
        reader.readAsArrayBuffer(file)
      }),
    [error],
  )

  return { buildDbState }
}
