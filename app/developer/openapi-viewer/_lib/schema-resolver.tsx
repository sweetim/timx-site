"use client"

import clsx from "clsx"
import { useState } from "react"
import type { OpenApiSpec } from "../_components/types"

const COMPOSITE = Symbol("composite")

function resolveRef(
  ref: string,
  spec: OpenApiSpec,
): Record<string, unknown> | null {
  if (!ref.startsWith("#/")) return null
  const parts = ref.slice(2).split("/")
  let current: unknown = spec
  for (const part of parts) {
    if (current == null || typeof current !== "object") return null
    current = (current as Record<string, unknown>)[part]
  }
  if (current && typeof current === "object" && !Array.isArray(current)) {
    return current as Record<string, unknown>
  }
  return null
}

function generateExampleFromSchema(
  schema: Record<string, unknown>,
  spec: OpenApiSpec,
  depth = 0,
  visited?: Set<string>,
): unknown {
  if (depth > 10) return null
  const visitedRefs = visited ?? new Set<string>()

  if (schema.$ref && typeof schema.$ref === "string") {
    if (visitedRefs.has(schema.$ref)) return null
    visitedRefs.add(schema.$ref)
    const resolved = resolveRef(schema.$ref, spec)
    if (resolved) {
      return generateExampleFromSchema(resolved, spec, depth + 1, visitedRefs)
    }
    return null
  }

  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0)
    return schema.enum[0]

  const type = schema.type as string | undefined

  if (type === "string") {
    if (schema.format === "date-time") return "2025-01-15T09:30:00Z"
    if (schema.format === "date") return "2025-01-15"
    if (schema.format === "email") return "user@example.com"
    if (schema.format === "uri" || schema.format === "url")
      return "https://example.com"
    if (schema.format === "uuid") return "550e8400-e29b-41d4-a716-446655440000"
    return "string"
  }
  if (type === "integer") return 0
  if (type === "number") return 0.0
  if (type === "boolean") return true
  if (type === "null") return null

  if (type === "array") {
    const items = schema.items as Record<string, unknown> | undefined
    if (items && typeof items === "object") {
      return [generateExampleFromSchema(items, spec, depth + 1, visitedRefs)]
    }
    return []
  }

  if (type === "object" || (!type && schema.properties)) {
    const properties = schema.properties as
      | Record<string, Record<string, unknown>>
      | undefined
    if (properties && typeof properties === "object") {
      const required = new Set((schema.required as string[] | undefined) ?? [])
      const result: Record<string, unknown> = {}
      for (const [key, propSchema] of Object.entries(properties)) {
        if (typeof propSchema === "object" && propSchema !== null) {
          const suffix = required.has(key) ? key : `${key}?`
          result[suffix] = generateExampleFromSchema(
            propSchema,
            spec,
            depth + 1,
            visitedRefs,
          )
        }
      }
      return result
    }
    return {}
  }

  if (schema.allOf && Array.isArray(schema.allOf)) {
    const merged: Record<string, unknown> = {}
    const allRequired = new Set<string>()
    for (const sub of schema.allOf as Record<string, unknown>[]) {
      if (typeof sub === "object" && sub !== null) {
        const subRequired = sub.required as string[] | undefined
        if (subRequired) for (const r of subRequired) allRequired.add(r)
        const subExample = generateExampleFromSchema(
          sub as Record<string, unknown>,
          spec,
          depth + 1,
          visitedRefs,
        )
        if (subExample && typeof subExample === "object") {
          for (const [k, v] of Object.entries(
            subExample as Record<string, unknown>,
          )) {
            const bareKey = k.endsWith("?") ? k.slice(0, -1) : k
            const suffix = allRequired.has(bareKey) ? bareKey : `${bareKey}?`
            merged[suffix] = v
          }
        }
      }
    }
    return Object.keys(merged).length > 0 ? merged : null
  }

  const composables = (schema.oneOf ?? schema.anyOf) as
    | Record<string, unknown>[]
    | undefined
  if (composables && Array.isArray(composables) && composables.length > 0) {
    const options = composables
      .map((sub) =>
        generateExampleFromSchema(sub, spec, depth + 1, visitedRefs),
      )
      .filter((v) => v != null)
    if (options.length === 0) return null
    if (options.length === 1) return options[0]
    ;(options as unknown as Record<symbol, boolean>)[COMPOSITE] = true
    return options
  }

  return null
}

type JsonLine = { text: string; highlight?: string }

const COMPOSITE_COLORS = [
  "composite-0",
  "composite-1",
  "composite-2",
  "composite-3",
  "composite-4",
] as const

function isCompositeArray(v: unknown): boolean {
  return (
    Array.isArray(v) && !!(v as unknown as Record<symbol, unknown>)[COMPOSITE]
  )
}

