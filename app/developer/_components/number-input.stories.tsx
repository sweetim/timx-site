"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import StepperInput from "./stepper-input"

const meta = {
  title: "Developer/NumberInput",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-dev-canvas p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj

type InputStyle = {
  name: string
  description: string
  render: () => React.ReactNode
}

const inputBase =
  "w-full bg-transparent text-dev-text text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

function useNumberState(initial: number) {
  const [value, setValue] = useState(initial)
  const increment = () => setValue((v) => v + 1)
  const decrement = () => setValue((v) => v - 1)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number.parseInt(e.target.value, 10)
    if (!Number.isNaN(n)) setValue(n)
  }
  return { value, setValue, increment, decrement, onChange }
}

function DefaultInput() {
  const { value, onChange } = useNumberState(42)
  return (
    <div className="w-64 rounded-lg border border-dev-border bg-dev-surface px-3 py-2 focus-within:border-dev-accent-blue focus-within:ring-1 focus-within:ring-dev-accent-blue transition-all duration-150">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={inputBase}
      />
    </div>
  )
}

function StepperInputStory() {
  const { value, increment, decrement, onChange } = useNumberState(5)
  return (
    <StepperInput
      value={value}
      onChange={onChange}
      onIncrement={increment}
      onDecrement={decrement}
      className="w-48"
    />
  )
}

function FloatingLabelInput() {
  const { value, onChange } = useNumberState(0)
  return (
    <div className="w-64 rounded-lg border border-dev-border bg-dev-surface px-3 pt-5 pb-2 focus-within:border-dev-accent-blue focus-within:ring-1 focus-within:ring-dev-accent-blue transition-all duration-150 relative">
      <label className="absolute top-1.5 left-3 text-[10px] font-medium text-dev-text-secondary tracking-wide uppercase">
        Quantity
      </label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={inputBase}
      />
    </div>
  )
}

function PillInput() {
  const { value, onChange } = useNumberState(100)
  return (
    <div className="w-56 rounded-full border border-dev-border bg-dev-surface px-5 py-2.5 focus-within:border-dev-accent-blue focus-within:ring-1 focus-within:ring-dev-accent-blue transition-all duration-150">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={`${inputBase} text-center`}
      />
    </div>
  )
}

function UnderlinedInput() {
  const { value, onChange } = useNumberState(250)
  return (
    <div className="w-56 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-dev-border after:transition-colors after:duration-150 focus-within:after:bg-dev-accent-blue pb-1">
      <label className="block text-xs font-medium text-dev-text-secondary mb-1.5">
        Price
      </label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-dev-text text-sm outline-none border-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  )
}

function UnitInput() {
  const { value, onChange } = useNumberState(1024)
  return (
    <div className="w-64 flex items-center rounded-lg border border-dev-border bg-dev-surface overflow-hidden focus-within:border-dev-accent-blue transition-colors duration-150">
      <span className="px-3 py-2 text-sm text-dev-text-secondary bg-dev-inset border-r border-dev-border select-none">
        MB
      </span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={`${inputBase} px-3 py-2`}
      />
    </div>
  )
}

function DollarInput() {
  const { value, onChange } = useNumberState(49)
  return (
    <div className="w-56 flex items-center rounded-lg border border-dev-border bg-dev-surface px-3 py-2 focus-within:border-dev-accent-green focus-within:ring-1 focus-within:ring-dev-accent-green transition-all duration-150">
      <span className="text-dev-accent-green text-sm font-medium mr-1.5 select-none">
        $
      </span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={inputBase}
      />
      <span className="text-dev-text-secondary text-xs ml-1.5 select-none">
        .00
      </span>
    </div>
  )
}

function GlassInput() {
  const { value, onChange } = useNumberState(7)
  return (
    <div className="w-56 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 focus-within:border-dev-accent-purple/50 focus-within:ring-1 focus-within:ring-dev-accent-purple/30 transition-all duration-200">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={`${inputBase} text-white/90 placeholder:text-white/30`}
      />
    </div>
  )
}

function SliderInput() {
  const { value, setValue } = useNumberState(50)
  return (
    <div className="w-72 flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full bg-dev-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dev-accent-blue [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
      />
      <div className="w-14 rounded-md border border-dev-border bg-dev-surface px-2 py-1.5 text-center">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10)
            if (!Number.isNaN(n)) setValue(Math.min(100, Math.max(0, n)))
          }}
          className={`${inputBase} text-center text-xs w-full`}
        />
      </div>
    </div>
  )
}

