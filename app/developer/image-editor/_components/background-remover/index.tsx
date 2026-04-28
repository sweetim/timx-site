"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, Trash2 } from "lucide-react"
import { match } from "ts-pattern"
import type { CanvasDropProps, SharedEditorImage } from "../image-editor"
import CanvasDropOverlay from "../canvas-drop-overlay"
import UploadZone from "../upload-zone"
import ComputeProgress from "./_components/compute-progress"
import DownloadProgress from "./_components/download-progress"
import ErrorState from "./_components/error-state"
import ResultView from "./_components/result-view"
import useBackgroundRemover from "./_hooks/use-background-remover"

function ProcessingOverlay() {
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-10">
        <div className="absolute inset-0 rounded-full border-2 border-dev-accent-blue/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-dev-accent-blue animate-spin" />
      </div>
      <p className="text-sm font-medium text-dev-text">
        Removing background{".".repeat(dots)}
      </p>
    </div>
  )
}

type BackgroundRemoverProps = {
  variant?: "page" | "panel"
  isActive?: boolean
  initialImage?: SharedEditorImage | null
  workspaceResetKey?: number
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
  onClearWorkspace?: () => void
  onCopyToClipboard?: () => void
  hasClipboard?: boolean
  droppedFiles?: File[]
  droppedFilesKey?: number
  canvasDropProps?: CanvasDropProps
}

