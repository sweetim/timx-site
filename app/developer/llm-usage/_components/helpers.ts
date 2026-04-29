import { formatDistanceToNow } from "date-fns"
import { match, P } from "ts-pattern"
import type { Model } from "./types"

export function formatCost(costStr: string): string {
  return match(costStr)
    .with("", () => "—")
    .otherwise(() => {
      const cost = Number.parseFloat(costStr)
      if (Number.isNaN(cost)) return "—"
      const perMillion = cost * 1_000_000
      return match({ cost, perMillion })
        .with({ cost: 0 }, () => "Free" as string)
        .with(
          { perMillion: P.when((p) => p < 0.01) },
          ({ perMillion }) => `$${perMillion.toFixed(4)}`,
        )
        .with(
          { perMillion: P.when((p) => p < 1) },
          ({ perMillion }) => `$${perMillion.toFixed(3)}`,
        )
        .otherwise(({ perMillion }) => `$${perMillion.toFixed(2)}`)
    })
}

export function formatTokens(n: number | null): string {
  return match(n)
    .with(null, () => "—")
    .with(
      P.when((v): v is number => v >= 1_000_000),
      (v) => `${(v / 1_000_000).toFixed(1)}M`,
    )
    .otherwise((v) =>
      match(v)
        .with(
          P.when((v) => v >= 1_000),
          (v) => `${(v / 1_000).toFixed(0)}K`,
        )
        .otherwise((v) => String(v)),
    )
}

export function formatModalities(inputs: string[], outputs: string[]): string {
  const set = new Set([...inputs, ...outputs])
  return [...set].sort().join(", ")
}

export function serializeModel(m: Record<string, unknown>): Model {
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

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp * 1000), {
    addSuffix: true,
  })
}
