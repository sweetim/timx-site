"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Status =
  | { phase: "idle" }
  | { phase: "editing"; imageUrl: string; imageWidth: number; imageHeight: number }
  | { phase: "scaled"; originalUrl: string; scaledUrl: string }

type UseImageScalerOptions = {
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
}

function useImageScaler({ onResult, onSourceImage }: UseImageScalerOptions = {}) {
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [percentage, setPercentage] = useState(100)
  const [targetWidth, setTargetWidth] = useState(0)
  const [targetHeight, setTargetHeight] = useState(0)
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const resultBlobRef = useRef<Blob | null>(null)
  const onSourceImageRef = useRef(onSourceImage)
  const statusRef = useRef<Status>(status)
  const naturalDimensionsRef = useRef({ width: 0, height: 0 })

  useEffect(() => { onSourceImageRef.current = onSourceImage }, [onSourceImage])
  useEffect(() => { statusRef.current = status }, [status])

  const loadImage = useCallback((file: File, notifySource = true) => {
    if (notifySource) onSourceImageRef.current?.(file, file.name)

    const prev = statusRef.current
    if (prev.phase === "editing") URL.revokeObjectURL(prev.imageUrl)
    else if (prev.phase === "scaled") URL.revokeObjectURL(prev.originalUrl)

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      naturalDimensionsRef.current = { width: img.naturalWidth, height: img.naturalHeight }
      setPercentage(100)
      setTargetWidth(img.naturalWidth)
      setTargetHeight(img.naturalHeight)
      setStatus({
        phase: "editing",
        imageUrl: url,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      })
    }
    img.src = url
  }, [])

  const handlePercentageChange = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(500, value))
    setPercentage(clamped)
    if (lockAspectRatio) {
      const { width, height } = naturalDimensionsRef.current
      setTargetWidth(Math.round(width * clamped / 100))
      setTargetHeight(Math.round(height * clamped / 100))
    }
  }, [lockAspectRatio])

  const handleWidthChange = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(10000, value))
    setTargetWidth(clamped)
    const { width, height } = naturalDimensionsRef.current
    if (lockAspectRatio && width > 0) {
      const newHeight = Math.round(clamped * height / width)
      setTargetHeight(newHeight)
      setPercentage(Math.round(clamped / width * 100))
    } else {
      setPercentage(Math.round(clamped / width * 100))
    }
  }, [lockAspectRatio])

  const handleHeightChange = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(10000, value))
    setTargetHeight(clamped)
    const { width, height } = naturalDimensionsRef.current
    if (lockAspectRatio && height > 0) {
      const newWidth = Math.round(clamped * width / height)
      setTargetWidth(newWidth)
      setPercentage(Math.round(clamped / height * 100))
    } else {
      setPercentage(Math.round(clamped / height * 100))
    }
  }, [lockAspectRatio])

  const handleScale = useCallback(() => {
    if (statusRef.current.phase !== "editing" && statusRef.current.phase !== "scaled") return
    const img = imageRef.current
    if (!img) return

    const prev = statusRef.current
    const originalUrl = prev.phase === "scaled" ? prev.originalUrl : prev.imageUrl

    const canvas = document.createElement("canvas")
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
    canvas.toBlob((blob) => {
      if (!blob) return
      if (prev.phase === "scaled") URL.revokeObjectURL(prev.scaledUrl)
      resultBlobRef.current = blob
      const scaledUrl = URL.createObjectURL(blob)
      setStatus({ phase: "scaled", originalUrl, scaledUrl })
      onResult?.(blob)
    }, "image/png")
  }, [targetWidth, targetHeight, onResult])

  const resetLocal = useCallback(() => {
    const prev = statusRef.current
    if (prev.phase === "editing") URL.revokeObjectURL(prev.imageUrl)
    else if (prev.phase === "scaled") {
      URL.revokeObjectURL(prev.originalUrl)
      URL.revokeObjectURL(prev.scaledUrl)
    }
    setStatus({ phase: "idle" })
    setPercentage(100)
    setTargetWidth(0)
    setTargetHeight(0)
    imageRef.current = null
    resultBlobRef.current = null
    naturalDimensionsRef.current = { width: 0, height: 0 }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) loadImage(file)
  }, [loadImage])

  return {
    status,
    percentage,
    targetWidth,
    targetHeight,
    lockAspectRatio,
    isDragOver,
    fileInputRef,
    resultBlobRef,
    setLockAspectRatio,
    setIsDragOver,
    loadImage,
    handlePercentageChange,
    handleWidthChange,
    handleHeightChange,
    handleScale,
    handleDrop,
    resetLocal,
  }
}

export default useImageScaler
export type { Status }