const BackgroundRemover = ({
  variant = "page",
  isActive = true,
  initialImage,
  workspaceResetKey = 0,
  onResult,
  onSourceImage,
  onClearWorkspace,
  onCopyToClipboard,
  hasClipboard = false,
  droppedFiles,
  droppedFilesKey,
  canvasDropProps,
}: BackgroundRemoverProps) => {
  const isPanel = variant === "panel"
  const importedImageKeyRef = useRef<number | null>(null)
  const {
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
  } = useBackgroundRemover({ isActive, onResult, onSourceImage })

  useEffect(() => {
    if (!isActive) return
    if (!droppedFiles || droppedFiles.length === 0) return
    loadImage(droppedFiles[0])
  }, [isActive, droppedFiles, droppedFilesKey, loadImage])

  useEffect(() => {
    if (!isActive || !initialImage) return
    if (initialImage.originTool === "background") return
    if (importedImageKeyRef.current === initialImage.key) return
    importedImageKeyRef.current = initialImage.key
    processBlob(initialImage.blob, initialImage.name)
  }, [isActive, initialImage, processBlob])

  useEffect(() => {
    if (workspaceResetKey === 0) return
    importedImageKeyRef.current = null
    handleReset()
  }, [workspaceResetKey, handleReset])

  const handleClear = () => {
    importedImageKeyRef.current = null
    handleReset()
    onClearWorkspace?.()
  }

  if (isPanel) {
    return (
      <div className="grid h-full min-h-[620px] bg-dev-canvas lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          className="relative min-h-[520px] overflow-auto bg-dev-inset p-4 sm:p-6"
          style={{
            backgroundImage:
              "linear-gradient(#373e47 1px, transparent 1px), linear-gradient(90deg, #373e47 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          onDragOver={canvasDropProps?.onDragOver}
          onDragEnter={canvasDropProps?.onDragEnter}
          onDragLeave={canvasDropProps?.onDragLeave}
          onDrop={canvasDropProps?.onDrop}
        >
          {canvasDropProps && (
            <CanvasDropOverlay
              isDragOver={canvasDropProps.isDragOver}
              overlayLabel={canvasDropProps.overlayLabel}
            />
          )}
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            {match(status)
              .with({ phase: "idle" }, () => (
                <div className="flex min-h-full w-full items-center justify-center">
                  <div className="w-full max-w-xl rounded-xl border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30">
                    <UploadZone
                      isDragOver={isDragOver}
                      onClick={handleUploadClick}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    />
                  </div>
                </div>
              ))
              .with({ phase: "ready" }, ({ originalUrl }) => (
                <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                  <div className="space-y-4">
                    <img
                      src={originalUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-125 object-contain rounded-md"
                    />
                  </div>
                </div>
              ))
              .with({ phase: "processing" }, ({ originalUrl }) => (
                <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                  <div className="relative">
                    <img
                      src={originalUrl}
                      alt="Processing"
                      className="w-full h-auto max-h-125 object-contain rounded-md opacity-40"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ProcessingOverlay />
                    </div>
                  </div>
                </div>
              ))
              .with({ phase: "error" }, ({ message }) => (
                <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                  <ErrorState
                    message={message}
                    onReset={handleClear}
                  />
                </div>
              ))
              .with({ phase: "done" }, ({ originalUrl, resultUrl }) => (
                <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                  <ResultView
                    originalUrl={originalUrl}
                    resultUrl={resultUrl}
                    onDownload={handleDownload}
                    onReset={handleClear}
                  />
                </div>
              ))
              .exhaustive()}
          </div>
        </section>

        <aside className="overflow-auto border-t border-dev-border bg-dev-inset p-4 lg:border-l lg:border-t-0">
          <div>
            <h2 className="text-base font-semibold text-dev-text">
              Background Remover
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
              Drop, paste, or browse for one image. Processing runs locally in a
              browser worker.
            </p>
          </div>

          {status.phase === "ready" && (
            <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
              <button
                type="button"
                onClick={startProcessing}
                className="w-full rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-blue/90"
              >
                Remove Background
              </button>
            </div>
          )}

          <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Status
            </p>
            {match(status)
              .with({ phase: "processing" }, ({ status, progress }) =>
                status.phase === "downloading-model" ? (
                  <DownloadProgress
                    progress={progress}
                    compact
                  />
                ) : (
                  <ComputeProgress
                    phase={status.phase}
                    compact
                  />
                ),
              )
              .otherwise(() => (
                <p className="mt-2 text-sm text-dev-text">{status.phase}</p>
              ))}
          </div>

          <div className="mt-3 grid gap-2">
            {status.phase === "done" && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-1.5 rounded bg-dev-accent-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-green/90"
                >
                  Download PNG
                </button>
                {hasClipboard && (
                  <button
                    type="button"
                    onClick={onCopyToClipboard}
                    className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
                  >
                    <Copy className="size-4" />
                    Copy to Clipboard
                  </button>
                )}
              </>
            )}
            {status.phase !== "idle" && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
              >
                <Trash2 className="size-4" />
                Clear
              </button>
            )}
          </div>
        </aside>

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

  return (
    <div className={isPanel ? "h-full" : "flex flex-col h-full bg-dev-canvas"}>
      <div className={isPanel ? "" : "flex-1 overflow-auto"}>
        <div className={isPanel ? "p-4 sm:p-6" : "max-w-4xl mx-auto px-6 py-8"}>
          {!isPanel && (
            <>
              <h1 className="text-2xl font-semibold text-dev-text mb-1">
                Background Remover
              </h1>
              <p className="text-sm text-dev-text-secondary mb-6">
                Upload an image to remove its background. Everything runs
                locally in your browser — no data is sent to a server.
              </p>
            </>
          )}

          {match(status)
            .with({ phase: "idle" }, () => (
              <UploadZone
                isDragOver={isDragOver}
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              />
            ))
            .with({ phase: "ready" }, ({ originalUrl }) => (
              <div className="space-y-4">
                <img
                  src={originalUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-125 object-contain rounded-md"
                />
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={startProcessing}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-accent-blue hover:brightness-110 text-white transition-all"
                  >
                    Remove Background
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>
            ))
            .with({ phase: "processing" }, ({ status, progress }) =>
              status.phase === "downloading-model" ? (
                <DownloadProgress progress={progress} />
              ) : (
                <ComputeProgress phase={status.phase} />
              ),
            )
            .with({ phase: "error" }, ({ message }) => (
              <ErrorState
                message={message}
                onReset={handleClear}
              />
            ))
            .with({ phase: "done" }, ({ originalUrl, resultUrl }) => (
              <ResultView
                originalUrl={originalUrl}
                resultUrl={resultUrl}
                onDownload={handleDownload}
                onReset={handleClear}
              />
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
