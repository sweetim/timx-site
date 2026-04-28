"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import type { Status } from "../types"
import { mapProgressKeyToPhase, resolveProgressUpdate } from "../utils"
import type { WorkerEvent } from "./background-remover.worker"

type UseBackgroundRemoverOptions = {
  isActive?: boolean
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
}

type LoadImageOptions = {
  notifySource?: boolean
}

function useBackgroundRemover(options?: UseBackgroundRemoverOptions) {
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalUrlRef = useRef<string | null>(null)
  const resultUrlRef = useRef<string | null>(null)
  const pendingFileRef = useRef<File | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const onResultRef = useRef<((blob: Blob) => void) | undefined>(
    options?.onResult,
  )
  const onSourceImageRef = useRef<
    ((blob: Blob, name: string) => void) | undefined
  >(options?.onSourceImage)

  useEffect(() => {
    onResultRef.current = options?.onResult
  }, [options?.onResult])

  useEffect(() => {
    onSourceImageRef.current = options?.onSourceImage
  }, [options?.onSourceImage])

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./background-remover.worker.ts", import.meta.url),
    )

    workerRef.current.onmessage = (event: MessageEvent<WorkerEvent>) => {
      const data = event.data

      match(data)
        .with({ type: "progress" }, ({ key, current, total }) => {
          const progress = total > 0 ? current / total : 0
          const nextStatus = mapProgressKeyToPhase(key)

          setStatus((prev) => {
            if (prev.phase !== "processing") return prev
            return resolveProgressUpdate(prev, nextStatus, progress).immediate
          })
        })
        .with({ type: "done" }, ({ blob }) => {
          const resultUrl = URL.createObjectURL(blob)
          resultUrlRef.current = resultUrl
          if (!originalUrlRef.current) return
          setStatus({
            phase: "done",
            originalUrl: originalUrlRef.current,
            resultUrl,
          })
          onResultRef.current?.(blob)
        })
        .with({ type: "error" }, ({ message }) => {
          setStatus({ phase: "error", message })
        })
        .exhaustive()
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const loadImage = useCallback(
    (file: File, loadOptions?: LoadImageOptions) => {
      if (!file.type.startsWith("image/")) {
        setStatus({
          phase: "error",
          message: "Please upload a valid image file.",
        })
        return
      }

      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current)
      }
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current)
        resultUrlRef.current = null
      }

      const originalUrl = URL.createObjectURL(file)
      originalUrlRef.current = originalUrl
      pendingFileRef.current = file

      if (loadOptions?.notifySource !== false) {
        onSourceImageRef.current?.(file, file.name)
      }

      setStatus({ phase: "ready", originalUrl })
    },
    [],
  )

  const startProcessing = useCallback(() => {
    const file = pendingFileRef.current
    if (!file || !originalUrlRef.current) return

    setStatus({
      phase: "processing",
      status: { phase: "downloading-model" },
      progress: 0,
      originalUrl: originalUrlRef.current,
    })

    workerRef.current?.postMessage({ type: "process", file })
  }, [])

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      loadImage(files[0])
    },
    [loadImage],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragOver(false)
      handleFiles(event.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files)
      if (fileInputRef.current) fileInputRef.current.value = ""
    },
    [handleFiles],
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!options?.isActive) return
      if (status.phase !== "idle" && status.phase !== "ready") return
      const file = e.clipboardData?.files[0]
      if (file?.type.startsWith("image/")) {
        e.preventDefault()
        loadImage(file)
      }
    }
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [options?.isActive, status.phase, loadImage])

  const handleDownload = useCallback(() => {
    if (status.phase !== "done") return
    const link = document.createElement("a")
    link.href = status.resultUrl
    link.download = "background-removed.png"
    link.click()
  }, [status])

  const handleReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current)
      originalUrlRef.current = null
    }
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = null
    }
    pendingFileRef.current = null
    setStatus({ phase: "idle" })
  }, [])

  const processBlob = useCallback(
    (blob: Blob, name = "initial-image.png") => {
      const file = new File([blob], name, {
        type: blob.type || "image/png",
      })
      loadImage(file, { notifySource: false })
    },
    [loadImage],
  )

  return {
    status,
    isDragOver,
    fileInputRef,
    handleUploadClick,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    handleDownload,
    handleReset,
    processBlob,
    loadImage,
    startProcessing,
  }
}

export default useBackgroundRemover
