"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { SourceImage } from "../../image-editor"
import { loadImageFile, stitchImages } from "../_lib/stitch-canvas"
import type { ImageItem, StackDirection, StitchedImage } from "../types"

type UseScreenshotStitcherOptions = {
  isActive?: boolean
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
  onAddSourceImages?: ((files: File[]) => Promise<SourceImage[]>) | undefined
}

function useScreenshotStitcher({
  onResult,
  onSourceImage,
  onAddSourceImages,
}: UseScreenshotStitcherOptions = {}) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [frameWidth, setFrameWidth] = useState(390)
  const [frameHeight, setFrameHeight] = useState(844)
  const [imageSpacing, setImageSpacing] = useState(0)
  const [direction, setDirection] = useState<StackDirection>("horizontal")
  const [backgroundColor, setBackgroundColor] = useState("#000000")
  const [transparentBackground, setTransparentBackground] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stitched, setStitched] = useState<StitchedImage | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef(images)
  const stitchedRef = useRef(stitched)

  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => { stitchedRef.current = stitched }, [stitched])

  useEffect(() => {
    return () => {
      for (const item of imagesRef.current) URL.revokeObjectURL(item.originalUrl)
      if (stitchedRef.current) URL.revokeObjectURL(stitchedRef.current.url)
    }
  }, [])

  const addFiles = useCallback(
    async (files: FileList | File[], notifySource = true) => {
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length === 0) return

      if (notifySource) {
        onSourceImage?.(imageFiles[0], imageFiles[0].name)
        if (onAddSourceImages) void onAddSourceImages(imageFiles)
      }

      const loadedImages = (await Promise.all(imageFiles.map(loadImageFile))).filter(
        (item): item is ImageItem => item !== null,
      )

      if (loadedImages.length === 0) return

      setImages((previousImages) => {
        const nextImages = [...previousImages, ...loadedImages]
        if (previousImages.length === 0) {
          setFrameWidth(Math.max(...nextImages.map((image) => image.naturalWidth)))
          setFrameHeight(Math.max(...nextImages.map((image) => image.naturalHeight)))
        }
        return nextImages
      })
      setStitched((previousStitched) => {
        if (previousStitched) URL.revokeObjectURL(previousStitched.url)
        return null
      })
    },
    [onSourceImage, onAddSourceImages],
  )

  const removeImage = useCallback((id: string) => {
    setImages((previousImages) => {
      const item = previousImages.find((image) => image.id === id)
      if (item) URL.revokeObjectURL(item.originalUrl)
      return previousImages.filter((image) => image.id !== id)
    })
    setStitched((previousStitched) => {
      if (previousStitched) URL.revokeObjectURL(previousStitched.url)
      return null
    })
  }, [])

  const handleStitch = useCallback(async () => {
    if (images.length === 0 || frameWidth < 1 || frameHeight < 1) return

    setIsProcessing(true)
    const blob = await stitchImages({
      images,
      frameWidth,
      frameHeight,
      imageSpacing,
      direction,
      backgroundColor: transparentBackground ? null : backgroundColor,
    })

    if (blob) {
      const outputWidth =
        direction === "horizontal"
          ? frameWidth * images.length + Math.max(0, images.length - 1) * imageSpacing
          : frameWidth
      const outputHeight =
        direction === "horizontal"
          ? frameHeight
          : frameHeight * images.length + Math.max(0, images.length - 1) * imageSpacing
      const output: StitchedImage = {
        url: URL.createObjectURL(blob),
        fileName: `stitched-screenshots-${direction}.png`,
        width: outputWidth,
        height: outputHeight,
        blob,
      }

      setStitched((previousStitched) => {
        if (previousStitched) URL.revokeObjectURL(previousStitched.url)
        return output
      })
      onResult?.(blob)
    }

    setIsProcessing(false)
  }, [
    images,
    frameWidth,
    frameHeight,
    imageSpacing,
    direction,
    backgroundColor,
    transparentBackground,
    onResult,
  ])

  const resetLocal = useCallback(() => {
    for (const image of images) URL.revokeObjectURL(image.originalUrl)
    if (stitched) URL.revokeObjectURL(stitched.url)
    setImages([])
    setStitched(null)
    setFrameWidth(390)
    setFrameHeight(844)
    setImageSpacing(0)
    setDirection("horizontal")
    setTransparentBackground(true)
  }, [images, stitched])

  return {
    images,
    isDragOver,
    frameWidth,
    frameHeight,
    imageSpacing,
    direction,
    backgroundColor,
    transparentBackground,
    isProcessing,
    stitched,
    fileInputRef,
    setFrameWidth,
    setFrameHeight,
    setImageSpacing,
    setDirection,
    setBackgroundColor,
    setTransparentBackground,
    setIsDragOver,
    addFiles,
    removeImage,
    handleStitch,
    resetLocal,
  }
}

export default useScreenshotStitcher
