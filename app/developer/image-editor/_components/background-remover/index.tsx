"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DownloadFormat } from "../download-format-selector"
import { downloadBlob } from "../download-format-selector"
import type { BackgroundRemovalResult, SourceImage } from "../image-editor"
import SidebarActions from "../shared/sidebar-actions"
import SourceImagePanel from "../shared/source-image-panel"
import ToolPanelLayout from "../shared/tool-panel-layout"
import type { EditorToolProps } from "../shared/types"

const EMPTY_SOURCE_IMAGES: SourceImage[] = []
const EMPTY_BACKGROUND_REMOVAL_RESULTS: Record<
  string,
  BackgroundRemovalResult
> = {}

import useClipboardPaste from "../shared/use-clipboard-paste"
import useDroppedFiles from "../shared/use-dropped-files"
import useSourceFileInput from "../shared/use-source-file-input"
import useWorkspaceReset from "../shared/use-workspace-reset"
import UploadZone from "../upload-zone"
import ComputeProgress from "./_components/compute-progress"
import DownloadProgress from "./_components/download-progress"
import ErrorState from "./_components/error-state"
import ResultView from "./_components/result-view"
import useBackgroundRemoverPool from "./_hooks/use-background-remover-pool"

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

const BackgroundRemover = ({
  variant = "page",
  isActive = true,
  workspaceResetKey = 0,
  onResult,
  onSourceImage,
  onClearWorkspace,
  onCopyToClipboard,
  hasClipboard = false,
  droppedFiles,
  droppedFilesKey,
  canvasDropProps,
  sourceImages = EMPTY_SOURCE_IMAGES,
  onRemoveSourceImage,
  onAddSourceImages,
  backgroundRemovalResults = EMPTY_BACKGROUND_REMOVAL_RESULTS,
  onBackgroundRemovalResult,
}: EditorToolProps) => {
  const isPanel = variant === "panel"
  const activeSourceIdRef = useRef<string | null>(null)
  const backgroundRemovalResultsRef = useRef(backgroundRemovalResults)
  useEffect(() => {
    backgroundRemovalResultsRef.current = backgroundRemovalResults
  }, [backgroundRemovalResults])
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null)
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { sourceFileInputRef, handleSourceFileInput } = useSourceFileInput({
    onAddSourceImages,
  })

  const handlePoolResult = useCallback(
    (sourceId: string, blob: Blob) => {
      onBackgroundRemovalResult?.(sourceId, blob)
      onResult?.(blob)
    },
    [onBackgroundRemovalResult, onResult],
  )

  const { jobStatuses, enqueue, cancel, clearAll } = useBackgroundRemoverPool({
    onResult: handlePoolResult,
  })

  const activeSource = activeSourceId
    ? sourceImages.find((img) => img.id === activeSourceId)
    : undefined
  const activeJobStatus = activeSourceId
    ? jobStatuses[activeSourceId]
    : undefined
  const activeCachedResult = activeSourceId
    ? backgroundRemovalResults[activeSourceId]
    : undefined
  const displayResultUrl =
    activeCachedResult?.url
    ?? (activeJobStatus?.phase === "done" ? activeJobStatus.resultUrl : null)

  const imageStatuses = useMemo((): Record<
    string,
    "processing" | "done" | "error"
  > => {
    const statuses: Record<string, "processing" | "done" | "error"> = {}
    for (const img of sourceImages) {
      if (backgroundRemovalResults[img.id]) {
        statuses[img.id] = "done"
      } else if (jobStatuses[img.id]?.phase === "processing") {
        statuses[img.id] = "processing"
      } else if (jobStatuses[img.id]?.phase === "error") {
        statuses[img.id] = "error"
      }
    }
    return statuses
  }, [sourceImages, backgroundRemovalResults, jobStatuses])

  const handleFiles = useCallback(
    async (files: File[] | FileList | null) => {
      const imageFiles = Array.from(files ?? []).filter((file) =>
        file.type.startsWith("image/"),
      )
      if (imageFiles.length === 0) return

      const addedSources = await onAddSourceImages?.(imageFiles)
      const firstSource =
        addedSources?.find((source) => source.blob === imageFiles[0])
        ?? addedSources?.[0]

      if (firstSource) {
        activeSourceIdRef.current = firstSource.id
        setActiveSourceId(firstSource.id)
        onSourceImage?.(firstSource.blob, firstSource.name)
      }
    },
    [onAddSourceImages, onSourceImage],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleUploadDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      handleDragLeave(event)
      void handleFiles(event.dataTransfer.files)
    },
    [handleDragLeave, handleFiles],
  )

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      void handleFiles(event.target.files)
      event.target.value = ""
    },
    [handleFiles],
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleDownload = useCallback(async () => {
    if (!displayResultUrl) return
    await downloadBlob(displayResultUrl, "background-removed", downloadFormat)
  }, [displayResultUrl, downloadFormat])

  const handleStartProcessing = useCallback(() => {
    if (!activeSource) return
    enqueue(activeSource.id, activeSource.blob, activeSource.name)
  }, [activeSource, enqueue])

  const handleSelectSource = useCallback(
    (id: string) => {
      const source = sourceImages.find((img) => img.id === id)
      if (!source) return
      activeSourceIdRef.current = source.id
      setActiveSourceId(source.id)
      onSourceImage?.(source.blob, source.name)
    },
    [sourceImages, onSourceImage],
  )

  const handleRemoveSourceImage = useCallback(
    (id: string) => {
      cancel(id)
      onRemoveSourceImage?.(id)
    },
    [cancel, onRemoveSourceImage],
  )

  const handleRemoveActiveSource = useCallback(() => {
    if (activeSourceId) cancel(activeSourceId)
    activeSourceIdRef.current = null
    setActiveSourceId(null)
  }, [activeSourceId, cancel])

  const handleAddToSource = useCallback(async () => {
    if (!activeSourceId) return
    const blob = backgroundRemovalResultsRef.current[activeSourceId]?.blob
    if (!blob) return
    const file = new File([blob], "background-removed.png", {
      type: blob.type || "image/png",
    })
    await onAddSourceImages?.([file])
  }, [activeSourceId, onAddSourceImages])

  const handleClear = useCallback(() => {
    activeSourceIdRef.current = null
    setActiveSourceId(null)
    clearAll()
    onClearWorkspace?.()
  }, [clearAll, onClearWorkspace])

  useEffect(() => {
    activeSourceIdRef.current = activeSourceId
  }, [activeSourceId])

  useDroppedFiles({
    isActive,
    droppedFiles,
    droppedFilesKey,
    onLoad: (files) => {
      void handleFiles(files)
    },
  })

  useClipboardPaste({
    isActive,
    onFiles: (files) => {
      void handleFiles(files)
    },
  })

  useWorkspaceReset({
    workspaceResetKey,
    onReset: () => {
      activeSourceIdRef.current = null
      setActiveSourceId(null)
      clearAll()
    },
  })

  if (isPanel) {
    return (
      <ToolPanelLayout
        canvasDropProps={canvasDropProps}
        canvasContent={
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            {!activeSource ? (
              <div className="flex min-h-full w-full items-center justify-center">
                <div className="w-full max-w-xl rounded-xl border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30">
                  <UploadZone
                    isDragOver={isDragOver}
                    onClick={handleUploadClick}
                    onDrop={handleUploadDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  />
                </div>
              </div>
            ) : null}

            {activeSource && !displayResultUrl ? (
              <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                <div className="relative">
                  {/* biome-ignore lint/performance/noImgElement: blob URL preview */}
                  <img
                    src={activeSource.url}
                    alt="Preview"
                    className={`w-full h-auto max-h-125 object-contain rounded-md ${
                      activeJobStatus?.phase === "processing"
                        ? "opacity-40"
                        : ""
                    }`}
                  />
                  {activeJobStatus?.phase === "processing" ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ProcessingOverlay />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeSource && displayResultUrl ? (
              <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                <ResultView
                  originalUrl={activeSource.url}
                  resultUrl={displayResultUrl}
                  downloadFormat={downloadFormat}
                  onDownload={handleDownload}
                  onFormatChange={setDownloadFormat}
                  onReset={handleClear}
                  hideActions
                />
              </div>
            ) : null}

            {activeSource
            && activeJobStatus?.phase === "error"
            && !displayResultUrl ? (
              <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                <ErrorState
                  message={activeJobStatus.message}
                  onReset={handleClear}
                />
              </div>
            ) : null}
          </div>
        }
        sidebarContent={
          <>
            <div>
              <h2 className="text-base font-semibold text-dev-text">
                Background Remover
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
                Drop, paste, or browse for images. Processing runs locally in a
                browser worker.
              </p>
            </div>

            <SourceImagePanel
              sourceImages={sourceImages}
              activeSourceId={activeSourceId}
              onSelectSource={handleSelectSource}
              onRemoveSourceImage={handleRemoveSourceImage}
              onRemoveActiveSource={handleRemoveActiveSource}
              onAddSourceImages={onAddSourceImages}
              sourceFileInputRef={sourceFileInputRef}
              imageStatuses={imageStatuses}
            />

            {activeSource
            && !displayResultUrl
            && activeJobStatus?.phase !== "processing"
            && activeJobStatus?.phase !== "error" ? (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <button
                  type="button"
                  onClick={handleStartProcessing}
                  className="w-full rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-blue/90 cursor-pointer"
                >
                  Remove Background
                </button>
              </div>
            ) : null}

            {activeSource && activeJobStatus?.phase === "processing" ? (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                  Status
                </p>
                {activeJobStatus.status.phase === "downloading-model" ? (
                  <DownloadProgress
                    progress={activeJobStatus.progress}
                    compact
                  />
                ) : (
                  <ComputeProgress
                    phase={activeJobStatus.status.phase}
                    compact
                  />
                )}
              </div>
            ) : null}

            {activeSource
            && activeJobStatus?.phase === "error"
            && !displayResultUrl ? (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs text-dev-accent-red">
                  {activeJobStatus.message}
                </p>
                <button
                  type="button"
                  onClick={handleStartProcessing}
                  className="mt-2 w-full rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-blue/90 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : null}

            <SidebarActions
              download={
                displayResultUrl
                  ? {
                      url: displayResultUrl,
                      baseName: "background-removed",
                      format: downloadFormat,
                      onFormatChange: setDownloadFormat,
                    }
                  : undefined
              }
              showAddToSource={!!displayResultUrl}
              onAddToSource={handleAddToSource}
              showCopy={!!displayResultUrl && hasClipboard}
              onCopyToClipboard={onCopyToClipboard}
              showClear={sourceImages.length > 0}
              onClear={handleClear}
            />
          </>
        }
        hiddenInputs={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <input
              ref={sourceFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleSourceFileInput}
            />
          </>
        }
      />
    )
  }

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

          {!activeSource ? (
            <UploadZone
              isDragOver={isDragOver}
              onClick={handleUploadClick}
              onDrop={handleUploadDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />
          ) : null}

          {activeSource && !displayResultUrl ? (
            <div className="space-y-4">
              <div className="relative">
                {/* biome-ignore lint/performance/noImgElement: blob URL preview */}
                <img
                  src={activeSource.url}
                  alt="Preview"
                  className={`w-full h-auto max-h-125 object-contain rounded-md ${
                    activeJobStatus?.phase === "processing" ? "opacity-40" : ""
                  }`}
                />
                {activeJobStatus?.phase === "processing" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ProcessingOverlay />
                  </div>
                ) : null}
              </div>
              <div className="flex justify-center gap-3">
                {activeJobStatus?.phase !== "processing" ? (
                  <button
                    type="button"
                    onClick={handleStartProcessing}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-accent-blue hover:brightness-110 text-white transition-all cursor-pointer"
                  >
                    Remove Background
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          {activeSource && displayResultUrl ? (
            <ResultView
              originalUrl={activeSource.url}
              resultUrl={displayResultUrl}
              downloadFormat={downloadFormat}
              onDownload={handleDownload}
              onFormatChange={setDownloadFormat}
              onReset={handleClear}
            />
          ) : null}

          {activeSource
          && activeJobStatus?.phase === "error"
          && !displayResultUrl ? (
            <ErrorState
              message={activeJobStatus.message}
              onReset={handleClear}
            />
          ) : null}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  )
}

export default memo(BackgroundRemover)
