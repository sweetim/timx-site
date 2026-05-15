import { match } from "ts-pattern"
import type { DbState, QueryResult, TableInfo } from "./types"

export type DbExplorerState = {
  dbState: DbState
  selectedTable: string | null
  tableData: QueryResult | null
  tableLoading: boolean
  query: string
  queryResult: QueryResult | string | null
  queryRunning: boolean
  page: number
  fileName: string | null
}

export const initialDbExplorerState: DbExplorerState = {
  dbState: { phase: "empty" },
  selectedTable: null,
  tableData: null,
  tableLoading: false,
  query: "",
  queryResult: null,
  queryRunning: false,
  page: 0,
  fileName: null,
}

export type DbExplorerAction =
  | { type: "LOAD_START"; fileName: string }
  | { type: "LOAD_READY"; tables: TableInfo[] }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "UPDATE_TABLE_COUNT"; index: number; rowCount: number }
  | { type: "SELECT_TABLE"; name: string; tableData: QueryResult | null; query: string }
  | { type: "SET_PAGE"; page: number; tableData: QueryResult | null }
  | { type: "SET_QUERY"; query: string }
  | { type: "SET_QUERY_RUNNING"; running: boolean }
  | { type: "SET_QUERY_RESULT"; result: QueryResult | string | null }
  | { type: "RESET" }

export function dbExplorerReducer(
  state: DbExplorerState,
  action: DbExplorerAction,
): DbExplorerState {
  return match(action)
    .with({ type: "LOAD_START" }, ({ fileName }) => ({
      ...initialDbExplorerState,
      dbState: { phase: "loading" } as DbState,
      fileName,
    }))
    .with({ type: "LOAD_READY" }, ({ tables }) => ({
      ...state,
      dbState: { phase: "ready" as const, tables },
    }))
    .with({ type: "LOAD_ERROR" }, ({ message }) => ({
      ...initialDbExplorerState,
      dbState: { phase: "error" as const, message },
    }))
    .with({ type: "UPDATE_TABLE_COUNT" }, ({ index, rowCount }) => {
      if (state.dbState.phase !== "ready") return state
      const tables = [...state.dbState.tables]
      if (index < 0 || index >= tables.length) return state
      tables[index] = { ...tables[index], rowCount }
      return {
        ...state,
        dbState: { ...state.dbState, tables },
      }
    })
    .with({ type: "SELECT_TABLE" }, ({ name, tableData, query }) => ({
      ...state,
      selectedTable: name,
      page: 0,
      queryResult: null,
      query,
      tableData,
      tableLoading: tableData === null,
    }))
    .with({ type: "SET_PAGE" }, ({ page, tableData }) => ({
      ...state,
      page,
      tableData,
      tableLoading: tableData === null,
    }))
    .with({ type: "SET_QUERY" }, ({ query }) => ({
      ...state,
      query,
    }))
    .with({ type: "SET_QUERY_RUNNING" }, ({ running }) => ({
      ...state,
      queryRunning: running,
    }))
    .with({ type: "SET_QUERY_RESULT" }, ({ result }) => ({
      ...state,
      queryResult: result,
      queryRunning: false,
    }))
    .with({ type: "RESET" }, () => ({
      ...initialDbExplorerState,
    }))
    .exhaustive()
}