function renderJsonLines(
  value: unknown,
  indent: number,
  inherited?: string,
): JsonLine[] {
  const pad = "  ".repeat(indent)
  const hl = inherited
  const ln = (text: string, override?: string) => ({
    text,
    highlight: override ?? hl,
  })

  if (value === null) return [ln(`${pad}null`)]
  if (value === undefined) return [ln(`${pad}undefined`)]
  if (typeof value !== "object") return [ln(`${pad}${JSON.stringify(value)}`)]

  if (Array.isArray(value)) {
    const isComposite = isCompositeArray(value)
    if (isComposite) {
      if (value.length === 0) return [ln(`${pad}[]`)]
      const lines: JsonLine[] = [ln(`${pad}[`)]
      value.forEach((item, i) => {
        const color = COMPOSITE_COLORS[i % COMPOSITE_COLORS.length]
        const childLines = renderJsonLines(item, indent + 1, color)
        if (i < value.length - 1) childLines[childLines.length - 1].text += ","
        lines.push(...childLines)
      })
      lines.push(ln(`${pad}]`))
      return lines
    }
    if (value.length === 0) return [ln(`${pad}[]`, hl)]
    const lines: JsonLine[] = [ln(`${pad}[`, hl)]
    value.forEach((item, i) => {
      const childLines = renderJsonLines(item, indent + 1, hl)
      if (i < value.length - 1) childLines[childLines.length - 1].text += ","
      lines.push(...childLines)
    })
    lines.push(ln(`${pad}]`, hl))
    return lines
  }

  const entries = Object.entries(value as Record<string, unknown>)
  const lines: JsonLine[] = [ln(`${pad}{`)]
  entries.forEach(([key, val], i) => {
    const isLast = i === entries.length - 1
    const isOpt = key.endsWith("?")
    const propHl = isOpt
      ? "optional"
      : hl ?? (isCompositeArray(val) ? "composite" : undefined)

    const childLines = renderJsonLines(val, indent + 1, propHl)
    const childPad = "  ".repeat(indent + 1)
    childLines[0].text = `${childPad}${JSON.stringify(key)}: ${childLines[0].text.slice(childPad.length)}`
    if (!isLast) childLines[childLines.length - 1].text += ","
    lines.push(...childLines)
  })
  lines.push(ln(`${pad}}`))
  return lines
}

const HIGHLIGHT_CLASS: Record<string, string> = {
  optional: "bg-dev-accent-orange/10 px-1 -mx-1",
  "composite-0": "bg-dev-accent-purple/10 px-1 -mx-1",
  "composite-1": "bg-dev-accent-blue/10 px-1 -mx-1",
  "composite-2": "bg-dev-accent-green/10 px-1 -mx-1",
  "composite-3": "bg-dev-accent-orange/10 px-1 -mx-1",
  "composite-4": "bg-dev-accent-red/10 px-1 -mx-1",
}

function HighlightedJsonPreview({ value }: { value: unknown }) {
  const lines =
    typeof value === "object" && value !== null
      ? renderJsonLines(value, 0)
      : [{ text: JSON.stringify(value, null, 2), highlight: undefined }]
  return (
    <pre className="text-xs text-dev-syntax-string bg-dev-inset rounded p-3 overflow-auto max-h-64 font-mono">
      {lines.map((line, index) => (
        <div
          key={index}
          className={
            line.highlight ? HIGHLIGHT_CLASS[line.highlight] : undefined
          }
        >
          {line.text}
        </div>
      ))}
    </pre>
  )
}

function ExampleSchemaTabs({
  example,
  schema,
  spec,
}: {
  example: unknown
  schema: unknown
  spec: OpenApiSpec
}) {
  const [tab, setTab] = useState<"example" | "schema">("example")
  const hasSchema = !!schema
  const schemaObj = schema as Record<string, unknown> | undefined
  const resolvedSchema =
    hasSchema && schemaObj?.$ref && typeof schemaObj.$ref === "string"
      ? (resolveRef(schemaObj.$ref, spec) ?? schema)
      : schema
  const hasExplicitExample = example != null
  const inferredExample =
    !hasExplicitExample
    && hasSchema
    && schemaObj
    && typeof schemaObj === "object"
      ? generateExampleFromSchema(schemaObj, spec)
      : null
  const hasInferredExample = inferredExample != null
  const hasExample = hasExplicitExample || hasInferredExample
  const effectiveExample = hasExplicitExample ? example : inferredExample

  if (!hasSchema && !hasExample) return null

  if (!hasSchema) {
    return (
      <div className="mt-2">
        <div className="text-xs text-dev-text-secondary mb-1">Example</div>
        <HighlightedJsonPreview value={effectiveExample} />
      </div>
    )
  }

  return (
    <div className="mt-2">
      {hasExample && (
        <div className="flex gap-1 mb-1">
          <button
            type="button"
            className={clsx(
              "px-2 py-1 text-xs rounded transition-colors cursor-pointer",
              tab === "example"
                ? "bg-dev-accent-blue text-white"
                : "bg-dev-button text-dev-text-secondary hover:bg-dev-button-hover",
            )}
            onClick={() => setTab("example")}
          >
            Example{hasInferredExample ? " (inferred)" : ""}
          </button>
          <button
            type="button"
            className={clsx(
              "px-2 py-1 text-xs rounded transition-colors cursor-pointer",
              tab === "schema"
                ? "bg-dev-accent-blue text-white"
                : "bg-dev-button text-dev-text-secondary hover:bg-dev-button-hover",
            )}
            onClick={() => setTab("schema")}
          >
            Schema
          </button>
        </div>
      )}
      {!hasExample && (
        <div className="text-xs text-dev-text-secondary mb-1">Schema</div>
      )}
      <HighlightedJsonPreview
        value={
          hasExample && tab === "example" ? effectiveExample : resolvedSchema
        }
      />
    </div>
  )
}

export { ExampleSchemaTabs, HighlightedJsonPreview }
