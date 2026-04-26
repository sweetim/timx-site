import type { Metadata } from "next"
import LlmUsage from "./_components/llm-usage"

export const metadata: Metadata = {
  title: "LLM Pricing",
  description: "Compare pricing across LLM providers via OpenRouter",
}

export const revalidate = 3600

type Model = {
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

async function getModels(): Promise<Model[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models")
  if (!response.ok) throw new Error("Failed to fetch models")
  const data = await response.json()
  return data.data
}

export default async function LlmUsagePage() {
  const models = await getModels()
  return <LlmUsage models={models} />
}
