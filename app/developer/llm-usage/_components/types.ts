export type Model = {
  id: string
  name: string
  created: number
  context_length: number
  pricing: {
    prompt: string
    completion: string
    input_cache_read: string
  }
  architecture: {
    input_modalities: string[]
    output_modalities: string[]
  }
  top_provider: {
    max_completion_tokens: number | null
  }
}

export type ProviderGroup = {
  provider: string
  models: Model[]
}

export type SortKey =
  | "name"
  | "prompt"
  | "completion"
  | "context_length"
  | "created"
export type SortDirection = "asc" | "desc"
export type ReleaseFilter = "all" | "7d" | "30d" | "90d" | "1y"
