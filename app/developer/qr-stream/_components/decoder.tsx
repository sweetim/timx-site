"use client"

import clsx from "clsx"
import jsQR from "jsqr"
import {
  Camera,
  CameraOff,
  CircleCheck,
  CircleX,
  Download,
  FileVideo,
  RotateCcw,
  ScanLine,
  Upload,
} from "lucide-react"
import { type FC, useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import {
  assembleFile,
  formatBytes,
  parseQrFrame,
  type QrStreamHeader,
} from "../_lib/qr-protocol"

const MAX_SCAN_WIDTH = 1280
const MAX_MISSING_SHOWN = 30

type DecodeSource = "camera" | "video"

type DecodeState =
  | { phase: "idle" }
  | {
      phase: "receiving"
      source: DecodeSource
      fileName: string | null
      fileSize: number | null
      total: number | null
      received: number
      missing: number[]
    }
  | {
      phase: "complete"
      fileName: string
      fileSize: number
      total: number
      fileUrl: string
    }
  | { phase: "error"; message: string }

const QrStreamDecoder: FC = () => {
  const [source, setSource] = useState<DecodeSource | null>(null)
  const [state, setState] = useState<DecodeState>({ phase: "idle" })
  const [cameraActive, setCameraActive] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Map<number, string>>(new Map())
  const headerRef = useRef<QrStreamHeader | null>(null)
  const videoUrlRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const cancelScanLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const stopCameraStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop()
    })
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const revokeVideoUrl = useCallback(() => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current)
      videoUrlRef.current = null
    }
    setVideoUrl(null)
  }, [])

  const refreshProgress = useCallback((activeSource: DecodeSource) => {
    const header = headerRef.current
    const chunks = chunksRef.current
    const missing: number[] = []
    if (header) {
      for (
        let i = 1;
        i <= header.totalFrames && missing.length <= MAX_MISSING_SHOWN;
        i++
      ) {
        if (!chunks.has(i)) missing.push(i)
      }
    }
    setState((previous) => {
      if (previous.phase === "complete" || previous.phase === "error") {
        return previous
      }
      return {
        phase: "receiving",
        source: activeSource,
        fileName: header?.name ?? null,
        fileSize: header?.size ?? null,
        total: header?.totalFrames ?? null,
        received: header ? chunks.size : 0,
        missing: missing.slice(0, MAX_MISSING_SHOWN),
      }
    })
  }, [])

  const handleDecodedText = useCallback(
    (text: string, activeSource: DecodeSource) => {
      const parsed = parseQrFrame(text)
      if (!parsed) return
      if (parsed.kind === "header") {
        const incoming = parsed.header
        const current = headerRef.current
        const sameStream =
          current !== null
          && current.name === incoming.name
          && current.size === incoming.size
          && current.totalFrames === incoming.totalFrames
        if (sameStream) return
        if (current) {
          chunksRef.current = new Map()
        }
        headerRef.current = incoming
        refreshProgress(activeSource)
        return
      }
      const { index, data } = parsed
      if (index < 1) return
      const header = headerRef.current
      if (header && index > header.totalFrames) return
      if (chunksRef.current.has(index)) return
      chunksRef.current.set(index, data)
      if (header && chunksRef.current.size >= header.totalFrames) {
        const blob = assembleFile(header, chunksRef.current)
        if (!blob) {
          cancelScanLoop()
          stopCameraStream()
          setState({
            phase: "error",
            message:
              "All frames were received but the reassembled size does not match the file header. Start over and scan again.",
          })
          return
        }
        const fileUrl = URL.createObjectURL(blob)
        cancelScanLoop()
        stopCameraStream()
        setState({
          phase: "complete",
          fileName: header.name,
          fileSize: header.size,
          total: header.totalFrames,
          fileUrl,
        })
        return
      }
      refreshProgress(activeSource)
    },
    [refreshProgress, cancelScanLoop, stopCameraStream],
  )

  const scanVideoFrame = useCallback(
    (video: HTMLVideoElement, activeSource: DecodeSource) => {
      let canvas = scanCanvasRef.current
      if (!canvas) {
        canvas = document.createElement("canvas")
        scanCanvasRef.current = canvas
      }
      const scale = Math.min(1, MAX_SCAN_WIDTH / video.videoWidth)
      const width = Math.max(1, Math.round(video.videoWidth * scale))
      const height = Math.max(1, Math.round(video.videoHeight * scale))
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      const context = canvas.getContext("2d", { willReadFrequently: true })
      if (!context) return
      context.drawImage(video, 0, 0, width, height)
      const imageData = context.getImageData(0, 0, width, height)
      const code = jsQR(imageData.data, width, height)
      if (code?.data) {
        handleDecodedText(code.data, activeSource)
      }
    },
    [handleDecodedText],
  )

  const startScanLoop = useCallback(
    (activeSource: DecodeSource) => {
      cancelScanLoop()
      const step = () => {
        const video = videoRef.current
        if (video && video.readyState >= 2 && !video.paused && !video.ended) {
          scanVideoFrame(video, activeSource)
        }
        rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [cancelScanLoop, scanVideoFrame],
  )

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
      }
      setCameraActive(true)
      refreshProgress("camera")
      startScanLoop("camera")
    } catch {
      setState({
        phase: "error",
        message:
          "Could not access the camera. Grant camera permission and try again.",
      })
    }
  }, [refreshProgress, startScanLoop])

  const handleStopCamera = useCallback(() => {
    cancelScanLoop()
    stopCameraStream()
    setState((previous) =>
      previous.phase === "receiving" && previous.received > 0
        ? previous
        : { phase: "idle" },
    )
  }, [cancelScanLoop, stopCameraStream])

  const handleVideoFile = useCallback(
    (file: File) => {
      revokeVideoUrl()
      cancelScanLoop()
      stopCameraStream()
      chunksRef.current = new Map()
      headerRef.current = null
      const url = URL.createObjectURL(file)
      videoUrlRef.current = url
      setVideoUrl(url)
      setState({ phase: "idle" })
    },
    [cancelScanLoop, revokeVideoUrl, stopCameraStream],
  )

  const handleVideoPlay = useCallback(() => {
    if (state.phase !== "complete" && state.phase !== "error") {
      refreshProgress("video")
      startScanLoop("video")
    }
  }, [state.phase, refreshProgress, startScanLoop])

  useEffect(() => {
    return () => {
      cancelScanLoop()
      streamRef.current?.getTracks().forEach((track) => {
        track.stop()
      })
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current)
      }
    }
  }, [cancelScanLoop])

  const handleReset = useCallback(() => {
    cancelScanLoop()
    stopCameraStream()
    revokeVideoUrl()
    chunksRef.current = new Map()
    headerRef.current = null
    setSource(null)
    setState({ phase: "idle" })
  }, [cancelScanLoop, revokeVideoUrl, stopCameraStream])

  const handleDownload = useCallback(() => {
    if (state.phase !== "complete") return
    const anchor = document.createElement("a")
    anchor.href = state.fileUrl
    anchor.download = state.fileName || "qr-stream-file"
    anchor.click()
  }, [state])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center gap-2">
          {(
            [
              { id: "camera", label: "Live Camera", icon: Camera },
              { id: "video", label: "Video File", icon: FileVideo },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={clsx(
                "inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm transition-colors cursor-pointer",
                source === id
                  ? "bg-dev-accent-blue text-white"
                  : "bg-dev-button hover:bg-dev-button-hover text-dev-text",
              )}
              onClick={() => {
                if (source !== id) handleReset()
                setSource(id)
              }}
              aria-pressed={source === id}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {source === "camera" && (
          <div className="rounded-lg border border-dev-border p-4">
            <div className="flex flex-col items-center gap-3">
              <video
                ref={videoRef}
                playsInline
                muted
                className={clsx(
                  "max-h-72 w-auto rounded border border-dev-border",
                  !cameraActive && "hidden",
                )}
              />
              {!cameraActive && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-accent-blue text-white transition-colors cursor-pointer"
                  onClick={() => void startCamera()}
                >
                  <Camera size={14} />
                  Start camera
                </button>
              )}
              {cameraActive && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
                  onClick={handleStopCamera}
                >
                  <CameraOff size={14} />
                  Stop camera
                </button>
              )}
              <p className="text-xs text-dev-text-secondary">
                Point the camera at the playing QR stream. Frames are collected
                as they are scanned — the sender can loop until the file is
                complete.
              </p>
            </div>
          </div>
        )}

        {source === "video" && (
          <div className="rounded-lg border border-dev-border p-4">
            <div className="flex flex-col items-center gap-3">
              {videoUrl ? (
                // biome-ignore lint/a11y/useMediaCaption: user-uploaded QR stream video carries no audio
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  src={videoUrl}
                  onPlay={handleVideoPlay}
                  className="max-h-72 w-auto rounded border border-dev-border"
                />
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-accent-blue text-white transition-colors cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload size={14} />
                  Choose a video
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) handleVideoFile(file)
                  event.target.value = ""
                }}
              />
              <p className="text-xs text-dev-text-secondary">
                Play a recorded QR stream video and every visible frame is
                scanned. Replay the video to catch missed frames.
              </p>
            </div>
          </div>
        )}

        {source === null && (
          <div className="rounded-lg border border-dev-border p-4 text-sm text-dev-text-secondary">
            Pick a source above: scan a live camera feed or decode frames from a
            recorded video file.
          </div>
        )}

        {match(state)
          .with({ phase: "idle" }, () => null)
          .with({ phase: "receiving" }, (receiving) => (
            <div className="rounded-lg border border-dev-border p-4">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider text-dev-text-secondary">
                <ScanLine className="size-3.5" />
                Receiving
              </h2>
              <p className="text-sm font-medium">
                {receiving.fileName ?? "Waiting for the header frame..."}
              </p>
              {receiving.total !== null && (
                <>
                  <p className="mt-1 text-xs text-dev-text-secondary">
                    {receiving.received}/{receiving.total} frames
                    {receiving.fileSize !== null
                      && ` · ${formatBytes(receiving.fileSize)}`}
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-dev-inset overflow-hidden">
                    <div
                      className="h-full rounded-full bg-dev-accent-blue transition-all"
                      style={{
                        width: `${(receiving.received / receiving.total) * 100}%`,
                      }}
                    />
                  </div>
                  {receiving.missing.length > 0 && (
                    <p className="mt-2 text-xs text-dev-accent-orange">
                      Missing frames: {receiving.missing.join(", ")}
                      {receiving.missing.length >= MAX_MISSING_SHOWN && ", …"}
                    </p>
                  )}
                </>
              )}
              {receiving.total === null && (
                <p className="mt-1 text-xs text-dev-text-secondary">
                  Scanned frames are collected once the header frame arrives.
                  Keep the stream in view.
                </p>
              )}
            </div>
          ))
          .with({ phase: "complete" }, (complete) => (
            <div className="rounded-lg border border-dev-accent-green/40 bg-dev-accent-green/5 p-4">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider text-dev-text-secondary">
                <CircleCheck className="size-3.5 text-dev-accent-green" />
                File received
              </h2>
              <p className="text-sm font-medium truncate">
                {complete.fileName}
              </p>
              <p className="mt-1 text-xs text-dev-text-secondary">
                {formatBytes(complete.fileSize)} · {complete.total} frames
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-accent-blue text-white transition-colors cursor-pointer"
                  onClick={handleDownload}
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
                  onClick={handleReset}
                >
                  <RotateCcw size={14} />
                  Start over
                </button>
              </div>
            </div>
          ))
          .with({ phase: "error" }, (errorState) => (
            <div className="rounded-lg border border-dev-accent-red/40 bg-dev-accent-red/5 p-4">
              <h2 className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-dev-text-secondary">
                <CircleX className="size-3.5 text-dev-accent-red" />
                Error
              </h2>
              <p className="text-sm">{errorState.message}</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 rounded p-1.5 px-3 py-1 text-sm bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
                onClick={handleReset}
              >
                <RotateCcw size={14} />
                Start over
              </button>
            </div>
          ))
          .exhaustive()}
      </div>
    </div>
  )
}

export default QrStreamDecoder
