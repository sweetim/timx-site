"use client"

import clsx from "clsx"
import { AlertTriangle, Upload, X } from "lucide-react"
import { type FC, type ReactNode, useCallback, useRef, useState } from "react"
import { match } from "ts-pattern"
import { extractEndpoints, parseSpec } from "../_lib/parse-spec"
import type { RecentFileWithLabel } from "../_lib/recent-files"
import {
  addRecentFile,
  refreshRecentFiles,
  removeRecentFile,
} from "../_lib/recent-files"
import { generateSuggestions } from "../_lib/suggestions"
import { EndpointDetail } from "./endpoint-detail"
import { EndpointSidebar } from "./endpoint-sidebar"
import type {
  EndpointGroup,
  OpenApiOperation,
  OpenApiSpec,
  RecentFile,
  ViewerState,
} from "./types"
import { UploadZone } from "./upload-zone"

const OpenApiViewer: FC<{ landingContent: ReactNode }> = ({
  landingContent,
}) => {
  const [state, setState] = useState<ViewerState>({ phase: "empty" })
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<OpenApiOperation | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [recentFiles, setRecentFiles] = useState<RecentFileWithLabel[]>(() =>
    refreshRecentFiles(),
  )
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = reader.result as string
        const spec = parseSpec(raw)
        const endpoints = extractEndpoints(spec)
        setState({ phase: "ready", spec, endpoints })
        setSelectedEndpoint(null)
        setShowSuggestions(false)
        setExpandedGroups(new Set(endpoints.map((g) => g.tag)))
        addRecentFile({
          fileName: file.name,
          title: spec.info.title,
          version: spec.info.version,
          content: raw,
          openedAt: Date.now(),
        })
        setRecentFiles(refreshRecentFiles())
      } catch (error) {
        setState({
          phase: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to parse OpenAPI spec",
        })
      }
    }
    reader.onerror = () =>
      setState({ phase: "error", message: "Failed to read file" })
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => e.preventDefault(),
    [],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const suggestions =
    state.phase === "ready" ? generateSuggestions(state.spec) : []

  const handleLoadRecent = useCallback((recent: RecentFile) => {
    try {
      const spec = parseSpec(recent.content)
      const endpoints = extractEndpoints(spec)
      setState({ phase: "ready", spec, endpoints })
      setFileName(recent.fileName)
      setSelectedEndpoint(null)
      setShowSuggestions(false)
      setExpandedGroups(new Set(endpoints.map((g) => g.tag)))
      addRecentFile({ ...recent, openedAt: Date.now() })
      setRecentFiles(refreshRecentFiles())
    } catch {
      setState({
        phase: "error",
        message: `Failed to re-parse "${recent.fileName}". The cached content may be corrupted.`,
      })
    }
  }, [])

  const handleRemoveRecent = useCallback((e: React.MouseEvent, fn: string) => {
    e.stopPropagation()
    removeRecentFile(fn)
    setRecentFiles(refreshRecentFiles())
  }, [])

  const handleToggleGroup = useCallback((tag: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }, [])

  const resetState = useCallback(() => {
    setState({ phase: "empty" })
    setSelectedEndpoint(null)
    setFileName(null)
    setShowSuggestions(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  return (
    <div className="flex flex-col h-full bg-dev-canvas text-dev-text">
      {match(state)
        .with({ phase: "empty" }, () => (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              {landingContent}
              <UploadZone
                recentFiles={recentFiles}
                fileInputRef={fileInputRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onInputChange={handleInputChange}
                onLoadRecent={handleLoadRecent}
                onRemoveRecent={handleRemoveRecent}
              />
            </div>
          </div>
        ))
        .with({ phase: "error" }, ({ message }) => (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="text-dev-accent-red bg-dev-accent-red/10 rounded-lg p-6 mb-4">
                <X className="size-8 mx-auto mb-3" />
                <p className="text-sm">{message}</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
                onClick={resetState}
              >
                Try Again
              </button>
            </div>
          </div>
        ))
        .with({ phase: "ready" }, ({ spec, endpoints }) => {
          const readyEndpoints = endpoints as EndpointGroup[]
          const readySpec = spec as OpenApiSpec
          return (
            <>
              <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-dev-border">
                <h1 className="text-sm font-medium text-dev-text-secondary truncate min-w-0 shrink">
                  Upload an OpenAPI 3.x JSON or YAML file to visualize
                  endpoints, parameters, request/response schemas, and get
                  improvement suggestions.
                </h1>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded transition-colors cursor-pointer",
                      showSuggestions
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button hover:bg-dev-button-hover text-dev-text",
                    )}
                    onClick={() => setShowSuggestions((v) => !v)}
                  >
                    <AlertTriangle size={14} />
                    <span>Suggestions</span>
                    {suggestions.length > 0 && (
                      <span className="text-xs bg-dev-inset px-1.5 rounded-full">
                        {suggestions.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
                    onClick={resetState}
                  >
                    <Upload size={14} />
                    <span>New File</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <EndpointSidebar
                  specTitle={readySpec.info.title}
                  specVersion={readySpec.info.version}
                  specServers={readySpec.servers}
                  fileName={fileName}
                  endpoints={readyEndpoints}
                  selectedEndpoint={selectedEndpoint}
                  expandedGroups={expandedGroups}
                  onToggleGroup={handleToggleGroup}
                  onSelectEndpoint={setSelectedEndpoint}
                />
                <div className="flex-1 overflow-auto">
                  <EndpointDetail
                    endpoint={selectedEndpoint}
                    spec={readySpec}
                    suggestions={suggestions}
                    showSuggestions={showSuggestions}
                  />
                </div>
              </div>
            </>
          )
        })
        .exhaustive()}
    </div>
  )
}

export default OpenApiViewer
