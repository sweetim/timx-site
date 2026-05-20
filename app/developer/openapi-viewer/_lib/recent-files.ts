import type { RecentHandleFile } from "./use-file-handle"

const MAX_RECENT_FILES = 5

type RecentFileWithLabel = RecentHandleFile & { relativeTime: string }

function computeRelativeTime(timestamp: number, now: number): string {
  const seconds = Math.floor((now - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function toRecentFilesWithLabels(
  files: RecentHandleFile[],
): RecentFileWithLabel[] {
  const now = Date.now()
  return files
    .slice(0, MAX_RECENT_FILES)
    .map((f) => ({
      ...f,
      relativeTime: computeRelativeTime(f.lastOpened, now),
    }))
}

export type { RecentFileWithLabel }
export { toRecentFilesWithLabels }
