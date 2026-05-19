import { ExampleSchemaTabs } from "../_lib/schema-resolver"
import type { OpenApiOperation } from "./types"

function BodySection({
  body,
  title,
  spec,
}: {
  body: OpenApiOperation["requestBody"]
  title: string
  spec: Parameters<typeof ExampleSchemaTabs>[number]["spec"]
}) {
  if (!body) {
    return (
      <div className="mt-4">
        <h4 className="text-xs font-medium text-dev-text-secondary uppercase tracking-wider mb-2">
          {title}
        </h4>
        <p className="text-xs text-dev-text-secondary">No request body</p>
      </div>
    )
  }
  const contentTypes = Object.keys(body.content ?? {})
  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium text-dev-text-secondary uppercase tracking-wider mb-2">
        {title}
      </h4>
      {body.description && (
        <p className="text-sm text-dev-text mb-2">{body.description}</p>
      )}
      {body.required && (
        <span className="text-xs text-dev-accent-red mb-2 block">Required</span>
      )}
      {contentTypes.map((contentType) => {
        const mediaType = body.content[contentType]
        return (
          <div
            key={contentType}
            className="mb-3"
          >
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
    </div>
  )
}

export { BodySection }
