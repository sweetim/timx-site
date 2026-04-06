import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import BackgroundRemover from "./index"

const meta = {
  title: "BackgroundRemover/BackgroundRemover",
  component: BackgroundRemover,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof BackgroundRemover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
