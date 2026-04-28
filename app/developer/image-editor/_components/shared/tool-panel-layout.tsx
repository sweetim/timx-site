import type { ReactNode } from "react"
import CanvasDropOverlay from "../canvas-drop-overlay"
import type { CanvasDropProps } from "../image-editor"

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

function ToolPanelLayout({
  canvasDropProps,
  canvasContent,
  sidebarContent,
  hiddenInputs,
}: ToolPanelLayoutProps) {
  return (
    <div className="grid h-full min-h-[620px] bg-dev-canvas lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section
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
        {canvasContent}
      </section>

      <aside className="overflow-auto border-t border-dev-border bg-dev-inset p-4 lg:border-l lg:border-t-0">
        {sidebarContent}
      </aside>

      {hiddenInputs}
    </div>
  )
}

export default ToolPanelLayout
