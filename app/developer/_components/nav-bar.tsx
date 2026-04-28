"use client"

import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import { tools } from "../_lib/tools"

const NavBar = () => {
  const pathname = usePathname()
  const isHome = pathname === "/developer"
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
        e.preventDefault()
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [])

  return (
    <nav className="flex items-center gap-6 px-4 py-2.5 border-b border-dev-border bg-dev-canvas">
      <Link
        href={isHome ? "/" : "/developer"}
        className="shrink-0 transition-opacity hover:opacity-80"
      >
        <Image
          src="/timx-logo.png"
          alt="timx"
          width={28}
          height={28}
        />
      </Link>
      <div className="w-px h-4 bg-dev-border shrink-0" />
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-center gap-1 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tools.map((tool) => {
          const href = `/developer/${tool.slug}`
          const isActive = pathname === href
          const Icon = tool.icon
          return (
            <Link
              key={tool.slug}
              href={href}
              className={clsx(
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
