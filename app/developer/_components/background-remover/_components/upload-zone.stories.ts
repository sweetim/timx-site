import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { fn } from "storybook/test"

import UploadZone from "./upload-zone"

const meta = {
  title: "BackgroundRemover/UploadZone",
  component: UploadZone,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    onClick: fn(),
    onDrop: fn(),
    onDragOver: fn(),
    onDragLeave: fn(),
  },
} satisfies Meta<typeof UploadZone>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { isDragOver: false } }
export const DragOver: Story = { args: { isDragOver: true } }
