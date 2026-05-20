import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowUpRight,
  Blocks,
  Bot,
  BrainCircuit,
  Cloud,
  Cpu,
  MapPin,
  Smartphone,
} from "lucide-react"

import ProfileLink, { type ProfileLinkProps } from "./ProfileLink"

export type ProfileProps = {
  title: string
  description: string
  summary: string
  location: string
  imageUrl: string
  linkUrl: ProfileLinkProps[]
  craftAreas: ProfileCraftArea[]
  featuredToolLinks: ProfileFeaturedLink[]
}

export type ProfileCraftArea =
  | "Embedded"
  | "Cloud"
  | "Mobile"
  | "AI"
  | "Robotics"
  | "Blockchain"

export type ProfileFeaturedLink = {
  title: string
  description: string
  href: string
  icon?: LucideIcon
}

const craftAreaIcons = {
  Embedded: Cpu,
  Cloud,
  Mobile: Smartphone,
  AI: BrainCircuit,
  Robotics: Bot,
  Blockchain: Blocks,
} satisfies Record<ProfileCraftArea, LucideIcon>

const Profile: FC<ProfileProps> = (props) => {
  return (
    <div className="mx-auto w-full max-w-2xl text-slate-950">
      <div className="flex justify-center">
        <Image
          className="rounded-full border border-slate-200 bg-white shadow-sm"
          src={props.imageUrl}
          width={96}
          height={96}
          alt="Tim — developer portrait"
          sizes="96px"
          preload
        />
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-balance text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
          {props.title}
        </h1>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-400">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {props.location}
        </p>
        <p className="mt-3 text-lg leading-8 text-slate-700">
          {props.description}
        </p>
        <p className="mt-2 text-base leading-7 text-slate-500">
          {props.summary}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {props.craftAreas.map((area) => {
          const Icon = craftAreaIcons[area]

          return (
            <span
              key={area}
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center text-xs font-medium text-slate-500 shadow-sm"
            >
              <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
              {area}
            </span>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Connect
        </p>
        <div className="flex gap-3">
          {props.linkUrl.map((link, i) => (
            <ProfileLink key={link.imageUrl} index={i} {...link} />
          ))}
        </div>
      </div>

      <section className="mt-12" aria-labelledby="developer-tools-heading">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Selected work
          </p>
          <h2
            id="developer-tools-heading"
            className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl"
          >
            Things I&apos;ve Built
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            A few of the practical, browser-based tools I build to make
            technical work faster and calmer.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {props.featuredToolLinks.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:scale-105">
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-slate-300 transition group-hover:text-slate-600"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-4 block text-lg font-semibold">
                  {link.title}
                </span>
                <span className="profile-tool-description mt-1 block text-sm leading-6 text-slate-500">
                  {link.description}
                </span>
              </Link>
            )
          })}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/developer"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            View all tools
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Profile
