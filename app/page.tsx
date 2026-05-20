import type { Metadata } from "next"
import { ItemListJsonLd, PersonJsonLd } from "@/app/_components/json-ld"
import Profile, {
  type ProfileFeaturedLink,
  type ProfileProps,
} from "@/app/_components/Profile"
import opengraph from "@/app/opengraph.jpg"
import { tools } from "@/app/developer/_lib/tools"

const siteUrl = "https://timx.co"
const homepageTitle = "Tim - Software Maker in Tokyo"
const homepageDescription =
  "Tim is a software maker in Tokyo building practical tools and systems for the web, artificial intelligence, robotics, blockchain, and developer workflows."

const featuredToolSlugs = new Set([
  "json-viewer",
  "image-editor",
  "db-explorer",
  "openapi-viewer",
])

function getFeaturedToolLinks(): ProfileFeaturedLink[] {
  return tools
    .filter(({ slug }) => featuredToolSlugs.has(slug))
    .map(({ name, slug, description, icon }) => ({
      title: name,
      description,
      href: `/developer/${slug}`,
      icon,
    }))
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
      "I build practical software for the web, artificial intelligence, robotics, and developer workflows.",
    summary:
      "My work favors simple interfaces, local-first browser tools, and systems that turn technical ideas into useful products.",
    location: "Tokyo, Japan",
    imageUrl: "https://avatars.githubusercontent.com/u/6851767?v=4",
    craftAreas: [
      "Web applications",
      "Artificial intelligence",
      "Robotics",
      "Blockchain",
      "Developer tools",
    ],
    linkUrl: [
      {
        imageUrl: "/gitlab.svg",
        linkUrl: "https://gitlab.com/users/hosweetim/projects",
        label: "GitLab",
      },
      {
        imageUrl: "/github.svg",
        linkUrl: "https://github.com/sweetim",
        label: "GitHub",
      },
      {
        imageUrl: "/docker.svg",
        linkUrl: "https://hub.docker.com/r/timx/",
        label: "Docker Hub",
      },
      {
        imageUrl: "/linkedin.svg",
        linkUrl: "https://www.linkedin.com/in/swee-tim-ho-8a378048",
        label: "LinkedIn",
      },
      {
        imageUrl: "/stackoverflow.svg",
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
        image="https://avatars.githubusercontent.com/u/6851767?v=4"
        knowsAbout={[
          "Developer tools",
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
