import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import ProgressRing from "./progress-ring"

const meta = {
  title: "BackgroundRemover/ProgressRing",
  component: ProgressRing,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof ProgressRing>

export default meta
type Story = StoryObj<typeof meta>

export const Zero: Story = { args: { progress: 0 } }
export const Quarter: Story = { args: { progress: 0.25 } }
export const Half: Story = { args: { progress: 0.5 } }
export const ThreeQuarters: Story = { args: { progress: 0.75 } }
export const Complete: Story = { args: { progress: 1 } }
