import {
  SiDiscord,
  SiDiscordHex,
  SiDocker,
  SiDockerHex,
  SiGithub,
  SiGithubHex,
  SiGitlab,
  SiGitlabHex,
  SiStackoverflow,
  SiStackoverflowHex,
} from "@icons-pack/react-simple-icons"
import type { Metadata } from "next"
import { ItemListJsonLd, PersonJsonLd } from "@/app/_components/json-ld"
import Profile, {
  type ProfileFeaturedLink,
  type ProfileProps,
} from "@/app/_components/Profile"
import { tools } from "@/app/developer/_lib/tools"
import opengraph from "@/app/opengraph.jpg"

const siteUrl = "https://timx.co"
const homepageTitle = "Tim - Software Maker in Tokyo"
const homepageDescription =
  "Tim is a software maker in Tokyo building practical tools and systems for the web, artificial intelligence, robotics, blockchain, and developer workflows."

const featuredToolSlugs = [
  "llm-usage",
  "image-editor",
  "db-explorer",
  "openapi-viewer",
]

function getFeaturedToolLinks(): ProfileFeaturedLink[] {
  const toolMap = new Map(tools.map((t) => [t.slug, t]))
  return featuredToolSlugs
    .map((slug) => {
      const tool = toolMap.get(slug)
      if (!tool) return null
      return {
        title: tool.name,
        description: tool.description,
        href: `/developer/${tool.slug}`,
        icon: tool.icon,
      }
    })
    .filter(Boolean) as ProfileFeaturedLink[]
}

export const metadata: Metadata = {
  title: homepageTitle,
  description: homepageDescription,
  alternates: { canonical: siteUrl },
  authors: [{ name: "Tim", url: siteUrl }],
  creator: "Tim",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "timx",
    title: homepageTitle,
    description: homepageDescription,
    images: [opengraph.src],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepageDescription,
    images: [opengraph.src],
  },
}

function getProfile(): ProfileProps {
  return {
    title: "Hi, I'm Tim.",
    description:
      "I build and scale autonomous ecosystems. My expertise spans pioneering a nation’s first public-road delivery robots , scaling international engineering teams from zero , and architecting enterprise GenAI frameworks for massive productivity gains.",
    location: "Tokyo, Japan",
    imageUrl: "/profile-image.webp",
    craftAreas: ["Embedded", "Mobile", "Cloud", "AI", "Robotics", "Blockchain"],
    linkUrl: [
      {
        icon: SiGitlab,
        color: SiGitlabHex,
        linkUrl: "https://gitlab.com/users/hosweetim/projects",
        label: "GitLab",
      },
      {
        icon: SiGithub,
        color: SiGithubHex,
        linkUrl: "https://github.com/sweetim",
        label: "GitHub",
      },
      {
        icon: SiDiscord,
        color: SiDiscordHex,
        linkUrl: "https://discord.gg/6Wzx6rBShQ",
        label: "Discord",
      },
      {
        icon: SiDocker,
        color: SiDockerHex,
        linkUrl: "https://hub.docker.com/r/timx/",
        label: "Docker Hub",
      },
      {
        imageUrl: "/linkedin.svg",
        linkUrl: "https://www.linkedin.com/in/swee-tim-ho-8a378048",
        label: "LinkedIn",
      },
      {
        icon: SiStackoverflow,
        color: SiStackoverflowHex,
        linkUrl: "https://stackoverflow.com/users/2297825/tim",
        label: "Stack Overflow",
        isRounded: false,
      },
    ],
    featuredToolLinks: getFeaturedToolLinks(),
  }
}

export default function Home() {
  const featuredToolLinks = getFeaturedToolLinks()

  return (
    <>
      <PersonJsonLd
        name="Tim"
        url={siteUrl}
        jobTitle="Software Developer"
        description={homepageDescription}
        image={`${siteUrl}${opengraph.src}`}
        knowsAbout={[
          "Embedded systems",
          "Mobile development",
          "Cloud computing",
          "Robotics",
          "Artificial intelligence",
          "Blockchain",
          "Web development",
        ]}
        sameAs={[
          "https://github.com/sweetim",
          "https://gitlab.com/users/hosweetim/projects",
          "https://hub.docker.com/r/timx/",
          "https://www.linkedin.com/in/swee-tim-ho-8a378048",
          "https://stackoverflow.com/users/2297825/tim",
        ]}
      />
      <ItemListJsonLd
        name="Free developer tools by Tim"
        description="A collection of free browser-based tools for developers."
        items={featuredToolLinks.map(({ title, href, description }) => ({
          name: title,
          url: `${siteUrl}${href}`,
          description,
        }))}
      />
      <div className="maker-profile-background flex min-h-full items-center justify-center px-5 py-20">
        <Profile {...getProfile()} />
      </div>
    </>
  )
}
