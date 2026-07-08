"use client"

import clsx from "clsx"
import { type FC, useMemo, useState } from "react"
import { match } from "ts-pattern"

type BitWidth = 8 | 16 | 32 | 64
type Operator = "and" | "or" | "xor" | "not" | "shl" | "shr" | "none"
type Field = "hex" | "dec" | "bin"

const WIDTHS: BitWidth[] = [8, 16, 32, 64]

const OPERATORS: {
  id: Operator
  symbol: string
  label: string
  unary: boolean
}[] = [
  { id: "and", symbol: "&", label: "AND", unary: false },
  { id: "or", symbol: "|", label: "OR", unary: false },
  { id: "xor", symbol: "^", label: "XOR", unary: false },
  { id: "not", symbol: "~", label: "NOT", unary: true },
  { id: "shl", symbol: "<<", label: "SHL", unary: false },
  { id: "shr", symbol: ">>", label: "SHR", unary: false },
  { id: "none", symbol: "", label: "VALUE", unary: false },
]

const FIELD_META: Record<Field, { label: string }> = {
  hex: { label: "Hex" },
  dec: { label: "Dec" },
  bin: { label: "Bin" },
}

const ZERO = BigInt(0)
const ONE = BigInt(1)
const NIBBLE_MASK = BigInt(0xf)

function maskOf(width: BitWidth): bigint {
  return (ONE << BigInt(width)) - ONE
}

function parseBase(text: string, field: Field, width: BitWidth): bigint | null {
  let value = text.trim()
  if (value === "") return ZERO
  if (field === "hex") value = value.replace(/^0x/i, "")
  else if (field === "bin") value = value.replace(/^0b/i, "")
  if (value === "") return ZERO
  const valid =
    field === "hex"
      ? /^[0-9a-f]+$/i.test(value)
      : field === "dec"
        ? /^[0-9]+$/.test(value)
        : /^[01]+$/.test(value)
  if (!valid) return null
  try {
    const big =
      field === "hex"
        ? BigInt(`0x${value.toLowerCase()}`)
        : field === "bin"
          ? BigInt(`0b${value}`)
          : BigInt(value)
    return big & maskOf(width)
  } catch {
    return null
  }
}

function format(value: bigint, field: Field): string {
  if (field === "hex") return value.toString(16).toUpperCase()
  if (field === "dec") return value.toString(10)
  return value.toString(2)
}

function popcount(value: bigint): number {
  let count = 0
  let remaining = value
  while (remaining > ZERO) {
    count += Number(remaining & ONE)
    remaining >>= ONE
  }
  return count
}

function compute(op: Operator, a: bigint, b: bigint, width: BitWidth): bigint {
  const mask = maskOf(width)
  const widthBig = BigInt(width)
  return match(op)
    .with("and", () => a & b & mask)
    .with("or", () => (a | b) & mask)
    .with("xor", () => (a ^ b) & mask)
    .with("not", () => ~a & mask)
    .with("shl", () => (b >= widthBig ? ZERO : (a << b) & mask))
    .with("shr", () => (b >= widthBig ? ZERO : a >> b))
    .with("none", () => a)
    .exhaustive()
}

type BitGridProps = {
  value: bigint
  width: BitWidth
  editable?: boolean
  diffMask?: bigint
  onToggle?: (index: number) => void
}

