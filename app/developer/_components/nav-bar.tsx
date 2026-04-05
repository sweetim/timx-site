"use client"

import classNames from "classnames"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { tools } from "../_lib/tools"

const NavBar = () => {
  const pathname = usePathname()
  const isHome = pathname === "/developer"

  return (
    <nav className="flex items-center gap-6 px-4 py-2.5 border-b border-neutral-800 bg-neutral-950">
      <Link
        href="/developer"
        className={classNames(
          "text-sm font-medium transition-colors shrink-0",
          isHome
            ? "text-neutral-100"
            : "text-neutral-500 hover:text-neutral-300",
        )}
      >
        Developer Tools
      </Link>
      <div className="w-px h-4 bg-neutral-800" />
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
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900",
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
