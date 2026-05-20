import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, Sparkles } from "lucide-react"

import ProfileLink, { type ProfileLinkProps } from "./ProfileLink"

export type ProfileProps = {
  title: string
  description: string
  summary: string
  location: string
  imageUrl: string
  linkUrl: ProfileLinkProps[]
  profileActions: ProfileAction[]
  craftAreas: string[]
  featuredToolLinks: ProfileFeaturedLink[]
  currentlyBuilding: string
  sidePanelStats: [string, string][]
}

export type ProfileAction = {
  label: string
  href: string
  isExternal?: boolean
}

export type ProfileFeaturedLink = {
  title: string
  description: string
  href: string
  icon?: LucideIcon
}

function renderProfileAction(action: ProfileAction, index: number) {
  const actionClassName =
    index === 0
      ? "inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-3 focus:ring-blue-300"
      : "inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-3 focus:ring-blue-300"

  const content = (
    <>
      {action.label}
      <ArrowUpRight
        className="ml-2 h-4 w-4"
        aria-hidden="true"
      />
    </>
  )

  if (action.isExternal) {
    return (
      <a
        key={action.href}
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={actionClassName}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      key={action.href}
      href={action.href}
      className={actionClassName}
    >
      {content}
    </Link>
  )
}

const Profile: FC<ProfileProps> = (props) => {
  const renderLinkUrl = props.linkUrl.map((link, i) => (
    <ProfileLink
      key={`${link.imageUrl}`}
      index={i}
      {...link}
    />
  ))

  return (
    <div className="relative mx-auto w-full max-w-6xl text-slate-950">
      <div
        className="maker-profile-grid pointer-events-none absolute inset-x-0 -top-10 h-80"
        aria-hidden="true"
      />
      <section className="relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white/70 px-5 py-7 shadow-2xl shadow-slate-900/10 backdrop-blur sm:px-8 sm:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 lg:px-10 lg:py-12">
        <div className="relative z-10">
          <p className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-sm text-slate-700 shadow-sm">
            <Sparkles
              className="mr-2 h-4 w-4 text-blue-600"
              aria-hidden="true"
            />
            Software maker in Tokyo
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-5xl font-bold leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
            {props.title}
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-900 sm:text-2xl sm:leading-9">
            {props.description}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            {props.summary}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {props.profileActions.map(renderProfileAction)}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {props.craftAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-slate-300 bg-white/75 px-3 py-1 text-sm text-slate-700 shadow-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
        <div className="relative z-10 mt-10 lg:mt-0">
          <div
            className="absolute -inset-4 rounded-full bg-blue-200/50 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative rounded-3xl bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/25">
            <div className="flex justify-center">
              <Image
                className="blob-splash content-center border-4 border-white/15 p-1.5"
                src={props.imageUrl}
                width={176}
                height={176}
                alt="Tim — developer portrait"
                sizes="176px"
                preload
              />
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Currently building</p>
              <p className="mt-2 text-xl leading-8">
                {props.currentlyBuilding}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {props.sidePanelStats.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <span className="block text-slate-400">{label}</span>
                  <span className="mt-1 block text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-5 rounded-3xl border border-slate-900/10 bg-white/60 p-5 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Connect with me
        </p>
        <div className="grid grid-cols-5 gap-3 sm:gap-5">{renderLinkUrl}</div>
      </div>

      <section
        className="mt-10 text-left"
        aria-labelledby="developer-tools-heading"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Selected work
            </p>
            <h2
              id="developer-tools-heading"
              className="mt-2 text-3xl text-slate-950 sm:text-4xl"
            >
              Things I&apos;ve Built
            </h2>
          </div>
          <Link
            href="/developer"
            className="inline-flex items-center self-start rounded-full border border-slate-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-3 focus:ring-blue-300 sm:self-auto"
          >
            View all tools
            <ArrowUpRight
              className="ml-2 h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
          A few examples of the practical, browser-based tools I build to
          make technical work faster and calmer.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {props.featuredToolLinks.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-3xl border border-slate-900/10 bg-white/75 p-5 text-slate-950 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10 focus:outline-none focus:ring-3 focus:ring-blue-300"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 transition group-hover:scale-105">
                    {Icon && (
                      <Icon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-950"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-5 block text-xl font-semibold">
                  {link.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-slate-700">
                  {link.description}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Profile
