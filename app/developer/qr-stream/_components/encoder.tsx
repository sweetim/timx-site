"use client"

import clsx from "clsx"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
  Pause,
  Play,
  Repeat,
  Square,
  Upload,
} from "lucide-react"
import { type QRCodeRenderersOptions, toCanvas } from "qrcode"
import { type FC, useCallback, useEffect, useRef, useState } from "react"
import {
  buildFrames,
  DEFAULT_FPS,
  formatBytes,
  formatDuration,
  MAX_FPS,
  MIN_FPS,
  QR_CANVAS_SIZE,
} from "../_lib/qr-protocol"

const QR_OPTIONS: QRCodeRenderersOptions = {
  errorCorrectionLevel: "L",
  margin: 2,
  color: { dark: "#000000ff", light: "#ffffffff" },
}

const LARGE_FILE_FRAMES = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

type EncodeState =
  | { phase: "idle" }
  | {
      phase: "ready"
      fileName: string
      fileSize: number
      frames: string[]
    }

const QrStreamEncoder: FC = () => {
  const [state, setState] = useState<EncodeState>({ phase: "idle" })
  const [isDragOver, setIsDragOver] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [fps, setFps] = useState(DEFAULT_FPS)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const drawFrame = useCallback(async (index: number, frames: string[]) => {
    const canvas = canvasRef.current
    if (!canvas || !frames[index]) return
    await toCanvas(canvas, frames[index], {
      ...QR_OPTIONS,
      width: QR_CANVAS_SIZE,
    })
  }, [])

  useEffect(() => {
    if (state.phase !== "ready") return
    void drawFrame(frameIndex, state.frames)
  }, [state, frameIndex, drawFrame])

  useEffect(() => {
    if (state.phase !== "ready" || !playing) return
    const total = state.frames.length
    const timer = setInterval(() => {
      setFrameIndex((current) => {
        if (current + 1 >= total) {
          if (loop) return 0
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1000 / fps)
    return () => clearInterval(timer)
  }, [state, playing, loop, fps])

  const handleFile = useCallback(async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const frames = buildFrames(bytes, file.name, file.type)
    setState({
      phase: "ready",
      fileName: file.name,
      fileSize: file.size,
      frames,
    })
    setFrameIndex(0)
    setPlaying(false)
  }, [])

  const handleReset = useCallback(() => {
    setPlaying(false)
    setState({ phase: "idle" })
  }, [])

  const handleExportWebm = useCallback(async () => {
    if (state.phase !== "ready" || exporting) return
    const { frames, fileName } = state
    if (typeof MediaRecorder === "undefined") return
    const canvas = document.createElement("canvas")
    canvas.width = QR_CANVAS_SIZE
    canvas.height = QR_CANVAS_SIZE
    const stream = canvas.captureStream(fps)
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm"
    const recorder = new MediaRecorder(stream, { mimeType })
    const parts: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) parts.push(event.data)
    }
    const finished = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(parts, { type: "video/webm" }))
    })
    setExporting(true)
    setExportProgress(0)
    await toCanvas(canvas, frames[0], {
      ...QR_OPTIONS,
      width: QR_CANVAS_SIZE,
    })
    recorder.start()
    for (let i = 0; i < frames.length; i++) {
      await toCanvas(canvas, frames[i], {
        ...QR_OPTIONS,
        width: QR_CANVAS_SIZE,
      })
      await sleep(1000 / fps)
      setExportProgress((i + 1) / frames.length)
    }
    await sleep(1000 / fps)
    recorder.stop()
    const blob = await finished
    stream.getTracks().forEach((track) => {
      track.stop()
    })
    downloadBlob(
      blob,
      `${fileName.replace(/\.[^.]+$/, "") || "qr-stream"}.webm`,
    )
    setExporting(false)
  }, [state, fps, exporting])

  if (state.phase === "idle") {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <button
            type="button"
            className={clsx(
              "w-full flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer",
              isDragOver
                ? "border-dev-accent-blue bg-dev-accent-blue/10"
                : "border-dev-border hover:border-dev-text-secondary",
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragOver(false)
              const file = event.dataTransfer.files[0]
              if (file) void handleFile(file)
            }}
          >
            <Upload className="size-10 text-dev-text-secondary" />
            <span className="text-sm font-medium">
              Drop a file here or click to browse
            </span>
            <span className="text-xs text-dev-text-secondary">
              The file is split into QR code frames played as a stream. Large
              files take minutes to transfer — keep files small.
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleFile(file)
              event.target.value = ""
            }}
          />
        </div>
      </div>
    )
  }

  const total = state.frames.length
  const estimatedSeconds = total / fps
  const webmSupported =
    typeof MediaRecorder !== "undefined"
    && typeof HTMLCanvasElement !== "undefined"
    && typeof HTMLCanvasElement.prototype.captureStream === "function"
    && (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      || MediaRecorder.isTypeSupported("video/webm"))

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
      <div className="flex flex-col items-center justify-center gap-4 lg:flex-1">
        <div className="rounded-lg border border-dev-border bg-white p-3">
          <canvas
            ref={canvasRef}
            width={QR_CANVAS_SIZE}
            height={QR_CANVAS_SIZE}
            className="block size-full max-w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded p-1.5 sm:px-3 sm:py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={() => setFrameIndex((i) => Math.max(0, i - 1))}
            disabled={frameIndex === 0}
            aria-label="Previous frame"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded p-1.5 sm:px-3 sm:py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">
              {playing ? "Pause" : "Play"}
            </span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded p-1.5 sm:px-3 sm:py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={() => setFrameIndex((i) => Math.min(total - 1, i + 1))}
            disabled={frameIndex === total - 1}
            aria-label="Next frame"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            className={clsx(
              "inline-flex items-center gap-1.5 rounded p-1.5 sm:px-3 sm:py-1 text-sm transition-colors cursor-pointer",
              loop
                ? "bg-dev-accent-blue text-white"
                : "bg-dev-button hover:bg-dev-button-hover text-dev-text",
            )}
            onClick={() => setLoop((v) => !v)}
            aria-pressed={loop}
          >
            <Repeat size={14} />
            <span className="hidden sm:inline">Loop</span>
          </button>
        </div>
        <p className="text-xs text-dev-text-secondary">
          Frame {frameIndex + 1} of {total} (frame 1 is the file header)
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 lg:max-w-sm">
        <div className="rounded-lg border border-dev-border p-4">
          <h2 className="text-xs uppercase tracking-wider text-dev-text-secondary mb-3">
            File
          </h2>
          <p className="text-sm font-medium truncate">{state.fileName}</p>
          <p className="text-xs text-dev-text-secondary mt-1">
            {formatBytes(state.fileSize)} · {total} QR frames
          </p>
          <p className="text-xs text-dev-text-secondary mt-1">
            Estimated transfer time at {fps} fps:{" "}
            {formatDuration(estimatedSeconds)}
          </p>
          {total > LARGE_FILE_FRAMES && (
            <p className="mt-2 text-xs text-dev-accent-orange">
              Large stream — transfer may take a long time and scanning gets
              less reliable. Consider a smaller file.
            </p>
          )}
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
            onClick={handleReset}
          >
            <Square size={14} />
            Choose another file
          </button>
        </div>
        <div className="rounded-lg border border-dev-border p-4">
          <h2 className="text-xs uppercase tracking-wider text-dev-text-secondary mb-3">
            Playback
          </h2>
          <div className="flex items-center justify-between text-sm">
            <span>Frame rate</span>
            <span className="text-dev-text-secondary">{fps} fps</span>
          </div>
          <input
            type="range"
            min={MIN_FPS}
            max={MAX_FPS}
            step={1}
            value={fps}
            onChange={(event) => setFps(Number(event.target.value))}
            className="mt-2 w-full accent-dev-accent-blue cursor-pointer"
            aria-label="Frame rate"
          />
          <p className="mt-1 text-xs text-dev-text-secondary">
            Lower rates scan more reliably. {MIN_FPS}–{MAX_FPS} fps.
          </p>
        </div>
        <div className="rounded-lg border border-dev-border p-4">
          <h2 className="text-xs uppercase tracking-wider text-dev-text-secondary mb-3">
            Export
          </h2>
          {webmSupported ? (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => void handleExportWebm()}
                disabled={exporting}
              >
                {exporting ? <Film size={14} /> : <Download size={14} />}
                {exporting ? "Recording..." : "Download as WebM video"}
              </button>
              {exporting && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-dev-inset overflow-hidden">
                    <div
                      className="h-full rounded-full bg-dev-accent-blue transition-all"
                      style={{ width: `${exportProgress * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-dev-text-secondary">
                    {Math.round(exportProgress * 100)}%
                  </p>
                </div>
              )}
              <p className="mt-3 text-xs text-dev-text-secondary">
                Records the looping frame stream into a video you can play on
                another device and scan with the decode mode.
              </p>
            </>
          ) : (
            <p className="text-xs text-dev-text-secondary">
              Your browser does not support canvas video recording.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default QrStreamEncoder
