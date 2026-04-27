"use client"

import { match } from "ts-pattern"
import ComputeProgress from "./_components/compute-progress"
import DownloadProgress from "./_components/download-progress"
import ErrorState from "./_components/error-state"
import ResultView from "./_components/result-view"
import UploadZone from "./_components/upload-zone"
import useBackgroundRemover from "./_hooks/use-background-remover"

type BackgroundRemoverProps = {
  variant?: "page" | "panel"
}

const BackgroundRemover = ({ variant = "page" }: BackgroundRemoverProps) => {
  const isPanel = variant === "panel"
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
  } = useBackgroundRemover()

  if (isPanel) {
    return (
      <div className="grid h-full min-h-[620px] bg-dev-canvas lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          className="min-h-[520px] overflow-auto bg-dev-inset p-4 sm:p-6"
          style={{
            backgroundImage:
              "linear-gradient(#373e47 1px, transparent 1px), linear-gradient(90deg, #373e47 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
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
                    onReset={handleReset}
                  />
                ))
                .with({ phase: "done" }, ({ originalUrl, resultUrl }) => (
                  <ResultView
                    originalUrl={originalUrl}
                    resultUrl={resultUrl}
                    onDownload={handleDownload}
                    onReset={handleReset}
                  />
                ))
                .exhaustive()}
            </div>
          </div>
        </section>

        <aside className="overflow-auto border-t border-dev-border bg-dev-inset p-4 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                Properties
              </p>
              <h2 className="mt-1 text-base font-semibold text-dev-text">
                Background Remover
              </h2>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-dev-border bg-dev-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Input
            </p>
            <p className="mt-2 text-xs leading-relaxed text-dev-text-secondary">
              Drop, paste, or browse for one image. Processing runs locally in a
              browser worker.
            </p>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={status.phase === "processing"}
              className="mt-3 w-full rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-blue/90 disabled:opacity-50"
            >
              Choose Image
            </button>
          </div>

          <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Status
            </p>
            <p className="mt-2 text-sm text-dev-text">{status.phase}</p>
          </div>

          {status.phase === "done" && (
            <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                Output
              </p>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded bg-dev-accent-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-green/90"
                >
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
                >
                  New Image
                </button>
              </div>
            </div>
          )}

          {status.phase !== "idle" && status.phase !== "done" && (
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 w-full rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
            >
              Reset
            </button>
          )}
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
                onReset={handleReset}
              />
            ))
            .with({ phase: "done" }, ({ originalUrl, resultUrl }) => (
              <ResultView
                originalUrl={originalUrl}
                resultUrl={resultUrl}
                onDownload={handleDownload}
                onReset={handleReset}
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
