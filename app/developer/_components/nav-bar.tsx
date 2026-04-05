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
        className="shrink-0 hover:bg-neutral-300 rounded-full"
      >
        <Image
          src="/favicon.ico"
          alt="timx"
          width={20}
          height={20}
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
      <div className="w-px h-4 bg-dev-border" />
      <div className="flex gap-1 overflow-x-auto">
        {tools.map((tool) => {
          const href = `/developer/${tool.slug}`
          const isActive = pathname === href
          return (
            <Link
              key={tool.slug}
              href={href}
              className={classNames(
                "text-sm px-2.5 py-1 rounded transition-colors whitespace-nowrap",
                isActive
                  ? "bg-dev-border text-dev-text"
                  : "text-dev-text-secondary hover:text-dev-text hover:bg-dev-inset",
              )}
            >
              {tool.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default NavBar
