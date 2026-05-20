"use client"

import clsx from "clsx"

type StepperInputProps = {
  id?: string
  value: number | string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  onIncrement?: () => void
  onDecrement?: () => void
  min?: number
  max?: number
  step?: number
  className?: string
  inputClassName?: string
  placeholder?: string
}

const inputBase =
  "w-full bg-transparent text-dev-text text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

export default function StepperInput({
  id,
  value,
  onChange,
  onBlur,
  onIncrement,
  onDecrement,
  min,
  max,
  step = 1,
  className,
  inputClassName,
  placeholder,
}: StepperInputProps) {
  return (
    <div
      className={clsx(
        "flex items-center rounded-lg border border-dev-border bg-dev-surface overflow-hidden focus-within:border-dev-accent-blue transition-colors duration-150",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Decrement"
        className="no-bounce flex items-center justify-center w-9 h-9 text-dev-text-secondary hover:text-dev-text hover:bg-dev-button transition-colors cursor-pointer select-none shrink-0"
      >
        −
      </button>
      <input
        id={id}
        type="number"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={clsx(`${inputBase} text-center font-medium`, inputClassName)}
      />
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increment"
        className="no-bounce flex items-center justify-center w-9 h-9 text-dev-text-secondary hover:text-dev-text hover:bg-dev-button transition-colors cursor-pointer select-none shrink-0"
      >
        +
      </button>
    </div>
  )
}
