import yaml from "js-yaml"
import type {
  EndpointGroup,
  HttpMethod,
  OpenApiOperation,
  OpenApiSpec,
} from "../_components/types"
import { HTTP_METHODS } from "./constants"

function parseSpec(raw: string): OpenApiSpec {
  const trimmed = raw.trim()
  let parsed: unknown
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    parsed = JSON.parse(raw)
  } else {
    parsed = yaml.load(raw)
  }
  if (
    !parsed
    || typeof parsed !== "object"
    || !("openapi" in parsed)
    || !("info" in parsed)
    || !("paths" in parsed)
  ) {
    throw new Error(
      "Not a valid OpenAPI 3.x spec: missing openapi, info, or paths",
    )
  }
  return parsed as OpenApiSpec
}

function extractEndpoints(spec: OpenApiSpec): EndpointGroup[] {
  const tagMap = new Map<string, OpenApiOperation[]>()

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = (methods as Record<string, unknown>)[method]
      if (!operation || typeof operation !== "object") continue

      const op = operation as Record<string, unknown>
      const endpoint: OpenApiOperation = {
        method: method as HttpMethod,
        path,
        operationId: op.operationId as string | undefined,
        summary: op.summary as string | undefined,
        description: op.description as string | undefined,
        tags: (op.tags as string[] | undefined) ?? [],
        deprecated: op.deprecated as boolean | undefined,
        parameters: op.parameters as OpenApiOperation["parameters"],
        requestBody: op.requestBody as OpenApiOperation["requestBody"],
        responses: op.responses as OpenApiOperation["responses"],
        security: op.security as OpenApiOperation["security"],
      }

      const tags =
        (endpoint.tags ?? []).length > 0 ? (endpoint.tags ?? []) : ["default"]
      for (const tag of tags) {
        const list = tagMap.get(tag) ?? []
        list.push(endpoint)
        tagMap.set(tag, list)
      }
    }
  }

  return Array.from(tagMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, endpoints]) => ({ tag, endpoints }))
}

export { extractEndpoints, parseSpec }
