import Profile, { ProfileProps } from "@/app/modules/home/Profile"

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
      },
      {
        imageUrl: "/github.svg",
        linkUrl: "https://github.com/sweetim",
      },
      {
        imageUrl: "/docker.svg",
        linkUrl: "https://hub.docker.com/r/timx/",
      },
      {
        imageUrl: "/linkedin.svg",
        linkUrl: "https://www.linkedin.com/in/swee-tim-ho-8a378048",
      },
      {
        imageUrl: "/stackoverflow.svg",
        linkUrl: "http://stackoverflow.com/users/2297825/tim",
        isRounded: false
      },
    ],
  }
}

export default function Home() {
  return (
    <div className="flex justify-center items-center h-full bg-neutral-200">
      <Profile {...getProfile()} />
    </div>
  )
}
