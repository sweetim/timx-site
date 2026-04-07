import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import ProfileLink from "./ProfileLink"

const meta = {
  title: "Profile/ProfileLink",
  component: ProfileLink,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileLink>

export default meta
type Story = StoryObj<typeof meta>

export const Rounded: Story = {
  args: {
    imageUrl: "https://cdn.simpleicons.org/github/ffffff",
    linkUrl: "https://github.com",
    isRounded: true,
    index: 0,
  },
}

export const Square: Story = {
  args: {
    imageUrl: "https://cdn.simpleicons.org/github/ffffff",
    linkUrl: "https://github.com",
    isRounded: false,
    index: 0,
  },
}

export const MultipleLinks: Story = {
  args: {
    imageUrl: "",
    linkUrl: "",
    index: 0,
  },
  render: () => (
    <div className="flex gap-4">
      <ProfileLink
        imageUrl="https://cdn.simpleicons.org/github/ffffff"
        linkUrl="https://github.com"
        index={0}
      />
      <ProfileLink
        imageUrl="https://cdn.simpleicons.org/linkedin/0A66C2"
        linkUrl="https://linkedin.com"
        index={1}
      />
      <ProfileLink
        imageUrl="https://cdn.simpleicons.org/x/ffffff"
        linkUrl="https://x.com"
        index={2}
      />
      <ProfileLink
        imageUrl="https://cdn.simpleicons.org/gmail/EA4335"
        linkUrl="mailto:test@example.com"
        index={3}
      />
    </div>
  ),
}
