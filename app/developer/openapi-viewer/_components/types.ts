type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options"
  | "trace"

type OpenApiParameter = {
  name: string
  location: "path" | "query" | "header" | "cookie"
  required: boolean
  description: string
  schema?: unknown
  example?: unknown
}

type OpenApiRequestBody = {
  description?: string
  required?: boolean
  content: Record<
    string,
    { schema?: unknown; example?: unknown; examples?: Record<string, unknown> }
  >
}

type OpenApiResponse = {
  description?: string
  content?: Record<
    string,
    { schema?: unknown; example?: unknown; examples?: Record<string, unknown> }
  >
}

type OpenApiOperation = {
  method: HttpMethod
  path: string
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  deprecated?: boolean
  parameters?: OpenApiParameter[]
  requestBody?: OpenApiRequestBody
  responses?: Record<string, OpenApiResponse>
}

type OpenApiSpec = {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: { url: string; description?: string }[]
  paths: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, unknown>
    securitySchemes?: Record<string, unknown>
  }
}

type EndpointGroup = {
  tag: string
  endpoints: OpenApiOperation[]
}

type ViewerState =
  | { phase: "empty" }
  | { phase: "error"; message: string }
  | { phase: "ready"; spec: OpenApiSpec; endpoints: EndpointGroup[] }

type RecentFile = {
  fileName: string
  title: string
  version: string
  content: string
  openedAt: number
}

type Suggestion = {
  severity: "error" | "warning" | "info"
  message: string
  path?: string
}

export type {
  EndpointGroup,
  HttpMethod,
  OpenApiOperation,
  OpenApiParameter,
  OpenApiRequestBody,
  OpenApiResponse,
  OpenApiSpec,
  RecentFile,
  Suggestion,
  ViewerState,
}
