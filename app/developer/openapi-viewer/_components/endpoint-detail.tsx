import clsx from "clsx"
import { CheckCircle } from "lucide-react"
import { METHOD_BG, METHOD_COLORS } from "../_lib/constants"
import { BodySection } from "./body-section"
import { ParamTable } from "./param-table"
import { ResponsesSection } from "./responses-section"
import { SecuritySection } from "./security-section"
import { SuggestionItem } from "./suggestion-item"
import type { OpenApiOperation, OpenApiSpec, Suggestion } from "./types"

function EndpointDetail({
  endpoint,
  spec,
  suggestions,
  showSuggestions,
}: {
  endpoint: OpenApiOperation | null
  spec: OpenApiSpec
  suggestions: Suggestion[]
  showSuggestions: boolean
}) {
  if (showSuggestions) {
    return (
      <div className="p-6">
        <h3 className="text-base font-medium text-dev-text mb-4 flex items-center gap-2">
          <CheckCircle
            size={16}
            className="text-dev-accent-orange"
          />
          Suggestions ({suggestions.length})
        </h3>
        {suggestions.length === 0 ? (
          <div className="flex items-center gap-2 p-4 bg-dev-accent-green/10 rounded-lg">
            <CheckCircle className="size-5 text-dev-accent-green" />
            <span className="text-dev-text">
              Your OpenAPI spec looks good! No suggestions found.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <SuggestionItem
                key={`${suggestion.severity}-${suggestion.path ?? ""}-${suggestion.message}`}
                suggestion={suggestion}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!endpoint) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-dev-text-secondary">
          Select an endpoint from the sidebar
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <span
          className={clsx(
            "text-sm font-mono font-bold uppercase px-2 py-1 rounded",
            METHOD_BG[endpoint.method],
            METHOD_COLORS[endpoint.method],
          )}
        >
          {endpoint.method}
        </span>
        <span className="font-mono text-dev-text text-lg">{endpoint.path}</span>
        {endpoint.deprecated && (
          <span className="text-xs bg-dev-accent-orange/15 text-dev-accent-orange px-2 py-0.5 rounded">
            Deprecated
          </span>
        )}
      </div>
      {endpoint.summary && (
        <p className="text-base text-dev-text mb-2">{endpoint.summary}</p>
      )}
      {endpoint.description && (
        <p className="text-sm text-dev-text-secondary mb-4">
          {endpoint.description}
        </p>
      )}
      {endpoint.operationId && (
        <div className="text-xs text-dev-text-secondary mb-4">
          Operation ID:{" "}
          <span className="font-mono text-dev-accent-purple">
            {endpoint.operationId}
          </span>
        </div>
      )}

      <SecuritySection
        security={endpoint.security}
        securitySchemes={spec.components?.securitySchemes}
        specSecurity={spec.security}
      />

      <ParamTable
        params={endpoint.parameters?.filter((p) => p.location === "path")}
        title="Path Parameters"
      />
      <ParamTable
        params={endpoint.parameters?.filter((p) => p.location === "query")}
        title="Query Parameters"
      />
      <ParamTable
        params={endpoint.parameters?.filter((p) => p.location === "header")}
        title="Header Parameters"
      />

      <BodySection
        body={endpoint.requestBody}
        title="Request Body"
        spec={spec}
      />
      <ResponsesSection
        responses={endpoint.responses}
        spec={spec}
      />
    </div>
  )
}

export { EndpointDetail }
