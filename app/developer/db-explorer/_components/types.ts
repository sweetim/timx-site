import type { SqlValue } from "sql.js"

export type TableInfo = {
  name: string
  columns: string[]
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
  | { phase: "ready"; tables: TableInfo[] }
  | { phase: "error"; message: string }

export const PAGE_SIZE = 100
