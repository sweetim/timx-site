import { useCallback, useEffect, useRef, useState } from "react"
import type { RecentFile } from "./types"

type StoredHandle = {
  name: string
  size: number
  lastOpened: number
  handle: FileSystemFileHandle
}

const DB_NAME = "db-explorer-handles"
const STORE_NAME = "handles"
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "name" })
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

async function deleteHandle(name: string): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function getHandleEntry(name: string): Promise<StoredHandle | null> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(name)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

async function touchHandle(name: string): Promise<void> {
  const stored = await getHandleEntry(name)
  if (!stored) return
  const file = await stored.handle.getFile()
  await putHandle({ ...stored, size: file.size, lastOpened: Date.now() })
}

function toRecentFiles(handles: StoredHandle[]): RecentFile[] {
  return handles
    .map(({ name, size, lastOpened }) => ({ name, size, lastOpened }))
    .sort((a, b) => b.lastOpened - a.lastOpened)
}

type HandleWithPermission = FileSystemFileHandle & {
  requestPermission: (desc: { mode: "read" }) => Promise<PermissionState>
}

export async function loadFileFromHandle(name: string): Promise<File | null> {
  const stored = await getHandleEntry(name)
  if (!stored) return null
  const perm = await (stored.handle as HandleWithPermission).requestPermission({
    mode: "read",
  })
  if (perm !== "granted") return null
  await touchHandle(name)
  return stored.handle.getFile()
}

export function useFileHandles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])
  const loadingRef = useRef(false)

  const refreshFiles = useCallback(async () => {
    try {
      const handles = await getAllHandles()
      setRecentFiles(toRecentFiles(handles))
    } catch {}
  }, [])

  useEffect(() => {
    if (loadingRef.current) return
    loadingRef.current = true
    getAllHandles()
      .then((handles) => setRecentFiles(toRecentFiles(handles)))
      .catch(() => {})
  }, [])

  const addHandle = useCallback(
    async (handle: FileSystemFileHandle) => {
      const file = await handle.getFile()
      await putHandle({
        name: handle.name,
        size: file.size,
        lastOpened: Date.now(),
        handle,
      })
      await refreshFiles()
    },
    [refreshFiles],
  )

  const removeHandle = useCallback(
    async (name: string) => {
      await deleteHandle(name)
      await refreshFiles()
    },
    [refreshFiles],
  )

  return { recentFiles, addHandle, removeHandle, refreshFiles }
}
