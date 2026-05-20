import { useCallback, useEffect, useRef, useState } from "react"

type StoredHandle = {
  fileName: string
  title: string
  version: string
  lastOpened: number
  handle: FileSystemFileHandle
}

const DB_NAME = "openapi-viewer-handles"
const STORE_NAME = "handles"
const DB_VERSION = 1
const LEGACY_RECENT_FILES_KEY = "openapi-viewer-recent-files"
const MAX_RECENT_FILES = 5

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "fileName" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

let dbPromise: Promise<IDBDatabase> | null = null

function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDb()
  }
  return dbPromise
}

async function getAllHandles(): Promise<StoredHandle[]> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as StoredHandle[])
    request.onerror = () => reject(request.error)
  })
}

async function putHandle(entry: StoredHandle): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(entry)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function deleteHandle(fileName: string): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(fileName)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function pruneHandles(): Promise<void> {
  const handles = await getAllHandles()
  const staleHandles = handles
    .sort((a, b) => b.lastOpened - a.lastOpened)
    .slice(MAX_RECENT_FILES)
  await Promise.all(staleHandles.map((handle) => deleteHandle(handle.fileName)))
}

function removeLegacyCachedRecentFiles() {
  try {
    localStorage.removeItem(LEGACY_RECENT_FILES_KEY)
  } catch {}
}

async function getHandleEntry(
  fileName: string,
): Promise<StoredHandle | null> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(fileName)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function updateHandleMetadata(
  fileName: string,
  title: string,
  version: string,
): Promise<void> {
  const stored = await getHandleEntry(fileName)
  if (!stored) return
  await putHandle({ ...stored, title, version, lastOpened: Date.now() })
}

type HandleWithPermission = FileSystemFileHandle & {
  requestPermission: (desc: { mode: "read" }) => Promise<PermissionState>
}

export type RecentHandleFile = {
  fileName: string
  title: string
  version: string
  lastOpened: number
}

export async function loadFileFromHandle(
  fileName: string,
): Promise<File | null> {
  const stored = await getHandleEntry(fileName)
  if (!stored) return null
  const perm = await (stored.handle as HandleWithPermission).requestPermission({
    mode: "read",
  })
  if (perm !== "granted") return null
  return stored.handle.getFile()
}

export function useFileHandles() {
  const [recentFiles, setRecentFiles] = useState<RecentHandleFile[]>([])
  const loadingRef = useRef(false)

  const refreshFiles = useCallback(async () => {
    try {
      const handles = await getAllHandles()
      setRecentFiles(
        handles
          .map(({ fileName, title, version, lastOpened }) => ({
            fileName,
            title,
            version,
            lastOpened,
          }))
          .sort((a, b) => b.lastOpened - a.lastOpened),
      )
    } catch {}
  }, [])

  useEffect(() => {
    if (loadingRef.current) return
    loadingRef.current = true
    removeLegacyCachedRecentFiles()
    pruneHandles()
      .catch(() => {})
      .then(getAllHandles)
      .then((handles) =>
        setRecentFiles(
          handles
            .map(({ fileName, title, version, lastOpened }) => ({
              fileName,
              title,
              version,
              lastOpened,
            }))
            .sort((a, b) => b.lastOpened - a.lastOpened),
        ),
      )
      .catch(() => {})
  }, [])

  const addHandle = useCallback(
    async (
      handle: FileSystemFileHandle,
      title: string,
      version: string,
    ) => {
      await putHandle({
        fileName: handle.name,
        title,
        version,
        lastOpened: Date.now(),
        handle,
      })
      await pruneHandles()
      await refreshFiles()
    },
    [refreshFiles],
  )

  const removeHandle = useCallback(
    async (fileName: string) => {
      await deleteHandle(fileName)
      await refreshFiles()
    },
    [refreshFiles],
  )

  return { recentFiles, addHandle, removeHandle, refreshFiles }
}
