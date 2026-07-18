"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import type { PerImageStatus } from "../types"
import { mapProgressKeyToPhase } from "../utils"
import type { WorkerEvent } from "./background-remover.worker"

type UseBackgroundRemoverPoolOptions = {
  onResult?: (sourceId: string, blob: Blob) => void
}

function useBackgroundRemoverPool(options?: UseBackgroundRemoverPoolOptions) {
  const [jobStatuses, setJobStatuses] = useState<
    Record<string, PerImageStatus>
  >({})
  const workersRef = useRef<Record<string, Worker>>({})
  const jobStatusesRef = useRef(jobStatuses)
  const onResultRef = useRef(options?.onResult)

  useEffect(() => {
    jobStatusesRef.current = jobStatuses
  }, [jobStatuses])

  useEffect(() => {
    onResultRef.current = options?.onResult
  }, [options?.onResult])

  const enqueue = useCallback(
    (sourceId: string, blob: Blob, name = "image.png") => {
      workersRef.current[sourceId]?.terminate()

      const file = new File([blob], name, {
        type: blob.type || "image/png",
      })
      const worker = new Worker(
        new URL("./background-remover.worker.ts", import.meta.url),
      )
      workersRef.current[sourceId] = worker

      worker.onmessage = (event: MessageEvent<WorkerEvent>) => {
        match(event.data)
          .with({ type: "progress" }, ({ key, current, total }) => {
            const progress = total > 0 ? current / total : 0
            const status = mapProgressKeyToPhase(key)
            setJobStatuses((prev) => ({
              ...prev,
              [sourceId]: { phase: "processing", status, progress },
            }))
          })
          .with({ type: "done" }, ({ blob: resultBlob }) => {
            const resultUrl = URL.createObjectURL(resultBlob)
            setJobStatuses((prev) => ({
              ...prev,
              [sourceId]: { phase: "done", resultUrl },
            }))
            onResultRef.current?.(sourceId, resultBlob)
            worker.terminate()
            delete workersRef.current[sourceId]
          })
          .with({ type: "error" }, ({ message }) => {
            setJobStatuses((prev) => ({
              ...prev,
              [sourceId]: { phase: "error", message },
            }))
            worker.terminate()
            delete workersRef.current[sourceId]
          })
          .exhaustive()
      }

      setJobStatuses((prev) => {
        const previous = prev[sourceId]
        if (previous?.phase === "done") URL.revokeObjectURL(previous.resultUrl)
        return {
          ...prev,
          [sourceId]: {
            phase: "processing",
            status: { phase: "downloading-model" },
            progress: 0,
          },
        }
      })

      worker.postMessage({ type: "process", file })
    },
    [],
  )

  const cancel = useCallback((sourceId: string) => {
    workersRef.current[sourceId]?.terminate()
    delete workersRef.current[sourceId]
    setJobStatuses((prev) => {
      const status = prev[sourceId]
      if (status?.phase === "done") URL.revokeObjectURL(status.resultUrl)
      const next = { ...prev }
      delete next[sourceId]
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    for (const worker of Object.values(workersRef.current)) {
      worker.terminate()
    }
    workersRef.current = {}
    setJobStatuses((prev) => {
      for (const status of Object.values(prev)) {
        if (status.phase === "done") URL.revokeObjectURL(status.resultUrl)
      }
      return {}
    })
  }, [])

  useEffect(() => {
    return () => {
      for (const worker of Object.values(workersRef.current)) {
        worker.terminate()
      }
      for (const status of Object.values(jobStatusesRef.current)) {
        if (status.phase === "done") URL.revokeObjectURL(status.resultUrl)
      }
    }
  }, [])

  return { jobStatuses, enqueue, cancel, clearAll }
}

export default useBackgroundRemoverPool
