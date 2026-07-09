"use client"

import dynamic from "next/dynamic"

const BitwiseVisualizer = dynamic(
  () => import("./bitwise-visualizer-impl"),
  { ssr: false },
)

export default BitwiseVisualizer
