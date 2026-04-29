"use client"

import { X } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import StepperInput from "../../_components/stepper-input"
import { formatCost } from "./helpers"
import type { Model } from "./types"

export function CostCalculatorDialog({
  models,
  open,
  onClose,
}: {
  models: Model[]
  open: boolean
  onClose: () => void
}) {
  const [promptTokens, setPromptTokens] = useState("")
  const [completionTokens, setCompletionTokens] = useState("")
  const [cacheReadTokens, setCacheReadTokens] = useState("")
  const [modelSearch, setModelSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredModels = useMemo(() => {
    const q = modelSearch.toLowerCase()
    return models.filter(
      (m) =>
        (m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
        && Number.parseFloat(m.pricing.prompt) > 0,
    )
  }, [models, modelSearch])

  const toggleModel = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectedModels = useMemo(
    () => models.filter((m) => selectedIds.has(m.id)),
    [models, selectedIds],
  )

  const prompt = Number(promptTokens) || 0
  const completion = Number(completionTokens) || 0
  const cacheRead = Number(cacheReadTokens) || 0

  const sortedResults = useMemo(() => {
    return [...selectedModels].sort((a, b) => {
      const cacheReadPriceA = Number.parseFloat(a.pricing.input_cache_read)
      const cacheReadPriceB = Number.parseFloat(b.pricing.input_cache_read)
      const costA =
        Number.parseFloat(a.pricing.prompt) * prompt
        + Number.parseFloat(a.pricing.completion) * completion
        + (Number.isNaN(cacheReadPriceA) ? 0 : cacheReadPriceA) * cacheRead
      const costB =
        Number.parseFloat(b.pricing.prompt) * prompt
        + Number.parseFloat(b.pricing.completion) * completion
        + (Number.isNaN(cacheReadPriceB) ? 0 : cacheReadPriceB) * cacheRead
      return costA - costB
    })
  }, [selectedModels, prompt, completion, cacheRead])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="no-bounce absolute inset-0 bg-black/60 cursor-default"
        onClick={onClose}
      />
      <div className="relative bg-dev-surface border border-dev-border rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dev-border">
          <h2 className="text-lg font-semibold text-dev-text">
            Cost Calculator
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-dev-text-secondary hover:text-dev-text transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="prompt-tokens"
                className="text-xs font-medium text-dev-text-secondary"
              >
                Prompt tokens
              </label>
              <StepperInput
                id="prompt-tokens"
                value={promptTokens}
                onChange={(e) => setPromptTokens(e.target.value)}
                onIncrement={() =>
                  setPromptTokens(String((Number(promptTokens) || 0) + 1000))
                }
                onDecrement={() =>
                  setPromptTokens(
                    String(Math.max(0, (Number(promptTokens) || 0) - 1000)),
                  )
                }
                min={0}
                step={1000}
                placeholder="e.g. 10000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="completion-tokens"
                className="text-xs font-medium text-dev-text-secondary"
              >
                Completion tokens
              </label>
              <StepperInput
                id="completion-tokens"
                value={completionTokens}
                onChange={(e) => setCompletionTokens(e.target.value)}
                onIncrement={() =>
                  setCompletionTokens(
                    String((Number(completionTokens) || 0) + 1000),
                  )
                }
                onDecrement={() =>
                  setCompletionTokens(
                    String(Math.max(0, (Number(completionTokens) || 0) - 1000)),
                  )
                }
                min={0}
                step={1000}
                placeholder="e.g. 2000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cache-read-tokens"
                className="text-xs font-medium text-dev-text-secondary"
              >
                Cache read tokens
              </label>
              <StepperInput
                id="cache-read-tokens"
                value={cacheReadTokens}
                onChange={(e) => setCacheReadTokens(e.target.value)}
                onIncrement={() =>
                  setCacheReadTokens(
                    String((Number(cacheReadTokens) || 0) + 1000),
                  )
                }
                onDecrement={() =>
                  setCacheReadTokens(
                    String(Math.max(0, (Number(cacheReadTokens) || 0) - 1000)),
                  )
                }
                min={0}
                step={1000}
                placeholder="e.g. 8000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-dev-text-secondary">
              Select models to compare
            </span>
            <input
              type="text"
              placeholder="Search models..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="px-3 py-2 rounded-md border border-dev-border bg-dev-inset text-dev-text placeholder:text-dev-text-secondary focus:outline-none focus:border-dev-link text-sm"
            />
            <div className="max-h-48 overflow-y-auto rounded-md border border-dev-border bg-dev-inset">
              {filteredModels.length === 0 && (
                <p className="px-3 py-2 text-xs text-dev-text-secondary">
                  No models found.
                </p>
              )}
              {filteredModels.map((model) => (
                <label
                  key={model.id}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-dev-button cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(model.id)}
                    onChange={() => toggleModel(model.id)}
                    className="accent-dev-link"
                  />
                  <span className="text-xs text-dev-text truncate">
                    {model.name}
                  </span>
                  <span className="ml-auto text-xs text-dev-text-secondary whitespace-nowrap">
                    {formatCost(model.pricing.prompt)} in /{" "}
                    {formatCost(model.pricing.completion)} out
                  </span>
                </label>
              ))}
            </div>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-dev-link hover:underline self-start cursor-pointer"
              >
                Clear selection ({selectedIds.size})
              </button>
            )}
          </div>

          {sortedResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-dev-text-secondary">
                Estimated cost comparison
              </span>
              <div className="overflow-x-auto rounded-md border border-dev-border">
                <table className="w-full text-sm">
                  <thead className="bg-dev-inset">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-dev-text-secondary">
                        Model
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                        Prompt cost
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                        Cache read cost
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                        Completion cost
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-dev-text-secondary whitespace-nowrap">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((model, i) => {
                      const promptCost =
                        Number.parseFloat(model.pricing.prompt) * prompt
                      const cacheReadPrice = Number.parseFloat(
                        model.pricing.input_cache_read,
                      )
                      const cacheReadCost = Number.isNaN(cacheReadPrice)
                        ? 0
                        : cacheReadPrice * cacheRead
                      const completionCost =
                        Number.parseFloat(model.pricing.completion) * completion
                      const total = promptCost + cacheReadCost + completionCost
                      return (
                        <tr
                          key={model.id}
                          className={`border-t border-dev-border ${i === 0 ? "bg-dev-accent-green/10" : "hover:bg-dev-surface"}`}
                        >
                          <td className="px-3 py-2 text-dev-text font-medium whitespace-nowrap">
                            {i === 0 && (
                              <span className="text-dev-accent-green mr-1">
                                ★
                              </span>
                            )}
                            {model.name}
                          </td>
                          <td className="px-3 py-2 text-right text-dev-text-secondary whitespace-nowrap">
                            ${promptCost.toFixed(4)}
                          </td>
                          <td className="px-3 py-2 text-right text-dev-text-secondary whitespace-nowrap">
                            {cacheReadCost > 0
                              ? `$${cacheReadCost.toFixed(4)}`
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-dev-text-secondary whitespace-nowrap">
                            ${completionCost.toFixed(4)}
                          </td>
                          <td className="px-3 py-2 text-right text-dev-text font-medium whitespace-nowrap">
                            ${total.toFixed(4)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
