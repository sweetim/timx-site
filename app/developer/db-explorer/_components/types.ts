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

export type DbAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_READY"; db: SqlJsDatabase; tables: TableInfo[] }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "UPDATE_TABLE_COUNT"; index: number; rowCount: number }
  | { type: "RESET" }

export const PAGE_SIZE = 100
export const STORAGE_KEY = "db-explorer-recent-files"
export const MAX_RECENT = 10
