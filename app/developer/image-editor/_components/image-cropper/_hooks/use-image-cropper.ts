"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import {
  applyAspectRatio,
  clampCrop,
  clampCropKeepCenter,
  clampEdgeCrop,
  computeCenterResize,
  computeEdgeResize,
  getImageDisplayDimensions,
  getInitialCrop,
} from "../_lib/crop-math"
import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  MAX_DISPLAY_HEIGHT,
  MAX_DISPLAY_WIDTH,
} from "../constants"
import type { AnchorMode, AspectRatioPreset, DragState, Status } from "../types"

type UseImageCropperOptions = {
  isActive?: boolean
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
}

function useImageCropper({
  onResult,
  onSourceImage,
}: UseImageCropperOptions = {}) {
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
    scale: 1,
  })
  const [anchorMode, setAnchorMode] = useState<AnchorMode>("center")
  const [aspectPreset, setAspectPreset] =
    useState<AspectRatioPreset>(DEFAULT_ASPECT_RATIO)
  const [isDragOver, setIsDragOver] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const anchorModeRef = useRef(anchorMode)
  const displayDimensionsRef = useRef(displayDimensions)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const resultBlobRef = useRef<Blob | null>(null)
  const onSourceImageRef = useRef(onSourceImage)

  useEffect(() => {
    anchorModeRef.current = anchorMode
  }, [anchorMode])
  useEffect(() => {
    displayDimensionsRef.current = displayDimensions
  }, [displayDimensions])
  useEffect(() => {
    onSourceImageRef.current = onSourceImage
  }, [onSourceImage])

  const loadImage = useCallback((file: File, notifySource = true) => {
    if (notifySource) onSourceImageRef.current?.(file, file.name)

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const containerWidth = Math.min(wrapper.clientWidth, MAX_DISPLAY_WIDTH)
      const containerHeight = Math.min(
        Math.max(wrapper.clientHeight, 400),
        MAX_DISPLAY_HEIGHT,
      )
      const { displayWidth, displayHeight, scale } = getImageDisplayDimensions(
        img.naturalWidth,
        img.naturalHeight,
        containerWidth,
        containerHeight,
      )
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === DEFAULT_ASPECT_RATIO)?.ratio
        ?? null
      setDisplayDimensions({
        width: displayWidth,
        height: displayHeight,
        scale,
      })
      setCrop(getInitialCrop(displayWidth, displayHeight, ratio))
      setAspectPreset(DEFAULT_ASPECT_RATIO)
      setStatus({
        phase: "editing",
        imageUrl: url,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      })
    }
    img.src = url
  }, [])

  const handleAspectRatioChange = useCallback(
    (preset: AspectRatioPreset) => {
      setAspectPreset(preset)
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === preset)?.ratio ?? null
      setCrop((prev) => {
        const withRatio = applyAspectRatio(prev, ratio)
        return clampCrop(
          withRatio,
          displayDimensions.width,
          displayDimensions.height,
          ratio,
        )
      })
    },
    [displayDimensions],
  )

  const handleDimensionChange = useCallback(
    (dimension: "width" | "height", value: string) => {
      const parsed = parseInt(value, 10)
      if (Number.isNaN(parsed) || parsed <= 0) return
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === aspectPreset)?.ratio ?? null
      const { scale } = displayDimensions
      const maxX = displayDimensions.width
      const maxY = displayDimensions.height
      let newDisplayW: number
      let newDisplayH: number
      if (dimension === "width") {
        newDisplayW = parsed * scale
        newDisplayH = ratio !== null ? newDisplayW / ratio : crop.height
      } else {
        newDisplayH = parsed * scale
        newDisplayW = ratio !== null ? newDisplayH * ratio : crop.width
      }
      newDisplayW = Math.max(20, Math.min(newDisplayW, maxX))
      newDisplayH = Math.max(20, Math.min(newDisplayH, maxY))
      const cx = crop.x + crop.width / 2
      const cy = crop.y + crop.height / 2
      const newCrop =
        anchorMode === "center"
          ? {
              x: cx - newDisplayW / 2,
              y: cy - newDisplayH / 2,
              width: newDisplayW,
              height: newDisplayH,
            }
          : { x: crop.x, y: crop.y, width: newDisplayW, height: newDisplayH }
      setCrop(clampCrop(newCrop, maxX, maxY, ratio))
    },
    [aspectPreset, displayDimensions, crop, anchorMode],
  )

  const handleDragStart = useCallback(
    (newDrag: DragState) => {
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === aspectPreset)?.ratio ?? null
      const handleMove = (e: MouseEvent) => {
        const dx = e.clientX - newDrag.startX
        const dy = e.clientY - newDrag.startY
        const sc = newDrag.startCrop
        const maxX = displayDimensions.width
        const maxY = displayDimensions.height

        const next = match(newDrag.type)
          .with("move", () => ({
            x: sc.x + dx,
            y: sc.y + dy,
            width: sc.width,
            height: sc.height,
          }))
          .otherwise(() =>
            match(anchorMode)
              .with("edge", () =>
                computeEdgeResize(newDrag.type, dx, dy, sc, ratio),
              )
              .with("center", () =>
                computeCenterResize(newDrag.type, dx, dy, sc, ratio),
              )
              .exhaustive(),
          )

        if (anchorMode === "center" && newDrag.type !== "move") {
          const cx = sc.x + sc.width / 2
          const cy = sc.y + sc.height / 2
          setCrop(clampCropKeepCenter(next, cx, cy, maxX, maxY, ratio))
        } else if (anchorMode === "edge" && newDrag.type !== "move") {
          setCrop(clampEdgeCrop(next, newDrag.type, maxX, maxY, ratio))
        } else {
          setCrop(clampCrop(next, maxX, maxY, ratio))
        }
      }
      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleUp)
        if (anchorModeRef.current === "center" && newDrag.type !== "move") {
          const dims = displayDimensionsRef.current
          const r =
            ASPECT_RATIOS.find((ar) => ar.preset === aspectPreset)?.ratio
            ?? null
          const centerX = newDrag.startCrop.x + newDrag.startCrop.width / 2
          const centerY = newDrag.startCrop.y + newDrag.startCrop.height / 2
          setCrop((prev) =>
            clampCropKeepCenter(
              prev,
              centerX,
              centerY,
              dims.width,
              dims.height,
              r,
            ),
          )
        }
      }
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleUp)
    },
    [displayDimensions, anchorMode, aspectPreset],
  )

  const handleCrop = useCallback(() => {
    if (status.phase !== "editing" && status.phase !== "cropped") return
    const img = imageRef.current
    if (!img) return
    const originalUrl =
      status.phase === "cropped" ? status.originalUrl : status.imageUrl
    const { scale } = displayDimensions
    const sourceX = crop.x / scale
    const sourceY = crop.y / scale
    const sourceWidth = crop.width / scale
    const sourceHeight = crop.height / scale
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(sourceWidth)
    canvas.height = Math.round(sourceHeight)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    canvas.toBlob((blob) => {
      if (!blob) return
      if (status.phase === "cropped") URL.revokeObjectURL(status.croppedUrl)
      resultBlobRef.current = blob
      const croppedUrl = URL.createObjectURL(blob)
      setStatus({ phase: "cropped", originalUrl, croppedUrl })
      onResult?.(blob)
    }, "image/png")
  }, [status, crop, displayDimensions, onResult])

  const resetLocal = useCallback(() => {
    match(status)
      .with({ phase: "idle" }, () => {})
      .with({ phase: "editing" }, ({ imageUrl }) =>
        URL.revokeObjectURL(imageUrl),
      )
      .with({ phase: "cropped" }, ({ originalUrl, croppedUrl }) => {
        URL.revokeObjectURL(originalUrl)
        URL.revokeObjectURL(croppedUrl)
      })
      .exhaustive()
    setStatus({ phase: "idle" })
    setCrop({ x: 0, y: 0, width: 0, height: 0 })
    imageRef.current = null
    resultBlobRef.current = null
  }, [status])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith("image/")) loadImage(file)
    },
    [loadImage],
  )

  return {
    status,
    crop,
    displayDimensions,
    anchorMode,
    aspectPreset,
    isDragOver,
    wrapperRef,
    fileInputRef,
    resultBlobRef,
    setCrop,
    setAnchorMode,
    setAspectPreset,
    setIsDragOver,
    loadImage,
    handleAspectRatioChange,
    handleDimensionChange,
    handleDragStart,
    handleCrop,
    handleDrop,
    resetLocal,
  }
}

export default useImageCropper
