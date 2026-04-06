"use client"

import classNames from "classnames"
import { CircleX, Download, LoaderCircle, Upload } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { match, P } from "ts-pattern"
import { COMPUTE_STEPS } from "./constants"
import ImageComparisonSlider from "./image-comparison-slider"
import ProgressRing from "./progress-ring"
import type { Status } from "./types"
import { formatProgressLabel, getComputeStepIndex } from "./utils"

const BackgroundRemover = () => {
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalUrlRef = useRef<string | null>(null)

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
          const statusPhase = match(key)
            .with(P.string.startsWith("fetch"), () => ({
              phase: "downloading-model" as const,
            }))
            .with(P.string.startsWith("compute:encode"), () => ({
              phase: "encoding" as const,
            }))
            .with(P.string.startsWith("compute:decode"), () => ({
              phase: "decoding" as const,
            }))
            .with(P.string.startsWith("compute:inference"), () => ({
              phase: "computing-inference" as const,
            }))
            .with(P.string.startsWith("compute:mask"), () => ({
              phase: "computing-mask" as const,
            }))
            .otherwise(() => ({
              phase: "decoding" as const,
            }))

          setStatus((prev) => {
            if (prev.phase !== "processing") return prev

            const isTransitioningFromFetch =
              prev.status.phase === "downloading-model"
              && statusPhase.phase !== "downloading-model"

            if (isTransitioningFromFetch) {
              setTimeout(() => {
                setStatus((prev2) =>
                  prev2.phase === "processing"
                    ? { ...prev2, status: statusPhase, progress: 0 }
                    : prev2,
                )
              }, 300)
              return { ...prev, progress: 1 }
            }

            return { ...prev, status: statusPhase, progress }
          })
        },
      })

      const resultUrl = URL.createObjectURL(resultBlob)
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
    if (status.phase === "done") {
      URL.revokeObjectURL(status.resultUrl)
    }
    setStatus({ phase: "idle" })
  }, [status])

  return (
    <div className="flex flex-col h-full bg-dev-canvas">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-dev-text mb-1">
            Background Remover
          </h1>
          <p className="text-sm text-dev-text-secondary mb-6">
            Upload an image to remove its background. Everything runs locally in
            your browser — no data is sent to a server.
          </p>

          {match(status)
            .with({ phase: "idle" }, () => (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={classNames(
                  "flex flex-col items-center justify-center rounded-md border-2 border-dashed cursor-pointer transition-colors w-full text-left",
                  "min-h-75 p-8",
                  isDragOver
                    ? "border-dev-accent-blue bg-dev-inset"
                    : "border-dev-border hover:border-dev-border-muted hover:bg-dev-inset",
                )}
              >
                <Upload className="w-12 h-12 text-dev-text-secondary" />
                <p className="mt-3 text-sm font-medium text-dev-text">
                  Drop an image here, or click to browse
                </p>
                <p className="mt-1 text-xs text-dev-text-secondary">
                  PNG, JPEG, or WebP
                </p>
              </button>
            ))
            .with({ phase: "processing" }, ({ status, progress }) =>
              match(status)
                .with({ phase: "downloading-model" }, () => (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dev-border bg-dev-inset min-h-75 p-8">
                    <p className="mt-4 text-sm text-dev-text">
                      {formatProgressLabel(status, progress)}
                    </p>
                    <div className="mt-3 w-64 h-1.5 bg-dev-border rounded-full overflow-hidden">
                      {progress > 0 ? (
                        <div
                          className="h-full bg-dev-accent-blue rounded-full transition-all duration-200"
                          style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                      ) : (
                        <div
                          className="h-full w-1/4 bg-dev-accent-blue/60 rounded-full"
                          style={{
                            animation:
                              "progress-indeterminate 1.5s ease-in-out infinite",
                          }}
                        />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-dev-text-secondary">
                      The AI model will be downloaded on first use. Subsequent
                      runs will be faster.
                    </p>
                  </div>
                ))
                .with(
                  {
                    phase: P.union(
                      "decoding",
                      "computing-inference",
                      "computing-mask",
                      "encoding",
                    ),
                  },
                  ({ phase }) => {
                    const currentStepIndex = getComputeStepIndex(phase)
                    const progress =
                      (currentStepIndex + 1) / COMPUTE_STEPS.length
                    return (
                      <div className="flex flex-col items-center justify-center rounded-md border border-dev-border bg-dev-inset min-h-[300px] p-8">
                        <div className="relative flex items-center justify-center">
                          <ProgressRing progress={progress} />
                          <span className="absolute text-sm font-semibold text-dev-text">
                            {Math.round(progress * 100)}%
                          </span>
                        </div>
                        <p className="mt-4 text-base font-semibold text-dev-text">
                          Removing background…
                        </p>
                        <ol className="mt-5 flex items-center w-full max-w-xs">
                          {COMPUTE_STEPS.map((step, index) => {
                            const isCompleted = index < currentStepIndex
                            const isCurrent = index === currentStepIndex
                            return (
                              <li
                                key={step.phase}
                                className="flex items-center flex-1"
                              >
                                <div className="flex flex-col items-center gap-1.5">
                                  {isCompleted ? (
                                    <span className="w-2 h-2 rounded-full bg-dev-accent-blue" />
                                  ) : isCurrent ? (
                                    <span className="w-2 h-2">
                                      <LoaderCircle className="w-2 h-2 text-dev-accent-blue animate-spin" />
                                    </span>
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-dev-text-secondary/30" />
                                  )}
                                  <span
                                    className={classNames(
                                      "text-xs transition-colors whitespace-nowrap",
                                      isCurrent
                                        && "font-semibold text-dev-text",
                                      isCompleted && "text-dev-accent-blue",
                                      !isCompleted
                                        && !isCurrent
                                        && "text-dev-text-secondary/50",
                                    )}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                {index < COMPUTE_STEPS.length - 1 && (
                                  <div
                                    className={classNames(
                                      "flex-1 h-px mx-2 mb-4 transition-colors",
                                      index < currentStepIndex
                                        ? "bg-dev-accent-blue"
                                        : "bg-dev-border",
                                    )}
                                  />
                                )}
                              </li>
                            )
                          })}
                        </ol>
                      </div>
                    )
                  },
                )
                .exhaustive(),
            )
            .with({ phase: "error" }, ({ message }) => (
              <div className="flex flex-col items-center justify-center rounded-md border border-dev-accent-red/30 bg-dev-inset min-h-[300px] p-8">
                <CircleX className="w-8 h-8 text-dev-accent-red" />
                <p className="mt-3 text-sm text-dev-accent-red">{message}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 px-4 py-1.5 text-sm rounded bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors"
                >
                  Try again
                </button>
              </div>
            ))
            .with({ phase: "done" }, ({ originalUrl, resultUrl }) => (
              <div className="space-y-4">
                <ImageComparisonSlider
                  originalUrl={originalUrl}
                  resultUrl={resultUrl}
                />
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-accent-blue hover:brightness-110 text-white transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload image
                  </button>
                </div>
              </div>
            ))
            .exhaustive()}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}

export default BackgroundRemover
