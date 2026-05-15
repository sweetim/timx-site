import initSqlJs, { type Database } from "sql.js"

type WorkerRequest =
  | { id: string; type: "init"; buffer: ArrayBuffer }
  | { id: string; type: "exec"; sql: string }
  | {
      id: string
      type: "getTablePage"
      table: string
      limit: number
      offset: number
    }
  | { id: string; type: "close" }

type WorkerResponse =
  | { id: string; type: "result"; payload: unknown }
  | { id: string; type: "error"; message: string }
  | { type: "countUpdate"; index: number; rowCount: number }

let db: Database | null = null

function escapeSqlIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

function getTableColumns(database: Database, tableName: string): string[] {
  const columnRows = database.exec(
    `PRAGMA table_info(${escapeSqlIdentifier(tableName)})`,
  )
  return columnRows[0]?.values.map((row) => row[1] as string) ?? []
}

function send(response: WorkerResponse): void {
  self.postMessage(response)
}

async function ensureSqlJs(): Promise<ReturnType<typeof initSqlJs>> {
  const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" })
  return SQL
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data

  if (msg.type === "init") {
    try {
      const SQL = await ensureSqlJs()
      const database = new SQL.Database(new Uint8Array(msg.buffer))
      db = database

      const tableRows = database.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      const tableNames: string[] =
        tableRows[0]?.values.map((row) => row[0] as string) ?? []
      const tables = tableNames.map((name) => ({
        name,
        columns: getTableColumns(database, name),
        rowCount: 0,
      }))

      send({ id: msg.id, type: "result", payload: { tables } })

      let index = 0
      const countNext = () => {
        if (!db || index >= tableNames.length) return
        try {
          const name = tableNames[index]
          const countResult = db.exec(
            `SELECT COUNT(*) FROM ${escapeSqlIdentifier(name)}`,
          )
          const rowCount =
            (countResult[0]?.values[0]?.[0] as number) ?? 0
          send({ type: "countUpdate", index, rowCount })
        } catch {
          // skip failed counts
        }
        index++
        setTimeout(countNext, 0)
      }
      setTimeout(countNext, 0)
    } catch (err: unknown) {
      send({
        id: msg.id,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to open database",
      })
    }
    return
  }

  if (!db) {
    send({ id: msg.id, type: "error", message: "No database loaded" })
    return
  }

  switch (msg.type) {
    case "exec": {
      try {
        const result = db.exec(msg.sql)
        if (result[0]) {
          send({
            id: msg.id,
            type: "result",
            payload: { columns: result[0].columns, rows: result[0].values },
          })
        } else {
          send({
            id: msg.id,
            type: "result",
            payload: "Query executed. No results returned.",
          })
        }
      } catch (err: unknown) {
        send({
          id: msg.id,
          type: "error",
          message: err instanceof Error ? err.message : "Query execution failed",
        })
      }
      break
    }

    case "getTablePage": {
      try {
        const result = db.exec(
          `SELECT * FROM ${escapeSqlIdentifier(msg.table)} LIMIT ${msg.limit} OFFSET ${msg.offset}`,
        )
        send({
          id: msg.id,
          type: "result",
          payload: result[0]
            ? { columns: result[0].columns, rows: result[0].values }
            : null,
        })
      } catch (err: unknown) {
        send({
          id: msg.id,
          type: "error",
          message: err instanceof Error ? err.message : "Query execution failed",
        })
      }
      break
    }

    case "close": {
      db.close()
      db = null
      send({ id: msg.id, type: "result", payload: null })
      break
    }
  }
}
