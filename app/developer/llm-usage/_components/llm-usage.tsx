"use client"

import { ChevronDown, ArrowUpDown } from "lucide-react"
import { useMemo, useState } from "react"

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

type ProviderGroup = {
  provider: string
  models: Model[]
}

type SortKey = "name" | "prompt" | "completion" | "context_length" | "created"
type SortDirection = "asc" | "desc"

function formatCost(costStr: string): string {
  if (!costStr) return "—"
  const cost = Number.parseFloat(costStr)
  if (cost === 0) return "Free"
  const perMillion = cost * 1_000_000
  if (perMillion < 0.01) return `$${perMillion.toFixed(4)}`
  if (perMillion < 1) return `$${perMillion.toFixed(3)}`
  return `$${perMillion.toFixed(2)}`
}

function formatTokens(n: number | null): string {
  if (n == null) return "—"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function formatModalities(inputs: string[], outputs: string[]): string {
  const set = new Set([...inputs, ...outputs])
  return [...set].sort().join(", ")
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp * 1000
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return years === 1 ? "1 year ago" : `${years} years ago`
  if (months > 0) return months === 1 ? "1 month ago" : `${months} months ago`
  if (days > 0) return days === 1 ? "1 day ago" : `${days} days ago`
  if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  if (minutes > 0) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`
  return "just now"
}

function SortHeader({
  label,
  sortKeyName,
  activeSortKey,
  onSort,
}: {
  label: string
  sortKeyName: SortKey
  activeSortKey: SortKey
  onSort: (key: SortKey) => void
}) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary cursor-pointer select-none hover:text-dev-text whitespace-nowrap"
      onClick={() => onSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={10} className={activeSortKey === sortKeyName ? "text-dev-link" : "opacity-40"} />
      </span>
    </th>
  )
}

function ProviderSection({
  group,
  sortKey,
  sortDirection,
  onSort,
}: {
  group: ProviderGroup
  sortKey: SortKey
  sortDirection: SortDirection
  onSort: (key: SortKey) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const sorted = useMemo(() => {
    return [...group.models].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "prompt":
          cmp = Number.parseFloat(a.pricing.prompt) - Number.parseFloat(b.pricing.prompt)
          break
        case "completion":
          cmp = Number.parseFloat(a.pricing.completion) - Number.parseFloat(b.pricing.completion)
          break
        case "context_length":
          cmp = a.context_length - b.context_length
          break
        case "created":
          cmp = a.created - b.created
          break
      }
      if (cmp !== 0) return sortDirection === "asc" ? cmp : -cmp
      return b.created - a.created
    })
  }, [group.models, sortKey, sortDirection])

  const cheapestPrompt = formatCost(
    group.models.reduce(
      (min, m) => {
        const v = Number.parseFloat(m.pricing.prompt)
        return v < Number.parseFloat(min) ? m.pricing.prompt : min
      },
      group.models[0]?.pricing.prompt ?? "0",
    ),
  )

  return (
    <div className="rounded-md border border-dev-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-dev-surface hover:bg-dev-button transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={16}
            className={`text-dev-text-secondary transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`}
          />
          <span className="text-sm font-semibold text-dev-text">{group.provider}</span>
          <span className="text-xs text-dev-text-secondary">{group.models.length} models</span>
        </div>
        <span className="text-xs text-dev-text-secondary">from {cheapestPrompt} / 1M prompt tokens</span>
      </button>
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dev-inset">
              <tr>
                <SortHeader label="Model" sortKeyName="name" activeSortKey={sortKey} onSort={onSort} />
                <SortHeader label="Prompt / 1M" sortKeyName="prompt" activeSortKey={sortKey} onSort={onSort} />
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">Cache Read / 1M</th>
                <SortHeader label="Completion / 1M" sortKeyName="completion" activeSortKey={sortKey} onSort={onSort} />
                <SortHeader label="Context" sortKeyName="context_length" activeSortKey={sortKey} onSort={onSort} />
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">Max Output</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">Released</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">Modalities</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((model) => (
                <tr key={model.id} className="border-t border-dev-border hover:bg-dev-surface transition-colors">
                  <td className="px-3 py-2 text-dev-text font-medium whitespace-nowrap">{model.name}</td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">{formatCost(model.pricing.prompt)}</td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">{formatCost(model.pricing.input_cache_read)}</td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">{formatCost(model.pricing.completion)}</td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">{formatTokens(model.context_length)}</td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">{formatTokens(model.top_provider.max_completion_tokens)}</td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    <span>{new Date(model.created * 1000).toLocaleDateString()}</span>
                    <span className="ml-1.5 text-dev-text-secondary text-xs">({formatRelativeTime(model.created)})</span>
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">{formatModalities(model.architecture.input_modalities, model.architecture.output_modalities)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function LlmUsage({ models }: { models: Model[] }) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("created")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const groups = useMemo(() => {
    const query = search.toLowerCase()
    const filtered = models.filter(
      (m) => m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query),
    )
    const map = new Map<string, Model[]>()
    for (const model of filtered) {
      const provider = model.id.split("/")[0] ?? "other"
      const list = map.get(provider) ?? []
      list.push(model)
      map.set(provider, list)
    }
    const pinnedProviders = ["anthropic", "openai", "google", "z-ai", "deepseek", "qwen", "moonshotai", "minimax", "mistralai"]
    return [...map.entries()]
      .sort(([a], [b]) => {
        const ai = pinnedProviders.indexOf(a)
        const bi = pinnedProviders.indexOf(b)
        if (ai !== -1 && bi !== -1) return ai - bi
        if (ai !== -1) return -1
        if (bi !== -1) return 1
        return a.localeCompare(b)
      })
      .map(([provider, models]): ProviderGroup => ({ provider, models }))
  }, [models, search])

  return (
    <div className="h-full overflow-auto bg-dev-canvas">
      <div className="max-w-6xl mx-auto px-6 py-12 w-full">
        <h1 className="text-2xl font-semibold text-dev-text mb-2">LLM Pricing</h1>
        <p className="text-dev-text-secondary mb-6">
          Compare pricing across {models.length} models from OpenRouter. Costs shown per 1M tokens.
        </p>
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded-md border border-dev-border bg-dev-inset text-dev-text placeholder:text-dev-text-secondary focus:outline-none focus:border-dev-link"
        />
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <ProviderSection
              key={group.provider}
              group={group}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={toggleSort}
            />
          ))}
        </div>
        {groups.length === 0 && (
          <p className="text-center text-dev-text-secondary py-12">No models match your search.</p>
        )}
      </div>
    </div>
  )
}