function CompactInput() {
  const { value, onChange } = useNumberState(1)
  return (
    <div className="w-20 rounded border border-dev-border bg-dev-surface px-2 py-1 focus-within:border-dev-accent-blue transition-colors duration-150">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={`${inputBase} text-xs text-center`}
      />
    </div>
  )
}

function AccentBorderedInput() {
  const { value, onChange } = useNumberState(88)
  return (
    <div className="w-56 rounded-lg border-2 border-dev-accent-blue/40 bg-dev-surface px-3 py-2 focus-within:border-dev-accent-blue transition-all duration-200">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={inputBase}
      />
    </div>
  )
}

function IconInput() {
  const { value, onChange } = useNumberState(60)
  return (
    <div className="w-64 flex items-center gap-2 rounded-lg border border-dev-border bg-dev-surface px-3 py-2 focus-within:border-dev-accent-orange focus-within:ring-1 focus-within:ring-dev-accent-orange transition-all duration-150">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4 text-dev-accent-orange shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={inputBase}
      />
      <span className="text-dev-text-secondary text-xs whitespace-nowrap select-none">
        sec
      </span>
    </div>
  )
}

function GradientBorderInput() {
  const { value, onChange } = useNumberState(2024)
  return (
    <div className="w-56 p-[1px] rounded-lg bg-gradient-to-r from-dev-accent-blue via-dev-accent-purple to-dev-accent-green">
      <div className="rounded-[7px] bg-dev-surface px-3 py-2">
        <input
          type="number"
          value={value}
          onChange={onChange}
          className={inputBase}
        />
      </div>
    </div>
  )
}

const inputStyles: InputStyle[] = [
  {
    name: "Default",
    description: "Clean bordered input with focus ring",
    render: DefaultInput,
  },
  {
    name: "Stepper",
    description: "Plus/minus buttons for increment/decrement",
    render: StepperInputStory,
  },
  {
    name: "Floating Label",
    description: "Label positioned above the value inside the field",
    render: FloatingLabelInput,
  },
  {
    name: "Pill",
    description: "Fully rounded capsule shape",
    render: PillInput,
  },
  {
    name: "Underlined",
    description: "Bottom-border-only with animated accent",
    render: UnderlinedInput,
  },
  {
    name: "Unit Prefix",
    description: "With a unit badge on the left (MB)",
    render: UnitInput,
  },
  {
    name: "Currency",
    description: "Dollar sign prefix with green accent",
    render: DollarInput,
  },
  {
    name: "Glassmorphism",
    description: "Frosted glass effect with purple accent",
    render: GlassInput,
  },
  {
    name: "Range Slider",
    description: "Paired range slider + number input",
    render: SliderInput,
  },
  {
    name: "Compact",
    description: "Small inline input for tight spaces",
    render: CompactInput,
  },
  {
    name: "Accent Border",
    description: "Thick colored border pre-focused",
    render: AccentBorderedInput,
  },
  {
    name: "With Icon + Suffix",
    description: "Leading icon with trailing unit suffix",
    render: IconInput,
  },
  {
    name: "Gradient Border",
    description: "Animated gradient border effect",
    render: GradientBorderInput,
  },
]

function NumberInputGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
      {inputStyles.map((style) => (
        <div
          key={style.name}
          className="flex flex-col gap-2 rounded-lg border border-dev-border bg-dev-surface p-4"
        >
          <span className="text-sm font-medium text-dev-text">
            {style.name}
          </span>
          <span className="text-xs text-dev-text-secondary">
            {style.description}
          </span>
          <div className="mt-2">
            <style.render />
          </div>
        </div>
      ))}
    </div>
  )
}

export const AllStyles: Story = {
  render: () => <NumberInputGrid />,
}

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DefaultInput />
    </div>
  ),
}

export const Stepper: Story = {
  render: () => <StepperInputStory />,
}

export const FloatingLabel: Story = {
  render: () => <FloatingLabelInput />,
}

export const Pill: Story = {
  render: () => <PillInput />,
}

export const Underlined: Story = {
  render: () => <UnderlinedInput />,
}

export const UnitPrefix: Story = {
  render: () => <UnitInput />,
}

export const Currency: Story = {
  render: () => <DollarInput />,
}

export const Glassmorphism: Story = {
  render: () => <GlassInput />,
}

export const RangeSlider: Story = {
  render: () => <SliderInput />,
}

export const Compact: Story = {
  render: () => <CompactInput />,
}

export const AccentBorder: Story = {
  render: () => <AccentBorderedInput />,
}

export const WithIcon: Story = {
  render: () => <IconInput />,
}

export const GradientBorder: Story = {
  render: () => <GradientBorderInput />,
}
