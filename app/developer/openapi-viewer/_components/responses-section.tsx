import clsx from "clsx"
import { ExampleSchemaTabs } from "../_lib/schema-resolver"
import type { OpenApiOperation } from "./types"

function ResponsesSection({
  responses,
  spec,
}: {
  responses: OpenApiOperation["responses"]
  spec: Parameters<typeof ExampleSchemaTabs>[number]["spec"]
}) {
  if (!responses) return null
  const codes = Object.keys(responses).sort()
  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium text-dev-text-secondary uppercase tracking-wider mb-2">
        Responses
      </h4>
      <div className="space-y-3">
        {codes.map((code) => {
          const response = responses[code]
          const contentTypes = Object.keys(response.content ?? {})
          const isSuccess = code.startsWith("2")
          return (
            <div
              key={code}
              className={clsx(
                "border border-dev-border rounded p-3",
                isSuccess && "border-dev-accent-green/30",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={clsx(
                    "font-mono text-sm font-medium",
                    isSuccess
                      ? "text-dev-accent-green"
                      : "text-dev-accent-orange",
                  )}
                >
                  {code}
                </span>
                {response.description && (
                  <span className="text-sm text-dev-text">
                    {response.description}
                  </span>
                )}
              </div>
              {contentTypes.map((contentType) => {
                const mediaType = response.content?.[contentType]
                if (!mediaType) return null
                return (
                  <div key={contentType}>
                    <div className="text-xs font-mono text-dev-accent-purple mb-1">
                      {contentType}
                    </div>
                    <ExampleSchemaTabs
                      example={mediaType.example}
                      schema={mediaType.schema}
                      spec={spec}
                    />
                  </div>
                )
              })}
              {contentTypes.length === 0 && !response.description && (
                <span className="text-xs text-dev-text-secondary">
                  No content defined
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ResponsesSection }
