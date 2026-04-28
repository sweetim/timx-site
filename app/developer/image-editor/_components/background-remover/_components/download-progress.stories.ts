import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import DownloadProgress from "./download-progress"

const meta = {
  title: "BackgroundRemover/DownloadProgress",
  component: DownloadProgress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof DownloadProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Indeterminate: Story = { args: { progress: 0 } }
export const Started: Story = { args: { progress: 0.1 } }
export const Halfway: Story = { args: { progress: 0.5 } }
export const AlmostDone: Story = { args: { progress: 0.9 } }
export const Complete: Story = { args: { progress: 1 } }
