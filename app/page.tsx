import type { Metadata } from "next"
import { PersonJsonLd } from "@/app/_components/json-ld"
import Profile, { type ProfileProps } from "@/app/_components/Profile"

export const metadata: Metadata = {
  title: "Tim — Software Developer",
  description: "Robotics, AI, and blockchain developer based in Tokyo",
  alternates: { canonical: "https://timx.co" },
}

function getProfile(): ProfileProps {
  return {
    title: "tim",
    description: "i turn ideas into reality",
    location: "tokyo, japan",
    imageUrl: "https://avatars.githubusercontent.com/u/6851767?v=4",
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
  }
}

export default function Home() {
  return (
    <>
      <PersonJsonLd
        name="Tim"
        url="https://timx.co"
        jobTitle="Software Developer"
        description="Developer based in Tokyo building free browser-based tools"
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
          "https://www.linkedin.com/in/swee-tim-ho-8a378048",
          "https://stackoverflow.com/users/2297825/tim",
        ]}
      />
      <div className="flex justify-center items-center h-full bg-neutral-200">
        <Profile {...getProfile()} />
      </div>
    </>
  )
}
