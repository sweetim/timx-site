import type { ReleaseFilter } from "./types"

export const RELEASE_OPTIONS: {
  label: string
  value: ReleaseFilter
  days: number | null
}[] = [
  { label: "All time", value: "all", days: null },
  { label: "Last 7 days", value: "7d", days: 7 },
  { label: "Last 30 days", value: "30d", days: 30 },
  { label: "Last 90 days", value: "90d", days: 90 },
  { label: "Last year", value: "1y", days: 365 },
]
