import { useContext } from "react"
import CanvasZoomContext from "../shared/canvas-zoom-context"
import { getCursorForHandle } from "./_lib/crop-math"
import { HANDLE_SIZE } from "./constants"
import type { AnchorMode, CropRect, DragState } from "./types"

export function CropOverlay({
  crop,
  anchorMode,
  onDragStart,
}: {
  crop: CropRect
  anchorMode: AnchorMode
  onDragStart: (drag: DragState) => void
}) {
  const canvasZoom = useContext(CanvasZoomContext)
  const handleHalf = HANDLE_SIZE / 2
  const handles: { type: DragState["type"]; style: React.CSSProperties }[] = [
    {
      type: "nw",
      style: { left: crop.x - handleHalf, top: crop.y - handleHalf },
    },
    {
      type: "ne",
      style: {
        left: crop.x + crop.width - handleHalf,
        top: crop.y - handleHalf,
      },
    },
    {
      type: "sw",
      style: {
        left: crop.x - handleHalf,
        top: crop.y + crop.height - handleHalf,
      },
    },
    {
      type: "se",
      style: {
        left: crop.x + crop.width - handleHalf,
        top: crop.y + crop.height - handleHalf,
      },
    },
    {
      type: "n",
      style: {
        left: crop.x + crop.width / 2 - handleHalf,
        top: crop.y - handleHalf,
      },
    },
    {
      type: "s",
      style: {
        left: crop.x + crop.width / 2 - handleHalf,
        top: crop.y + crop.height - handleHalf,
      },
    },
    {
      type: "e",
      style: {
        left: crop.x + crop.width - handleHalf,
        top: crop.y + crop.height / 2 - handleHalf,
      },
    },
    {
      type: "w",
      style: {
        left: crop.x - handleHalf,
        top: crop.y + crop.height / 2 - handleHalf,
      },
    },
  ]

  return (
    <div
      className="absolute inset-0"
      role="application"
      aria-label="Image crop area"
    >
      <div
        className="absolute inset-0 bg-black/70"
        style={{
          clipPath: `polygon(
            evenodd,
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% 0%,
            ${crop.x}px ${crop.y}px,
            ${crop.x + crop.width}px ${crop.y}px,
            ${crop.x + crop.width}px ${crop.y + crop.height}px,
            ${crop.x}px ${crop.y + crop.height}px,
            ${crop.x}px ${crop.y}px
          )`,
        }}
      />
      <div
        className="absolute pointer-events-none border-2 border-white/70"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
        }}
      />
      <button
        type="button"
        aria-label="Move crop area"
        className="no-bounce absolute touch-none border-2 border-white/70 bg-transparent"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          cursor: anchorMode === "edge" ? "move" : "default",
          pointerEvents: anchorMode === "edge" ? "auto" : "none",
        }}
        onPointerDown={(e) => {
          if (anchorMode !== "edge") return
          e.preventDefault()
          onDragStart({
            type: "move",
            startX: e.clientX,
            startY: e.clientY,
            startCrop: { ...crop },
            canvasZoom,
          })
        }}
      />
      {handles.map(({ type, style }) => (
        <button
          key={type}
          type="button"
          aria-label={`Resize ${type}`}
          className="no-bounce absolute touch-none bg-white border border-dev-border rounded-sm"
          style={{
            ...style,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            cursor: getCursorForHandle(type),
            zIndex: 10,
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDragStart({
              type,
              startX: e.clientX,
              startY: e.clientY,
              startCrop: { ...crop },
              canvasZoom,
            })
          }}
        />
      ))}
    </div>
  )
}
