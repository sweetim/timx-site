import clsx from "clsx"
import { ChevronDown, ChevronRight } from "lucide-react"
import { METHOD_BG, METHOD_COLORS } from "../_lib/constants"
import type { EndpointGroup, OpenApiOperation } from "./types"

function EndpointSidebar({
  specTitle,
  specVersion,
  specServers,
  fileName,
  endpoints,
  selectedEndpoint,
  expandedGroups,
  onToggleGroup,
  onSelectEndpoint,
}: {
  specTitle: string
  specVersion: string
  specServers?: { url: string; description?: string }[]
  fileName: string | null
  endpoints: EndpointGroup[]
  selectedEndpoint: OpenApiOperation | null
  expandedGroups: Set<string>
  onToggleGroup: (tag: string) => void
  onSelectEndpoint: (endpoint: OpenApiOperation) => void
}) {
  return (
    <div className="w-72 shrink-0 border-r border-dev-border flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-dev-border">
        <div className="text-sm font-medium text-dev-text truncate">
          {specTitle}
        </div>
        <div className="text-xs text-dev-text-secondary">
          v{specVersion}
          {fileName && <span className="ml-2">— {fileName}</span>}
        </div>
        {specServers && specServers.length > 0 && (
          <div className="text-xs text-dev-link font-mono mt-1 truncate">
            {specServers[0].url}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {endpoints.map((group) => {
          const isExpanded = expandedGroups.has(group.tag)
          return (
            <div key={group.tag}>
              <button
                type="button"
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dev-text-secondary uppercase tracking-wider bg-dev-inset sticky top-0 cursor-pointer hover:bg-dev-button-hover transition-colors"
                onClick={() => onToggleGroup(group.tag)}
              >
                {isExpanded ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
                {group.tag}
                <span className="ml-auto bg-dev-button text-dev-text-secondary text-[10px] px-1.5 py-0.5 rounded-full font-normal normal-case tracking-normal">
                  {group.endpoints.length}
                </span>
              </button>
              {isExpanded
                && group.endpoints.map((endpoint) => {
                  const isSelected =
                    selectedEndpoint?.method === endpoint.method
                    && selectedEndpoint?.path === endpoint.path
                  return (
                    <button
                      key={`${endpoint.method}-${endpoint.path}`}
                      type="button"
                      className={clsx(
                        "w-full text-left px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer",
                        isSelected ? "bg-dev-surface" : "hover:bg-dev-inset",
                      )}
                      onClick={() => onSelectEndpoint(endpoint)}
                    >
                      <span
                        className={clsx(
                          "text-xs font-mono font-bold uppercase px-1.5 py-0.5 rounded min-w-[44px] text-center",
                          METHOD_BG[endpoint.method],
                          METHOD_COLORS[endpoint.method],
                        )}
                      >
                        {endpoint.method}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono text-dev-text truncate">
                          {endpoint.path}
                        </div>
                        {endpoint.summary && (
                          <div className="text-xs text-dev-text-secondary truncate">
                            {endpoint.summary}
                          </div>
                        )}
                      </div>
                      {endpoint.deprecated && (
                        <span className="text-xs text-dev-accent-orange shrink-0">
                          deprecated
                        </span>
                      )}
                    </button>
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { EndpointSidebar }
