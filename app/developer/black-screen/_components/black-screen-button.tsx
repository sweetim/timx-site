"use client"

import { useCallback, useEffect, useState } from "react"

export default function BlackScreenButton() {
  const [active, setActive] = useState(false)

  const enter = useCallback(async () => {
    setActive(true)
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // fullscreen not supported or blocked — still show black
    }
  }, [])

  const exit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    setActive(false)
  }, [])

  useEffect(() => {
    if (!active) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit()
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setActive(false)
    }

    document.addEventListener("keydown", handleKey)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("keydown", handleKey)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [active, exit])

  if (!active) {
    return (
      <button
        type="button"
        onClick={enter}
        className="px-6 py-3 rounded-md bg-dev-text text-dev-canvas text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Enter Full Black Screen
      </button>
    )
  }

  return (
    <button
      type="button"
      className="fixed inset-0 z-50 bg-black cursor-none"
      onClick={exit}
      aria-label="Exit black screen"
    />
  )
}
