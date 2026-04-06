"use client"

import { ChevronsLeftRight } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import CheckerboardPattern from "./checkerboard-pattern"

type ImageComparisonSliderProps = {
  originalUrl: string
  resultUrl: string
}

function ImageComparisonSlider({
  originalUrl,
  resultUrl,
}: ImageComparisonSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percent)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      updatePosition(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      updatePosition(e.touches[0].clientX)
    }

    const handleEnd = () => {
      isDragging.current = false
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleEnd)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleEnd)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleEnd)
    }
  }, [updatePosition])

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isDragging.current = true
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      updatePosition(clientX)
    },
    [updatePosition],
  )

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Image comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 2))
          if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 2))
        }}
        className="relative select-none rounded-md border border-dev-border overflow-hidden cursor-ew-resize max-h-125 outline-none"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className="relative">
          <CheckerboardPattern />
          {/** biome-ignore lint/performance/noImgElement: using native img for blob URLs that bypass Next.js image optimization */}
          <img
            src={resultUrl}
            alt="Result with background removed"
            className="relative w-full h-auto max-h-125 object-contain"
            draggable={false}
          />
        </div>

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/** biome-ignore lint/performance/noImgElement: using native img for blob URLs that bypass Next.js image optimization */}
          <img
            src={originalUrl}
            alt="Original"
            className="w-full h-auto max-h-125 object-contain"
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center pointer-events-none">
            <ChevronsLeftRight
              aria-hidden="true"
              width={16}
              height={16}
              className="text-dev-inset"
            />
          </div>
        </div>

        <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-medium bg-black/50 text-white pointer-events-none">
          Original
        </div>
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-medium bg-black/50 text-white pointer-events-none">
          Removed
        </div>
      </div>
      <p className="text-xs text-dev-text-secondary text-center">
        Drag the slider to compare
      </p>
    </div>
  )
}

export default ImageComparisonSlider
