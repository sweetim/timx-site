"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import type { DownloadFormat } from "../download-format-selector"
import { downloadBlob } from "../download-format-selector"
import type { SourceImage } from "../image-editor"
import UploadZone from "../upload-zone"
import SidebarActions from "../shared/sidebar-actions"
import type { EditorToolProps } from "../shared/types"
import useClipboardPaste from "../shared/use-clipboard-paste"
import useDroppedFiles from "../shared/use-dropped-files"
import useSourceFileInput from "../shared/use-source-file-input"
import useWorkspaceReset from "../shared/use-workspace-reset"
import SourceImagePanel from "../shared/source-image-panel"
import ToolPanelLayout from "../shared/tool-panel-layout"
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
  sourceImages = [],
  onRemoveSourceImage,
  onAddSourceImages,
  backgroundRemovalResults = {},
  onBackgroundRemovalResult,
}: EditorToolProps) => {
  const isPanel = variant === "panel"
  const importedImageKeyRef = useRef<number | null>(null)
  const activeSourceIdRef = useRef<string | null>(null)
  const processingSourceIdRef = useRef<string | null>(null)
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null)
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png")
  const { sourceFileInputRef, handleSourceFileInput } = useSourceFileInput({
    onAddSourceImages,
  })
  const handleResult = useCallback(
    (blob: Blob) => {
      const sourceId = processingSourceIdRef.current ?? activeSourceIdRef.current
      if (sourceId) onBackgroundRemovalResult?.(sourceId, blob)
      processingSourceIdRef.current = null
      onResult?.(blob)
    },
    [onBackgroundRemovalResult, onResult],
  )
  const {
    status,
    isDragOver,
    fileInputRef,
    handleUploadClick,
    handleDragOver,
    handleDragLeave,
    handleReset,
    processBlob,
    loadImage,
    startProcessing,
  } = useBackgroundRemover({ isActive, onResult: handleResult, onSourceImage })

  const activeSource = activeSourceId
    ? sourceImages.find((img) => img.id === activeSourceId)
    : undefined
  const activeCachedResult = activeSourceId
    ? backgroundRemovalResults[activeSourceId]
    : undefined
  const displayStatus =
    activeSource && activeCachedResult
      ? ({
          phase: "done",
          originalUrl: activeSource.url,
          resultUrl: activeCachedResult.url,
        } as const)
      : status
  const displayResultUrl =
    displayStatus.phase === "done" ? displayStatus.resultUrl : null

  const showSource = useCallback(
    (source: SourceImage, notifySource: boolean) => {
      activeSourceIdRef.current = source.id
      setActiveSourceId(source.id)
      if (notifySource) onSourceImage?.(source.blob, source.name)
      if (!backgroundRemovalResults[source.id]) {
        processBlob(source.blob, source.name)
      }
    },
    [backgroundRemovalResults, onSourceImage, processBlob],
  )

  const handleFiles = useCallback(
    async (files: File[] | FileList | null) => {
      const imageFiles = Array.from(files ?? []).filter((file) =>
        file.type.startsWith("image/"),
      )
      const firstFile = imageFiles[0]
      if (!firstFile) return

      const addedSources = await onAddSourceImages?.(imageFiles)
      const firstSource =
        addedSources?.find((source) => source.blob === firstFile) ??
        addedSources?.[0]

      if (firstSource) {
        showSource(firstSource, true)
        return
      }

      activeSourceIdRef.current = null
      setActiveSourceId(null)
      loadImage(firstFile)
    },
    [loadImage, onAddSourceImages, showSource],
  )

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

  const handleStartProcessing = useCallback(() => {
    processingSourceIdRef.current = activeSourceIdRef.current
    startProcessing()
  }, [startProcessing])

  const handleDownload = useCallback(async () => {
    if (!displayResultUrl) return
    await downloadBlob(displayResultUrl, "background-removed", downloadFormat)
  }, [displayResultUrl, downloadFormat])

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

  useEffect(() => {
    if (!isActive || !initialImage) return
    if (initialImage.originTool === "background") return
    if (importedImageKeyRef.current === initialImage.key) return
    importedImageKeyRef.current = initialImage.key
    activeSourceIdRef.current = null
    processingSourceIdRef.current = null
    setActiveSourceId(null)
    processBlob(initialImage.blob, initialImage.name)
  }, [isActive, initialImage, processBlob])

  useClipboardPaste({
    isActive,
    onFiles: (files) => {
      void handleFiles(files)
    },
  })

  useWorkspaceReset({
    workspaceResetKey,
    onReset: () => {
      importedImageKeyRef.current = null
      activeSourceIdRef.current = null
      processingSourceIdRef.current = null
      setActiveSourceId(null)
      handleReset()
    },
  })

  const handleSelectSource = (id: string) => {
    const source = sourceImages.find((img) => img.id === id)
    if (!source) return
    showSource(source, false)
  }

  const handleClear = () => {
    importedImageKeyRef.current = null
    activeSourceIdRef.current = null
    processingSourceIdRef.current = null
    setActiveSourceId(null)
    handleReset()
    onClearWorkspace?.()
  }

  if (isPanel) {
    return (
      <ToolPanelLayout
        canvasDropProps={canvasDropProps}
        canvasContent={
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            {match(displayStatus)
              .with({ phase: "idle" }, () => (
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
                    downloadFormat={downloadFormat}
                    onDownload={handleDownload}
                    onFormatChange={setDownloadFormat}
                    onReset={handleClear}
                    hideActions
                  />
                </div>
              ))
              .exhaustive()}
          </div>
        }
        sidebarContent={
          <>
            <div>
              <h2 className="text-base font-semibold text-dev-text">
                Background Remover
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
                Drop, paste, or browse for one image. Processing runs locally in a
                browser worker.
              </p>
            </div>

            <SourceImagePanel
              sourceImages={sourceImages}
              activeSourceId={activeSourceId}
              onSelectSource={handleSelectSource}
              onRemoveSourceImage={onRemoveSourceImage}
              onRemoveActiveSource={() => {
                activeSourceIdRef.current = null
                setActiveSourceId(null)
                handleReset()
              }}
              onAddSourceImages={onAddSourceImages}
              sourceFileInputRef={sourceFileInputRef}
            />

            {displayStatus.phase === "ready" && (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <button
                  type="button"
                  onClick={handleStartProcessing}
                  className="w-full rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-blue/90 cursor-pointer"
                >
                  Remove Background
                </button>
              </div>
            )}

            {(displayStatus.phase === "processing" || displayStatus.phase === "error") && (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                  Status
                </p>
                {match(displayStatus)
                  .with({ phase: "processing" }, ({ status, progress }) =>
                    status.phase === "downloading-model" ? (
                      <DownloadProgress progress={progress} compact />
                    ) : (
                      <ComputeProgress phase={status.phase} compact />
                    ),
                  )
                  .otherwise(() => (
                    <p className="mt-2 text-sm text-dev-text">{displayStatus.phase}</p>
                  ))}
              </div>
            )}

            <SidebarActions
              download={
                displayStatus.phase === "done"
                  ? {
                      url: displayStatus.resultUrl,
                      baseName: "background-removed",
                      format: downloadFormat,
                      onFormatChange: setDownloadFormat,
                    }
                  : undefined
              }
              showCopy={displayStatus.phase === "done" && hasClipboard}
              onCopyToClipboard={onCopyToClipboard}
              showClear={displayStatus.phase !== "idle"}
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
            Upload an image to remove its background. Everything runs
            locally in your browser — no data is sent to a server.
          </p>

          {match(displayStatus)
            .with({ phase: "idle" }, () => (
              <UploadZone
                isDragOver={isDragOver}
                onClick={handleUploadClick}
                onDrop={handleUploadDrop}
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
                    onClick={handleStartProcessing}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-accent-blue hover:brightness-110 text-white transition-all cursor-pointer"
                  >
                    Remove Background
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors cursor-pointer"
                  >
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
              <ErrorState message={message} onReset={handleClear} />
            ))
            .with({ phase: "done" }, ({ originalUrl, resultUrl }) => (
              <ResultView
                originalUrl={originalUrl}
                resultUrl={resultUrl}
                downloadFormat={downloadFormat}
                onDownload={handleDownload}
                onFormatChange={setDownloadFormat}
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
        onChange={handleFileInputChange}
      />
    </div>
  )
}

export default BackgroundRemover
