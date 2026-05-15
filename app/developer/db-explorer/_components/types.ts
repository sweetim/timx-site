import type { Database as SqlJsDatabase, SqlValue } from "sql.js"

export type TableInfo = {
  name: string
  rowCount: number
}

export type QueryResult = {
  columns: string[]
  rows: SqlValue[][]
}

export type RecentFile = {
  name: string
  size: number
  lastOpened: number
}

export type DbState =
  | { phase: "empty" }
  | { phase: "loading" }
  | { phase: "ready"; db: SqlJsDatabase; tables: TableInfo[] }
  | { phase: "error"; message: string }

export const PAGE_SIZE = 100
