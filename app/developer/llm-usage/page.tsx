import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import LlmUsage from "./_components/llm-usage"
import type { Model } from "./_components/types"

export const metadata: Metadata = {
  title: "LLM Pricing Comparison",
  description:
    "Compare pricing across LLM providers including OpenAI, Anthropic, Google, and more. Data sourced from OpenRouter and updated hourly.",
  alternates: { canonical: "https://timx.co/developer/llm-usage" },
  openGraph: {
    title: "LLM Pricing Comparison",
    description:
      "Compare pricing across LLM providers including OpenAI, Anthropic, Google, and more.",
    url: "https://timx.co/developer/llm-usage",
    images: [opengraph.src],
  },
}

export const revalidate = 3600

function serializeModel(m: Record<string, unknown>): Model {
  return {
    id: m.id as string,
    name: m.name as string,
    created: m.created as number,
    context_length: m.context_length as number,
    pricing: {
      prompt: (m.pricing as Record<string, unknown>)?.prompt as string,
      completion: (m.pricing as Record<string, unknown>)?.completion as string,
      input_cache_read: (m.pricing as Record<string, unknown>)
        ?.input_cache_read as string,
    },
    architecture: {
      input_modalities: (m.architecture as Record<string, unknown>)
        ?.input_modalities as string[],
      output_modalities: (m.architecture as Record<string, unknown>)
        ?.output_modalities as string[],
    },
    top_provider: {
      max_completion_tokens:
        ((m.top_provider as Record<string, unknown>)?.max_completion_tokens as
          | number
          | null) ?? null,
    },
  }
}

async function getModels(): Promise<Model[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models")
  if (!response.ok) throw new Error("Failed to fetch models")
  const data = await response.json()
  return (data.data as Record<string, unknown>[]).map(serializeModel)
}

export default async function LlmUsagePage() {
  const models = await getModels()
  return (
    <>
      <WebApplicationJsonLd
        name="LLM Pricing Comparison"
        description="Compare pricing across LLM providers including OpenAI, Anthropic, Google, and more"
        url="https://timx.co/developer/llm-usage"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Compare LLM provider pricing",
          "Filter free and recently released models",
          "Sort models by pricing and release date",
          "Estimate token costs with a calculator",
        ]}
      />
      <LlmUsage models={models} />
    </>
  )
}
