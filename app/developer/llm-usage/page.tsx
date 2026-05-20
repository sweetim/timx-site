import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
import LlmUsage from "./_components/llm-usage"
import { LlmUsageInfo } from "./_components/llm-usage-info"

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
    images: ["/llm-pricing-og.jpg"],
  },
}

export default function LlmUsagePage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "LLM Pricing", url: "https://timx.co/developer/llm-usage" },
        ]}
      />
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
      <LlmUsage>
        <LlmUsageInfo />
      </LlmUsage>
      <ToolSeoContent
        id="llm-pricing-seo"
        heading="LLM Pricing Comparison Tool"
        description="Compare LLM pricing across providers and models using OpenRouter data. Review prompt, completion, and cache token prices, then estimate model costs before choosing an API model for an AI application or coding workflow."
        features={[
          "Compare input, output, and cache token prices per 1M tokens.",
          "Filter free models and recently released LLMs.",
          "Estimate request costs with a token cost calculator.",
        ]}
      />
    </>
  )
}
