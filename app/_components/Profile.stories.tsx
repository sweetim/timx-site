import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import Profile from "./Profile"

const meta = {
  title: "Profile/Profile",
  component: Profile,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Profile>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs: Story["args"] = {
  title: "Tim X",
  description: "Full-stack developer",
  location: "San Francisco, CA",
  imageUrl: "/favicon.ico",
  linkUrl: [
    {
      imageUrl: "https://cdn.simpleicons.org/github/ffffff",
      linkUrl: "https://github.com",
    },
    {
      imageUrl: "https://cdn.simpleicons.org/linkedin/0A66C2",
      linkUrl: "https://linkedin.com",
    },
    {
      imageUrl: "https://cdn.simpleicons.org/x/ffffff",
      linkUrl: "https://x.com",
    },
    {
      imageUrl: "https://cdn.simpleicons.org/gmail/EA4335",
      linkUrl: "mailto:test@example.com",
    },
  ],
}

export const Default: Story = { args: defaultArgs }

export const SingleLink: Story = {
  args: {
    ...defaultArgs,
    linkUrl: [
      {
        imageUrl: "https://cdn.simpleicons.org/github/ffffff",
        linkUrl: "https://github.com",
      },
    ],
  },
}
