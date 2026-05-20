import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { BookOpen, Braces, Database, Images } from "lucide-react"

import Profile from "./Profile"

const meta = {
  title: "Profile/Profile",
  component: Profile,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof Profile>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs: Story["args"] = {
  title: "Hi, I'm Tim.",
  description:
    "I build practical software for the web, artificial intelligence, robotics, and developer workflows.",
  summary:
    "My work favors simple interfaces, local-first browser tools, and systems that turn technical ideas into useful products.",
  location: "Tokyo, Japan",
  imageUrl: "/favicon.ico",
  profileActions: [
    {
      label: "Explore developer tools",
      href: "/developer",
    },
    {
      label: "View GitHub",
      href: "https://github.com",
      isExternal: true,
    },
  ],
  craftAreas: [
    "Web applications",
    "Artificial intelligence",
    "Robotics",
    "Blockchain",
    "Developer tools",
  ],
  currentlyBuilding:
    "Practical tools and systems with a privacy-friendly edge.",
  sidePanelStats: [
    ["Philosophy", "Ship quietly"],
    ["Base", "Tokyo"],
  ],
  linkUrl: [
    {
      imageUrl: "https://cdn.simpleicons.org/github/ffffff",
      linkUrl: "https://github.com",
      label: "GitHub",
    },
    {
      imageUrl: "https://cdn.simpleicons.org/linkedin/0A66C2",
      linkUrl: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      imageUrl: "https://cdn.simpleicons.org/x/ffffff",
      linkUrl: "https://x.com",
      label: "X",
    },
    {
      imageUrl: "https://cdn.simpleicons.org/gmail/EA4335",
      linkUrl: "mailto:test@example.com",
      label: "Email",
    },
  ],
  featuredToolLinks: [
    {
      title: "JSON Viewer",
      description: "View, format, and validate JSON data with a tree view.",
      href: "/developer/json-viewer",
      icon: Braces,
    },
    {
      title: "Image Editor",
      description: "Remove backgrounds, crop images, and stitch screenshots.",
      href: "/developer/image-editor",
      icon: Images,
    },
    {
      title: "OpenAPI Viewer",
      description: "Browse endpoints, schemas, parameters, and suggestions.",
      href: "/developer/openapi-viewer",
      icon: BookOpen,
    },
    {
      title: "DB Explorer",
      description: "Browse SQLite files and run SQL queries in the browser.",
      href: "/developer/db-explorer",
      icon: Database,
    },
  ],
}

export const Default: Story = {
  args: defaultArgs,
  render: (args) => (
    <div className="maker-profile-background min-h-screen px-5 py-12">
      <Profile {...args} />
    </div>
  ),
}

export const SingleLink: Story = {
  args: {
    ...defaultArgs,
    linkUrl: [
      {
        imageUrl: "https://cdn.simpleicons.org/github/ffffff",
        linkUrl: "https://github.com",
        label: "GitHub",
      },
    ],
  },
  render: Default.render,
}
