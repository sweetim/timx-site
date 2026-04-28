"use client"

import { Calculator, ChevronsUpDown, Download, X } from "lucide-react"
import { useMemo, useState } from "react"
import { RELEASE_OPTIONS } from "./constants"
import { CostCalculatorDialog } from "./cost-calculator-dialog"
import { ProviderSection } from "./provider-section"
import type {
  Model,
  ProviderGroup,
  ReleaseFilter,
  SortDirection,
  SortKey,
} from "./types"

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
  const [bannerVisible, setBannerVisible] = useState(true)

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
        <p className="text-dev-text-secondary mb-4">
          Compare pricing across {models.length} models from OpenRouter. Costs
          shown per 1M tokens.
        </p>
        {bannerVisible && (
          <div className="relative mb-6 hidden rounded-lg border border-dev-border bg-dev-inset p-4 sm:block">
            <button
              type="button"
              onClick={() => setBannerVisible(false)}
              className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-dev-text-secondary hover:text-dev-text transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
            <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-sm text-dev-text-secondary">
                Track your actual LLM usage and estimated costs automatically in{" "}
                <span className="inline-flex items-center gap-1 align-[-2px] text-dev-text">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-3.5 text-dev-link"
                  >
                    <path d="M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479l1.323 1.201a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352ZM18.004 17.448 10.826 12l7.178-5.448v10.896Z" />
                  </svg>
                </span>{" "}
                with{" "}
                <a
                  href="https://github.com/sweetim/token-lens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-dev-text hover:text-dev-link transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  Token Lens
                </a>
              </p>
              <a
                href="https://marketplace.visualstudio.com/items?itemName=timx.token-lens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md bg-dev-link px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-dev-link/90 sm:self-center"
              >
                <Download size={12} />
                VS Code Marketplace
              </a>
            </div>
          </div>
        )}
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
