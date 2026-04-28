"use client"

import { ArrowUpDown, ChevronDown } from "lucide-react"
import { useMemo } from "react"
import { match } from "ts-pattern"

import type { ProviderGroup, SortDirection, SortKey } from "./types"
import {
  formatCost,
  formatModalities,
  formatRelativeTime,
  formatTokens,
} from "./helpers"

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
        <ArrowUpDown
          size={10}
          className={
            activeSortKey === sortKeyName ? "text-dev-link" : "opacity-40"
          }
        />
      </span>
    </th>
  )
}

export function ProviderSection({
  group,
  sortKey,
  sortDirection,
  onSort,
  isExpanded,
  onToggle,
}: {
  group: ProviderGroup
  sortKey: SortKey
  sortDirection: SortDirection
  onSort: (key: SortKey) => void
  isExpanded: boolean
  onToggle: () => void
}) {
  const sorted = useMemo(() => {
    return [...group.models].sort((a, b) => {
      const cmp = match(sortKey)
        .with("name", () => a.name.localeCompare(b.name))
        .with(
          "prompt",
          () =>
            Number.parseFloat(a.pricing.prompt)
            - Number.parseFloat(b.pricing.prompt),
        )
        .with(
          "completion",
          () =>
            Number.parseFloat(a.pricing.completion)
            - Number.parseFloat(b.pricing.completion),
        )
        .with("context_length", () => a.context_length - b.context_length)
        .with("created", () => a.created - b.created)
        .exhaustive()
      if (cmp !== 0) return sortDirection === "asc" ? cmp : -cmp
      return b.created - a.created
    })
  }, [group.models, sortKey, sortDirection])

  const cheapestPrompt = formatCost(
    group.models.reduce((min, m) => {
      const v = Number.parseFloat(m.pricing.prompt)
      return v < Number.parseFloat(min) ? m.pricing.prompt : min
    }, group.models[0]?.pricing.prompt ?? "0"),
  )

  return (
    <div className="rounded-md border border-dev-border overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-dev-surface hover:bg-dev-button transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={16}
            className={`text-dev-text-secondary transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
          />
          <span className="text-sm font-semibold text-dev-text">
            {group.provider}
          </span>
          <span className="text-xs text-dev-text-secondary">
            {group.models.length} models
          </span>
        </div>
        <span className="text-xs text-dev-text-secondary">
          from {cheapestPrompt} / 1M prompt tokens
        </span>
      </button>
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dev-inset">
              <tr>
                <SortHeader
                  label="Model"
                  sortKeyName="name"
                  activeSortKey={sortKey}
                  onSort={onSort}
                />
                <SortHeader
                  label="Prompt / 1M"
                  sortKeyName="prompt"
                  activeSortKey={sortKey}
                  onSort={onSort}
                />
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                  Cache Read / 1M
                </th>
                <SortHeader
                  label="Completion / 1M"
                  sortKeyName="completion"
                  activeSortKey={sortKey}
                  onSort={onSort}
                />
                <SortHeader
                  label="Context"
                  sortKeyName="context_length"
                  activeSortKey={sortKey}
                  onSort={onSort}
                />
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                  Max Output
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                  Released
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                  Modalities
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((model) => (
                <tr
                  key={model.id}
                  className="border-t border-dev-border hover:bg-dev-surface transition-colors"
                >
                  <td className="px-3 py-2 text-dev-text font-medium whitespace-nowrap">
                    {model.name}
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    {formatCost(model.pricing.prompt)}
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    {formatCost(model.pricing.input_cache_read)}
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    {formatCost(model.pricing.completion)}
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    {formatTokens(model.context_length)}
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    {formatTokens(model.top_provider.max_completion_tokens)}
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    <span>
                      {new Date(model.created * 1000).toLocaleDateString()}
                    </span>
                    <span className="ml-1.5 text-dev-text-secondary text-xs">
                      ({formatRelativeTime(model.created)})
                    </span>
                  </td>
                  <td className="px-3 py-2 text-dev-text-secondary whitespace-nowrap">
                    {formatModalities(
                      model.architecture.input_modalities,
                      model.architecture.output_modalities,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
