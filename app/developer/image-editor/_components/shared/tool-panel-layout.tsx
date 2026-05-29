import type { ReactNode } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import CanvasDropOverlay from "../canvas-drop-overlay"
import type { CanvasDropProps } from "../image-editor"
import CanvasZoomContext from "./canvas-zoom-context"

type ToolPanelLayoutProps = {
  canvasDropProps: CanvasDropProps | undefined
  canvasContent: ReactNode
  sidebarContent: ReactNode
  hiddenInputs?: ReactNode
}

const GRID_BG_STYLE = {
  backgroundImage:
    "linear-gradient(#373e47 1px, transparent 1px), linear-gradient(90deg, #373e47 1px, transparent 1px)",
  backgroundSize: "28px 28px",
}

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1

function ToolPanelLayout({
  canvasDropProps,
  canvasContent,
  sidebarContent,
  hiddenInputs,
}: ToolPanelLayoutProps) {
  const [zoom, setZoom] = useState(1)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      setZoom((prev) => {
        const direction = e.deltaY > 0 ? -1 : 1
        return Math.min(
          MAX_ZOOM,
          Math.max(
            MIN_ZOOM,
            Math.round((prev + direction * ZOOM_STEP) * 10) / 10,
          ),
        )
      })
    }

    section.addEventListener("wheel", handleWheel, { passive: false })
    return () => section.removeEventListener("wheel", handleWheel)
  }, [])

  const resetZoom = useCallback(() => setZoom(1), [])

  return (
    <CanvasZoomContext.Provider value={zoom}>
      <div className="grid h-full min-h-[620px] bg-dev-canvas lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          ref={sectionRef}
          className="relative min-h-[520px] overflow-auto bg-dev-inset p-4 sm:p-6"
          style={GRID_BG_STYLE}
          onDragOver={canvasDropProps?.onDragOver}
          onDragEnter={canvasDropProps?.onDragEnter}
          onDragLeave={canvasDropProps?.onDragLeave}
          onDrop={canvasDropProps?.onDrop}
        >
          {canvasDropProps && (
            <CanvasDropOverlay
              isDragOver={canvasDropProps.isDragOver}
              overlayLabel={canvasDropProps.overlayLabel}
            />
          )}
          <div style={zoom !== 1 ? { zoom } : undefined}>{canvasContent}</div>
          {zoom !== 1 ? (
            <button
              type="button"
              onClick={resetZoom}
              className="absolute bottom-3 left-3 z-10 rounded-md border border-dev-border bg-dev-inset/90 px-2 py-1 text-xs font-medium text-dev-text-secondary backdrop-blur-sm transition-colors cursor-pointer hover:bg-dev-surface hover:text-dev-text"
            >
              {Math.round(zoom * 100)}%
            </button>
          ) : null}
        </section>

        <aside className="overflow-auto border-t border-dev-border bg-dev-inset p-4 lg:border-l lg:border-t-0">
          {sidebarContent}
        </aside>

        {hiddenInputs}
      </div>
    </CanvasZoomContext.Provider>
  )
}

export default ToolPanelLayout
