import { useCallback, useEffect, useRef } from "react"
import type { QueryResult, TableInfo } from "./types"

type WorkerResult =
  | { id: string; type: "result"; payload: unknown }
  | { id: string; type: "error"; message: string }
  | { type: "countUpdate"; index: number; rowCount: number }

type PendingRequest = {
  resolve: (payload: unknown) => void
  reject: (message: string) => void
}

type UseDbWorkerOptions = {
  onCountUpdate?: (index: number, rowCount: number) => void
}

function useDbWorker(options?: UseDbWorkerOptions) {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map())
  const idCounterRef = useRef(0)
  const onCountUpdateRef = useRef(options?.onCountUpdate)

  useEffect(() => {
    onCountUpdateRef.current = options?.onCountUpdate
  }, [options?.onCountUpdate])

  useEffect(() => {
    const worker = new Worker(
      new URL("./db-worker.ts", import.meta.url),
    )

    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      const msg = event.data

      if (msg.type === "countUpdate") {
        onCountUpdateRef.current?.(msg.index, msg.rowCount)
        return
      }

      const pending = pendingRef.current.get(msg.id)
      if (!pending) return
      pendingRef.current.delete(msg.id)

      if (msg.type === "result") {
        pending.resolve(msg.payload)
      } else {
        pending.reject(msg.message)
      }
    }

    worker.onerror = (event: ErrorEvent) => {
      console.error("DB worker error:", event.message)
    }

    workerRef.current = worker

    return () => {
      worker.terminate()
      workerRef.current = null
      for (const pending of pendingRef.current.values()) {
        pending.reject("Worker terminated")
      }
      pendingRef.current.clear()
    }
  }, [])

  const send = useCallback(
    (message: { type: string; [key: string]: unknown }): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject("Worker not initialized")
          return
        }
        const id = String(++idCounterRef.current)
        pendingRef.current.set(id, { resolve, reject })
        workerRef.current.postMessage({ ...message, id })
      })
    },
    [],
  )

  const initDb = useCallback(
    async (file: File): Promise<{ tables: TableInfo[] }> => {
      const buffer = await file.arrayBuffer()
      return send({ type: "init", buffer }) as Promise<{
        tables: TableInfo[]
      }>
    },
    [send],
  )

  const execQuery = useCallback(
    async (
      sql: string,
    ): Promise<QueryResult | string> => {
      return send({ type: "exec", sql }) as Promise<QueryResult | string>
    },
    [send],
  )

  const getTablePage = useCallback(
    async (
      table: string,
      limit: number,
      offset: number,
    ): Promise<QueryResult | null> => {
      return send({
        type: "getTablePage",
        table,
        limit,
        offset,
      }) as Promise<QueryResult | null>
    },
    [send],
  )

  const closeDb = useCallback(async (): Promise<void> => {
    await send({ type: "close" })
  }, [send])

  return { initDb, execQuery, getTablePage, closeDb }
}

export default useDbWorker
