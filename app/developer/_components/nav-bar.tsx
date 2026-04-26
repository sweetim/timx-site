"use client"

import classNames from "classnames"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { tools } from "../_lib/tools"

const NavBar = () => {
  const pathname = usePathname()
  const isHome = pathname === "/developer"

  return (
    <nav className="flex items-center gap-6 px-4 py-2.5 border-b border-dev-border bg-dev-canvas">
      <Link
        href="/"
        className="shrink-0 transition-opacity hover:opacity-80"
      >
        <Image
          src="/timx-logo.png"
          alt="timx"
          width={28}
          height={28}
        />
      </Link>
      <div className="w-px h-4 bg-dev-border" />
      <Link
        href="/developer"
        className={classNames(
          "text-sm font-medium transition-colors shrink-0",
          isHome
            ? "text-dev-text"
            : "text-dev-text-secondary hover:text-dev-text",
        )}
      >
        Developer Tools
      </Link>
      <div className="w-px h-4 bg-dev-border shrink-0" />
      <div
        className="no-scrollbar flex items-center gap-1 overflow-x-auto"
        onWheel={(e) => {
          const target = e.currentTarget
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            target.scrollLeft += e.deltaY
            e.preventDefault()
          }
        }}
      >
        {tools.map((tool) => {
          const href = `/developer/${tool.slug}`
          const isActive = pathname === href
          const Icon = tool.icon
          return (
            <Link
              key={tool.slug}
              href={href}
              className={classNames(
                "flex items-center justify-center gap-1.5 text-sm px-2.5 py-1 rounded transition-colors",
                isActive
                  ? "bg-dev-border text-dev-text"
                  : "text-dev-text-secondary hover:text-dev-text hover:bg-dev-inset",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="whitespace-nowrap">{tool.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default NavBar
