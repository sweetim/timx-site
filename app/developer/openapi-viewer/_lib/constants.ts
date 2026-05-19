import type { HttpMethod } from "../_components/types"

const HTTP_METHODS: HttpMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
]

const METHOD_COLORS: Record<HttpMethod, string> = {
  get: "text-dev-accent-green",
  post: "text-dev-accent-blue",
  put: "text-dev-accent-orange",
  patch: "text-dev-accent-purple",
  delete: "text-dev-accent-red",
  head: "text-dev-text-secondary",
  options: "text-dev-text-secondary",
  trace: "text-dev-text-secondary",
}

const METHOD_BG: Record<HttpMethod, string> = {
  get: "bg-dev-accent-green/15",
  post: "bg-dev-accent-blue/15",
  put: "bg-dev-accent-orange/15",
  patch: "bg-dev-accent-purple/15",
  delete: "bg-dev-accent-red/15",
  head: "bg-dev-inset",
  options: "bg-dev-inset",
  trace: "bg-dev-inset",
}

export { HTTP_METHODS, METHOD_BG, METHOD_COLORS }
