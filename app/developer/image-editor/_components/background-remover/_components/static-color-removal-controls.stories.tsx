import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import {
  DEFAULT_STATIC_COLOR_REMOVAL_COLOR,
  DEFAULT_STATIC_COLOR_REMOVAL_TOLERANCE,
} from "../constants"
import StaticColorRemovalControls from "./static-color-removal-controls"

const meta = {
  title: "BackgroundRemover/StaticColorRemovalControls",
  component: StaticColorRemovalControls,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80 text-dev-text">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaticColorRemovalControls>

export default meta
type Story = StoryObj<typeof meta>

type StaticColorRemovalControlsStoryProps = {
  disabled?: boolean
  error?: string | null
}

const defaultArgs = {
  color: DEFAULT_STATIC_COLOR_REMOVAL_COLOR,
  tolerance: DEFAULT_STATIC_COLOR_REMOVAL_TOLERANCE,
  onColorChange: () => {},
  onToleranceChange: () => {},
  onRemoveColor: () => {},
}

function StaticColorRemovalControlsStory({
  disabled = false,
  error = null,
}: StaticColorRemovalControlsStoryProps) {
  const [color, setColor] = useState(DEFAULT_STATIC_COLOR_REMOVAL_COLOR)
  const [tolerance, setTolerance] = useState(
    DEFAULT_STATIC_COLOR_REMOVAL_TOLERANCE,
  )

  return (
    <StaticColorRemovalControls
      color={color}
      tolerance={tolerance}
      disabled={disabled}
      error={error}
      onColorChange={setColor}
      onToleranceChange={setTolerance}
      onRemoveColor={() => {}}
    />
  )
}

export const Default: Story = {
  args: defaultArgs,
  render: () => <StaticColorRemovalControlsStory />,
}

export const Processing: Story = {
  args: { ...defaultArgs, disabled: true },
  render: () => <StaticColorRemovalControlsStory disabled />,
}

export const Error: Story = {
  args: {
    ...defaultArgs,
    error: "Failed to encode the transparent image.",
  },
  render: () => (
    <StaticColorRemovalControlsStory error="Failed to encode the transparent image." />
  ),
}
