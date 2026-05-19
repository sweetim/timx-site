import type { RecentFile } from "../_components/types"

const RECENT_FILES_KEY = "openapi-viewer-recent-files"
const MAX_RECENT_FILES = 5

type RecentFileWithLabel = RecentFile & { relativeTime: string }

function loadRecentFiles(): RecentFile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentFiles(files: RecentFile[]) {
  try {
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files))
  } catch {
    // localStorage might be full; silently ignore
  }
}

function addRecentFile(entry: RecentFile) {
  const files = loadRecentFiles().filter((f) => f.fileName !== entry.fileName)
  files.unshift(entry)
  saveRecentFiles(files.slice(0, MAX_RECENT_FILES))
}

function removeRecentFile(fileName: string) {
  saveRecentFiles(loadRecentFiles().filter((f) => f.fileName !== fileName))
}

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

function toRecentFilesWithLabels(files: RecentFile[]): RecentFileWithLabel[] {
  const now = Date.now()
  return files.map((f) => ({
    ...f,
    relativeTime: computeRelativeTime(f.openedAt, now),
  }))
}

function loadRecentFilesWithLabels(): RecentFileWithLabel[] {
  return toRecentFilesWithLabels(loadRecentFiles())
}

function refreshRecentFiles(): RecentFileWithLabel[] {
  return loadRecentFilesWithLabels()
}

export type { RecentFileWithLabel }
export {
  addRecentFile,
  loadRecentFilesWithLabels,
  refreshRecentFiles,
  removeRecentFile,
}
