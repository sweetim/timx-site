import { useCallback, useState } from "react"
import type { RecentFile } from "./types"
import { MAX_RECENT, STORAGE_KEY } from "./types"

function getRecentFiles(): RecentFile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(getRecentFiles)

  const addRecentFile = useCallback((name: string, size: number) => {
    const files = getRecentFiles().filter((f) => f.name !== name)
    files.unshift({ name, size, lastOpened: Date.now() })
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(files.slice(0, MAX_RECENT)),
    )
    setRecentFiles(getRecentFiles())
  }, [])

  const removeRecentFile = useCallback((name: string) => {
    const files = getRecentFiles().filter((f) => f.name !== name)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
    setRecentFiles(getRecentFiles())
  }, [])

  return { recentFiles, addRecentFile, removeRecentFile }
}