const BitGrid: FC<BitGridProps> = ({
  value,
  width,
  editable = false,
  diffMask,
  onToggle,
}) => {
  const nibbleCount = width / 4
  const nibbles = Array.from(
    { length: nibbleCount },
    (_, index) => nibbleCount - 1 - index,
  )

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="inline-flex gap-1.5">
        {nibbles.map((nibble) => {
          const shift = nibble * 4
          const nibbleValue = Number((value >> BigInt(shift)) & NIBBLE_MASK)
          const hexDigit = nibbleValue.toString(16).toUpperCase()
          return (
            <div
              key={nibble}
              className="flex flex-col gap-1"
            >
              <div className="flex w-full justify-center rounded bg-dev-button/40 py-0.5 font-mono text-xs text-dev-text-secondary">
                {hexDigit}
              </div>
              <div className="flex gap-0.5">
                {[3, 2, 1, 0].map((offset) => {
                  const index = shift + offset
                  const isSet = ((value >> BigInt(index)) & ONE) === ONE
                  const isDiff =
                    diffMask !== undefined
                    && ((diffMask >> BigInt(index)) & ONE) === ONE
                  return (
                    <button
                      key={offset}
                      type="button"
                      disabled={!editable}
                      title={`Bit ${index}`}
                      onClick={() => onToggle?.(index)}
                      className={clsx(
                        "flex size-7 items-center justify-center rounded-sm font-mono text-xs transition-colors",
                        editable && "no-bounce cursor-pointer hover:opacity-80",
                        isSet
                          ? "bg-dev-accent-blue text-dev-canvas"
                          : "bg-dev-inset text-dev-text-secondary",
                        isDiff && "ring-1 ring-dev-accent-orange",
                        !editable && "cursor-default",
                      )}
                    >
                      {isSet ? "1" : "0"}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-0.5">
                {[3, 2, 1, 0].map((offset) => (
                  <span
                    key={offset}
                    className="flex h-4 w-7 items-center justify-center font-mono text-[10px] text-dev-text-secondary"
                  >
                    {offset === 3 ? shift + 3 : ""}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type OperandEditorProps = {
  label: string
  width: BitWidth
  value: bigint
  onChange: (value: bigint) => void
  onBitToggle: (index: number) => void
  diffMask?: bigint
}

const OperandEditor: FC<OperandEditorProps> = ({
  label,
  width,
  value,
  onChange,
  onBitToggle,
  diffMask,
}) => {
  const [draft, setDraft] = useState<{ field: Field; text: string } | null>(
    null,
  )

  const fieldText = (field: Field) =>
    draft?.field === field ? draft.text : format(value, field)

  const handleChange = (field: Field, text: string) => {
    setDraft({ field, text })
    const parsed = parseBase(text, field, width)
    if (parsed !== null) onChange(parsed)
  }

  const setBits = popcount(value)

  return (
    <div className="rounded-lg border border-dev-border bg-dev-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-dev-text">{label}</span>
        <span className="font-mono text-xs text-dev-text-secondary">
          {setBits} {setBits === 1 ? "bit" : "bits"} set
        </span>
      </div>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(Object.keys(FIELD_META) as Field[]).map((field) => (
          <label
            key={field}
            className="flex flex-col gap-1"
          >
            <span className="text-[10px] tracking-wide text-dev-text-secondary uppercase">
              {FIELD_META[field].label}
            </span>
            <input
              type="text"
              value={fieldText(field)}
              onFocus={() => setDraft({ field, text: format(value, field) })}
              onChange={(event) => handleChange(field, event.target.value)}
              onBlur={() => setDraft(null)}
              spellCheck={false}
              autoComplete="off"
              className="rounded border border-dev-border bg-dev-inset px-2 py-1.5 font-mono text-sm text-dev-text focus:border-dev-link focus:outline-none"
            />
          </label>
        ))}
      </div>
      <BitGrid
        value={value}
        width={width}
        editable
        diffMask={diffMask}
        onToggle={onBitToggle}
      />
    </div>
  )
}

export default function BitwiseVisualizer() {
  const [width, setWidth] = useState<BitWidth>(8)
  const [operator, setOperator] = useState<Operator>("and")
  const [a, setA] = useState<bigint>(BigInt(0b10101010))
  const [b, setB] = useState<bigint>(BigInt(0b11110000))

  const handleWidth = (next: BitWidth) => {
    setWidth(next)
    const mask = maskOf(next)
    setA((prev) => prev & mask)
    setB((prev) => prev & mask)
  }

  const toggleA = (index: number) =>
    setA((prev) => prev ^ (ONE << BigInt(index)))
  const toggleB = (index: number) =>
    setB((prev) => prev ^ (ONE << BigInt(index)))

  const result = useMemo(
    () => compute(operator, a, b, width),
    [operator, a, b, width],
  )

  const isUnary = operator === "not"
  const isShift = operator === "shl" || operator === "shr"
  const isView = operator === "none"
  const activeOperator = OPERATORS.find((item) => item.id === operator)

  const diffMask = useMemo(() => {
    if (operator === "and" || operator === "or" || operator === "xor") {
      return a ^ b
    }
    return undefined
  }, [operator, a, b])

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-dev-text">
        Bitwise Visualizer
      </h1>
      <p className="mb-6 text-sm text-dev-text-secondary">
        Compare and combine hex values bit-by-bit. Edit any field, toggle bits
        directly, or switch operators — AND, OR, XOR, NOT, and shifts.
      </p>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-dev-text-secondary">Width</span>
          <div className="flex rounded-md border border-dev-border bg-dev-surface p-0.5">
            {WIDTHS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleWidth(option)}
                className={clsx(
                  "no-bounce cursor-pointer rounded px-2.5 py-1 font-mono text-xs transition-colors",
                  width === option
                    ? "bg-dev-button text-dev-text"
                    : "text-dev-text-secondary hover:text-dev-text",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-dev-border bg-dev-surface p-0.5">
          {OPERATORS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setOperator(option.id)}
              className={clsx(
                "no-bounce cursor-pointer rounded px-2.5 py-1 font-mono text-xs transition-colors",
                operator === option.id
                  ? "bg-dev-button text-dev-text"
                  : "text-dev-text-secondary hover:text-dev-text",
              )}
            >
                {option.symbol ? `${option.symbol} ${option.label}` : option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <OperandEditor
          label={isView ? "Value" : "A"}
          width={width}
          value={a}
          onChange={setA}
          onBitToggle={toggleA}
          diffMask={diffMask}
        />

        {!isView &&
          (isUnary ? (
            <div className="flex justify-center">
              <span className="font-mono text-lg text-dev-link">
                {activeOperator?.symbol}A
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-lg text-dev-link">
                  {activeOperator?.symbol}
                </span>
              </div>
              <OperandEditor
                label={isShift ? "B — shift count" : "B"}
                width={width}
                value={b}
                onChange={setB}
                onBitToggle={toggleB}
                diffMask={diffMask}
              />
            </>
          ))}

        {!isView && (
          <div className="rounded-lg border border-dev-border bg-dev-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-dev-text">Result</span>
              <span className="font-mono text-xs text-dev-text-secondary">
                {popcount(result)} {popcount(result) === 1 ? "bit" : "bits"} set
              </span>
            </div>
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(Object.keys(FIELD_META) as Field[]).map((field) => (
                <div
                  key={field}
                  className="flex flex-col gap-1"
                >
                  <span className="text-[10px] tracking-wide text-dev-text-secondary uppercase">
                    {FIELD_META[field].label}
                  </span>
                  <code className="overflow-x-auto rounded border border-dev-border bg-dev-inset px-2 py-1.5 font-mono text-sm text-dev-syntax-number">
                    {format(result, field)}
                  </code>
                </div>
              ))}
            </div>
            <BitGrid
              value={result}
              width={width}
              diffMask={diffMask}
            />
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-dev-text-secondary">
        Tip: click any bit cell in A or B to toggle it. Orange rings mark bits
        where A and B differ so AND, OR, and XOR results read at a glance.
      </p>
    </div>
  )
}
