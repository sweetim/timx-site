"use client"

import { Calculator, ChevronsUpDown } from "lucide-react"
import { useMemo, useState } from "react"

import { CostCalculatorDialog } from "./cost-calculator-dialog"
import { RELEASE_OPTIONS } from "./constants"
import { ProviderSection } from "./provider-section"
import type { Model, ProviderGroup, ReleaseFilter, SortDirection, SortKey } from "./types"

export default function LlmUsage({ models }: { models: Model[] }) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("created")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [releaseFilter, setReleaseFilter] = useState<ReleaseFilter>("all")
  const [freeOnly, setFreeOnly] = useState(false)
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(
    new Set(),
  )
  const [calculatorOpen, setCalculatorOpen] = useState(false)

  const toggleProvider = (provider: string) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev)
      if (next.has(provider)) next.delete(provider)
      else next.add(provider)
      return next
    })
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const [now] = useState(() => Date.now() / 1000)
  const groups = useMemo(() => {
    const query = search.toLowerCase()
    const releaseDays = RELEASE_OPTIONS.find(
      (o) => o.value === releaseFilter,
    )?.days
    const filtered = models.filter((m) => {
      if (
        query
        && !m.name.toLowerCase().includes(query)
        && !m.id.toLowerCase().includes(query)
      )
        return false
      if (freeOnly && Number.parseFloat(m.pricing.prompt) !== 0) return false
      if (releaseDays != null && now - m.created > releaseDays * 86400)
        return false
      return true
    })
    const map = new Map<string, Model[]>()
    for (const model of filtered) {
      const provider = model.id.split("/")[0] ?? "other"
      const list = map.get(provider) ?? []
      list.push(model)
      map.set(provider, list)
    }
    const pinnedProviders = [
      "anthropic",
      "openai",
      "google",
      "z-ai",
      "deepseek",
      "qwen",
      "moonshotai",
      "minimax",
      "mistralai",
    ]
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
  }, [models, search, releaseFilter, freeOnly, now])

  const allExpanded =
    groups.length > 0 && groups.every((g) => expandedProviders.has(g.provider))

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedProviders(new Set())
    } else {
      setExpandedProviders(new Set(groups.map((g) => g.provider)))
    }
  }

  return (
    <div className="h-full overflow-auto bg-dev-canvas">
      <div className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-dev-text">LLM Pricing</h1>
          <button
            type="button"
            onClick={() => setCalculatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-dev-link text-white hover:bg-dev-link/90 transition-colors"
          >
            <Calculator size={12} />
            Cost Calculator
          </button>
        </div>
        <p className="text-dev-text-secondary mb-6">
          Compare pricing across {models.length} models from OpenRouter. Costs
          shown per 1M tokens.
        </p>
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-md border border-dev-border bg-dev-inset text-dev-text placeholder:text-dev-text-secondary focus:outline-none focus:border-dev-link"
        />
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-dev-text-secondary mr-1">
              Released:
            </span>
            {RELEASE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setReleaseFilter(opt.value)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  releaseFilter === opt.value
                    ? "border-dev-link text-dev-link bg-dev-link/10"
                    : "border-dev-border text-dev-text-secondary hover:text-dev-text"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-dev-border" />
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="accent-dev-link"
            />
            <span className="text-xs text-dev-text-secondary">Free only</span>
          </label>
          <div className="h-4 w-px bg-dev-border" />
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-dev-border text-dev-text-secondary hover:text-dev-text transition-colors"
          >
            <ChevronsUpDown size={12} />
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <ProviderSection
              key={group.provider}
              group={group}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={toggleSort}
              isExpanded={expandedProviders.has(group.provider)}
              onToggle={() => toggleProvider(group.provider)}
            />
          ))}
        </div>
        {groups.length === 0 && (
          <p className="text-center text-dev-text-secondary py-12">
            No models match your search.
          </p>
        )}
      </div>
      <CostCalculatorDialog
        models={models}
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  )
}
