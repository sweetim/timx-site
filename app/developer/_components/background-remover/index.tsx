"use client"

import { match, P } from "ts-pattern"
import ComputeProgress from "./_components/compute-progress"
import DownloadProgress from "./_components/download-progress"
import ErrorState from "./_components/error-state"
import ResultView from "./_components/result-view"
import UploadZone from "./_components/upload-zone"
import useBackgroundRemover from "./_hooks/use-background-remover"

const BackgroundRemover = () => {
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
              <UploadZone
                isDragOver={isDragOver}
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              />
            ))
            .with(
              { phase: "processing", status: { phase: "downloading-model" } },
              ({ progress }) => <DownloadProgress progress={progress} />,
            )
            .with(
              {
                phase: "processing",
                status: {
                  phase: P.union(
                    "decoding",
                    "computing-inference",
                    "computing-mask",
                    "encoding",
                  ),
                },
              },
              ({ status: { phase } }) => <ComputeProgress phase={phase} />,
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
