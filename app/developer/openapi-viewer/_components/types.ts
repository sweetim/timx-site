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

type OpenApiSecurityRequirement = Record<string, string[]>

type OpenApiSecurityScheme = {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect"
  description?: string
  name?: string
  in?: "query" | "header" | "cookie"
  scheme?: string
  bearerFormat?: string
  flows?: Record<string, unknown>
  openIdConnectUrl?: string
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
  security?: OpenApiSecurityRequirement[]
}

type OpenApiSpec = {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: { url: string; description?: string }[]
  security?: OpenApiSecurityRequirement[]
  paths: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, unknown>
    securitySchemes?: Record<string, OpenApiSecurityScheme>
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
  OpenApiSecurityRequirement,
  OpenApiSecurityScheme,
  OpenApiSpec,
  Suggestion,
  ViewerState,
}
