"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"

function getRandomChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
}

type ScrambleTextProps = {
  text: string
  className?: string
}

export default function ScrambleText({ text, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text)
  const [resolved, setResolved] = useState<Set<number>>(new Set())

  useEffect(() => {
    const chars = text.split("")
    const center = Math.floor(chars.length / 2)
    const resolveAt = chars.map(
      (_, i) => 1000 + Math.abs(i - center) * 150,
    )

    const current = chars.map(() => getRandomChar())
    const resolvedSet = new Set<number>()
    const start = performance.now()
    let rafId: number

    setDisplay(current.join(""))
    setResolved(new Set())

    const tick = () => {
      const elapsed = performance.now() - start
      let changed = false

      for (let i = 0; i < chars.length; i++) {
        if (resolvedSet.has(i)) continue
        if (elapsed >= resolveAt[i]) {
          current[i] = chars[i]
          resolvedSet.add(i)
          changed = true
        } else {
          current[i] = getRandomChar()
          changed = true
        }
      }

      if (changed) {
        setDisplay(current.join(""))
        setResolved(new Set(resolvedSet))
      }

      if (resolvedSet.size < chars.length) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [text])

  return (
    <span className={className} aria-hidden="true">
      {display.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ whiteSpace: "pre" }}
          animate={
            resolved.has(i)
              ? { opacity: 1, y: 0 }
              : { opacity: 0.35, y: 2 }
          }
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}
