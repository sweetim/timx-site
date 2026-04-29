import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import LlmUsage from "./_components/llm-usage"

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

export default function LlmUsagePage() {
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
      <LlmUsage />
    </>
  )
}
