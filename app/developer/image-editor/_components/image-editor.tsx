"use client"

import classNames from "classnames"
import type { LucideIcon } from "lucide-react"
import { Crop, Eraser, Images, Layers } from "lucide-react"
import { useState } from "react"
import BackgroundRemover from "../../_components/background-remover"
import ImageCropper from "../../image-cropper/_components/image-cropper"
import ScreenshotStitcher from "../../image-resizer/_components/image-resizer"

type EditorTool = "background" | "crop" | "stitch"

type ToolItem = {
  id: EditorTool
  name: string
  shortName: string
  description: string
  icon: LucideIcon
}

const TOOLS: ToolItem[] = [
  {
    id: "background",
    name: "Background Remover",
    shortName: "Remove",
    description: "Remove an image background with local AI processing.",
    icon: Eraser,
  },
  {
    id: "crop",
    name: "Crop",
    shortName: "Crop",
    description: "Crop one image with presets and center or edge handles.",
    icon: Crop,
  },
  {
    id: "stitch",
    name: "Screenshot Stitcher",
    shortName: "Stitch",
    description: "Stack mobile screenshots in equal frames for landing pages.",
    icon: Images,
  },
]

function renderEditorTool(activeTool: EditorTool) {
  if (activeTool === "background") return <BackgroundRemover variant="panel" />
  if (activeTool === "crop") return <ImageCropper variant="panel" />
  return <ScreenshotStitcher variant="panel" />
}

function ImageEditor() {
  const [activeTool, setActiveTool] = useState<EditorTool>("stitch")
  const tool = TOOLS.find((item) => item.id === activeTool) ?? TOOLS[0]
  const ToolIcon = tool.icon

  return (
    <div className="h-full min-h-full bg-dev-canvas text-dev-text lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
      <aside className="flex lg:flex-col items-center gap-2 border-b lg:border-b-0 lg:border-r border-dev-border bg-dev-inset px-3 py-2 lg:px-2 lg:py-4">
        <div className="hidden lg:flex size-9 items-center justify-center rounded-md border border-dev-border bg-dev-surface text-dev-text-secondary">
          <Layers className="size-4" />
        </div>
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {TOOLS.map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeTool

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTool(item.id)}
                className={classNames(
                  "flex lg:flex-col items-center justify-center gap-1 rounded-md px-3 py-2 lg:size-14 lg:px-0 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-dev-accent-blue text-white"
                    : "text-dev-text-secondary hover:bg-dev-surface hover:text-dev-text",
                )}
                title={item.name}
              >
                <Icon className="size-4" />
                <span className="lg:text-[10px]">{item.shortName}</span>
              </button>
            )
          })}
        </div>
      </aside>

      <main className="min-h-0 bg-[#15191f] lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-dev-border bg-dev-surface px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <ToolIcon className="size-4 shrink-0 text-dev-accent-blue" />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-dev-text">
                Image Editor
              </h1>
              <p className="truncate text-xs text-dev-text-secondary">
                {tool.name}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 rounded border border-dev-border bg-dev-inset px-2 py-1 text-[11px] text-dev-text-secondary">
            Local canvas workspace
          </div>
        </div>

        <div className="min-h-[620px] lg:min-h-0 lg:flex-1 overflow-hidden">
          {renderEditorTool(activeTool)}
        </div>
      </main>
    </div>
  )
}

export default ImageEditor
