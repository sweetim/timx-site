import type {
  OpenApiOperation,
  OpenApiSpec,
  Suggestion,
} from "../_components/types"

function generateSuggestions(spec: OpenApiSpec): Suggestion[] {
  const suggestions: Suggestion[] = []

  if (!spec.info.description) {
    suggestions.push({
      severity: "warning",
      message: "API info is missing a description",
      path: "info.description",
    })
  }

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(
      methods as Record<string, unknown>,
    )) {
      if (typeof operation !== "object" || !operation) continue
      const op = operation as Record<string, unknown>
      const key = `${method.toUpperCase()} ${path}`

      if (!op.summary) {
        suggestions.push({
          severity: "info",
          message: `Missing summary for ${key}`,
          path: `paths.${path}.${method}.summary`,
        })
      }

      if (!op.description) {
        suggestions.push({
          severity: "info",
          message: `Missing description for ${key}`,
          path: `paths.${path}.${method}.description`,
        })
      }

      if (!op.operationId) {
        suggestions.push({
          severity: "info",
          message: `Missing operationId for ${key}`,
          path: `paths.${path}.${method}.operationId`,
        })
      }

      const params = op.parameters as OpenApiOperation["parameters"] | undefined
      if (params) {
        for (const param of params) {
          if (!param.description) {
            suggestions.push({
              severity: "warning",
              message: `Parameter "${param.name}" in ${key} is missing a description`,
              path: `paths.${path}.${method}.parameters[${param.name}]`,
            })
          }
          if (!param.example && !param.schema) {
            suggestions.push({
              severity: "info",
              message: `Parameter "${param.name}" in ${key} has no example or schema`,
              path: `paths.${path}.${method}.parameters[${param.name}]`,
            })
          }
        }
      }

      const responses = op.responses as Record<string, unknown> | undefined
      if (responses) {
        if (!responses["200"] && !responses["201"] && !responses["2XX"]) {
          suggestions.push({
            severity: "warning",
            message: `${key} has no 2xx success response defined`,
            path: `paths.${path}.${method}.responses`,
          })
        }
        if (!responses["400"] && !responses["4XX"]) {
          suggestions.push({
            severity: "info",
            message: `${key} has no 4xx error response defined`,
            path: `paths.${path}.${method}.responses`,
          })
        }
      } else {
        suggestions.push({
          severity: "error",
          message: `${key} has no responses defined`,
          path: `paths.${path}.${method}.responses`,
        })
      }

      const requestBody = op.requestBody as
        | OpenApiOperation["requestBody"]
        | undefined
      if (requestBody && !requestBody.description) {
        suggestions.push({
          severity: "info",
          message: `Request body in ${key} is missing a description`,
          path: `paths.${path}.${method}.requestBody.description`,
        })
      }
    }
  }

  if (!spec.servers || spec.servers.length === 0) {
    suggestions.push({
      severity: "warning",
      message: "No servers defined",
      path: "servers",
    })
  }

  return suggestions
}

export { generateSuggestions }
