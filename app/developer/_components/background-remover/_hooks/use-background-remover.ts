"use client"

import { useCallback, useRef, useState } from "react"
import { match, P } from "ts-pattern"
import type { Status } from "../types"
import { mapProgressKeyToPhase, resolveProgressUpdate } from "../utils"

function useBackgroundRemover() {
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalUrlRef = useRef<string | null>(null)
  const resultUrlRef = useRef<string | null>(null)

  const processImage = useCallback(async (file: File) => {
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

    setStatus({
      phase: "processing",
      status: { phase: "downloading-model" },
      progress: 0,
    })

    await new Promise((resolve) => requestAnimationFrame(resolve))

    try {
      const { removeBackground } = await import("@imgly/background-removal")

      const resultBlob = await removeBackground(file, {
        output: { format: "image/png" },
        progress: (key: string, current: number, total: number) => {
          const progress = total > 0 ? current / total : 0
          console.log(key, current, total)

          const nextStatus = mapProgressKeyToPhase(key)

          setStatus((prev) => {
            if (prev.phase !== "processing") return prev

            const result = resolveProgressUpdate(prev, nextStatus, progress)

            if (result.delayed) {
              const { status: delayedStatus, progress: delayedProgress } =
                result.delayed
              setTimeout(() => {
                setStatus((prev2) =>
                  match(prev2)
                    .with({ phase: "processing" }, () => ({
                      ...prev2,
                      status: delayedStatus,
                      progress: delayedProgress,
                    }))
                    .otherwise(() => prev2),
                )
              }, 300)
            }

            return result.immediate
          })
        },
      })

      const resultUrl = URL.createObjectURL(resultBlob)
      resultUrlRef.current = resultUrl
      setStatus({ phase: "done", originalUrl, resultUrl })
    } catch (error) {
      const message = match(error)
        .with(P.instanceOf(Error), (error) => error.message)
        .otherwise(() => "An unexpected error occurred.")
      setStatus({ phase: "error", message })
    }
  }, [])

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      processImage(files[0])
    },
    [processImage],
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
    setStatus({ phase: "idle" })
  }, [])

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
  }
}

export default useBackgroundRemover
