import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import ImageEditor from "./image-editor"

const meta = {
  title: "Developer/ImageEditor",
  component: ImageEditor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Persistent image editing workspace with mode-specific properties panels and a stitch mode that can start from the current canvas image.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ImageEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
