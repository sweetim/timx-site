import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import NavBar from "./nav-bar"

const meta = {
  title: "Developer/NavBar",
  component: NavBar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/developer",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NavBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ActiveJsonViewer: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/developer/json-viewer",
      },
    },
  },
}

export const ActiveBackgroundRemover: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/developer/background-remover",
      },
    },
  },
}
