import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { fn } from "storybook/test"

import ErrorState from "./error-state"

const meta = {
  title: "BackgroundRemover/ErrorState",
  component: ErrorState,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { onReset: fn() },
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { message: "Failed to process image. Please try again." },
}

export const ModelLoadFailed: Story = {
  args: {
    message: "Failed to download the AI model. Check your internet connection.",
  },
}

export const UnexpectedError: Story = {
  args: { message: "An unexpected error occurred." },
}
