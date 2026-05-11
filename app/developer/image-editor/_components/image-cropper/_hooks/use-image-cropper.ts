"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import {
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

function resolveRatio(
  preset: AspectRatioPreset,
  customRatio: number,
): number | null {
  if (preset === "custom") return customRatio
  return ASPECT_RATIOS.find((r) => r.preset === preset)?.ratio ?? null
}

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
  const [customRatio, setCustomRatio] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const anchorModeRef = useRef(anchorMode)
  const displayDimensionsRef = useRef(displayDimensions)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const resultBlobRef = useRef<Blob | null>(null)
  const onSourceImageRef = useRef(onSourceImage)
  const statusRef = useRef<Status>(status)
  const dragCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    anchorModeRef.current = anchorMode
  }, [anchorMode])
  useEffect(() => {
    displayDimensionsRef.current = displayDimensions
  }, [displayDimensions])
  useEffect(() => {
    onSourceImageRef.current = onSourceImage
  }, [onSourceImage])
  useEffect(() => {
    statusRef.current = status
  }, [status])
  useEffect(() => {
    return () => {
      dragCleanupRef.current?.()
      dragCleanupRef.current = null
    }
  }, [])

  const loadImage = useCallback((file: File, notifySource = true) => {
    if (notifySource) onSourceImageRef.current?.(file, file.name)

    const prev = statusRef.current
    if (prev.phase === "editing") URL.revokeObjectURL(prev.imageUrl)
    else if (prev.phase === "cropped") URL.revokeObjectURL(prev.originalUrl)

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
      const ratio = resolveRatio(DEFAULT_ASPECT_RATIO, customRatio)
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
      const ratio = resolveRatio(preset, customRatio)
      setCrop((prev) => {
        if (ratio === null) {
          return clampCrop(
            prev,
            displayDimensions.width,
            displayDimensions.height,
            null,
          )
        }
        const cx = prev.x + prev.width / 2
        const cy = prev.y + prev.height / 2
        const maxW = displayDimensions.width
        const maxH = displayDimensions.height
        let width: number
        let height: number
        if (maxW / maxH > ratio) {
          height = maxH
          width = height * ratio
        } else {
          width = maxW
          height = width / ratio
        }
        return clampCropKeepCenter(
          { x: cx - width / 2, y: cy - height / 2, width, height },
          cx,
          cy,
          maxW,
          maxH,
          ratio,
        )
      })
    },
    [displayDimensions, customRatio],
  )

  const handleCustomRatioChange = useCallback(
    (ratio: number) => {
      if (ratio <= 0 || !Number.isFinite(ratio)) return
      setCustomRatio(ratio)
      if (aspectPreset !== "custom") return
      setCrop((prev) => {
        const cx = prev.x + prev.width / 2
        const cy = prev.y + prev.height / 2
        const maxW = displayDimensions.width
        const maxH = displayDimensions.height
        let width: number
        let height: number
        if (maxW / maxH > ratio) {
          height = maxH
          width = height * ratio
        } else {
          width = maxW
          height = width / ratio
        }
        return clampCropKeepCenter(
          { x: cx - width / 2, y: cy - height / 2, width, height },
          cx,
          cy,
          maxW,
          maxH,
          ratio,
        )
      })
    },
    [displayDimensions, aspectPreset],
  )

  const handleDimensionChange = useCallback(
    (dimension: "width" | "height", value: string) => {
      const parsed = parseInt(value, 10)
      if (Number.isNaN(parsed) || parsed <= 0) return
      const ratio = resolveRatio(aspectPreset, customRatio)
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
    [aspectPreset, customRatio, displayDimensions, crop, anchorMode],
  )

  const handleDragStart = useCallback(
    (newDrag: DragState) => {
      const ratio = resolveRatio(aspectPreset, customRatio)
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
        dragCleanupRef.current = null
        if (anchorModeRef.current === "center" && newDrag.type !== "move") {
          const dims = displayDimensionsRef.current
          const r = resolveRatio(aspectPreset, customRatio)
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
      dragCleanupRef.current = () => {
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleUp)
      }
    },
    [displayDimensions, anchorMode, aspectPreset, customRatio],
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
    customRatio,
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
    handleCustomRatioChange,
    handleDimensionChange,
    handleDragStart,
    handleCrop,
    handleDrop,
    resetLocal,
  }
}

export default useImageCropper
