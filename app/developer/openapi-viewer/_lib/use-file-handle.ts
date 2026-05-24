import { useCallback, useEffect, useRef, useState } from "react"

type StoredHandle = {
  fileName: string
  title: string
  version: string
  lastOpened: number
  handle: FileSystemFileHandle
}

type StoredPastedSpec = {
  fileName: string
  title: string
  version: string
  lastOpened: number
  rawContent: string
}

const DB_NAME = "openapi-viewer-handles"
const STORE_NAME = "handles"
const PASTED_STORE_NAME = "pasted-specs"
const DB_VERSION = 2
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
      if (!db.objectStoreNames.contains(PASTED_STORE_NAME)) {
        db.createObjectStore(PASTED_STORE_NAME, { keyPath: "fileName" })
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

async function getAllPastedSpecs(): Promise<StoredPastedSpec[]> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PASTED_STORE_NAME, "readonly")
    const store = tx.objectStore(PASTED_STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as StoredPastedSpec[])
    request.onerror = () => reject(request.error)
  })
}

async function putPastedSpec(entry: StoredPastedSpec): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PASTED_STORE_NAME, "readwrite")
    const store = tx.objectStore(PASTED_STORE_NAME)
    const request = store.put(entry)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function deletePastedSpec(fileName: string): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PASTED_STORE_NAME, "readwrite")
    const store = tx.objectStore(PASTED_STORE_NAME)
    const request = store.delete(fileName)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function getPastedSpec(
  fileName: string,
): Promise<StoredPastedSpec | null> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PASTED_STORE_NAME, "readonly")
    const store = tx.objectStore(PASTED_STORE_NAME)
    const request = store.get(fileName)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

async function prunePastedSpecs(): Promise<void> {
  const specs = await getAllPastedSpecs()
  const staleSpecs = specs
    .sort((a, b) => b.lastOpened - a.lastOpened)
    .slice(MAX_RECENT_FILES)
  await Promise.all(staleSpecs.map((s) => deletePastedSpec(s.fileName)))
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
  source: "file" | "paste"
}

export async function loadFileFromHandle(
  fileName: string,
): Promise<{ file: File; handle: FileSystemFileHandle } | null> {
  const stored = await getHandleEntry(fileName)
  if (!stored) return null
  const perm = await (stored.handle as HandleWithPermission).requestPermission({
    mode: "read",
  })
  if (perm !== "granted") return null
  return { file: await stored.handle.getFile(), handle: stored.handle }
}

export async function loadPastedSpecContent(
  fileName: string,
): Promise<string | null> {
  const stored = await getPastedSpec(fileName)
  return stored?.rawContent ?? null
}

export async function updatePastedSpecMetadata(
  fileName: string,
  title: string,
  version: string,
): Promise<void> {
  const stored = await getPastedSpec(fileName)
  if (!stored) return
  await putPastedSpec({ ...stored, title, version, lastOpened: Date.now() })
}

export function useFileHandles() {
  const [recentFiles, setRecentFiles] = useState<RecentHandleFile[]>([])
  const loadingRef = useRef(false)

  const refreshFiles = useCallback(async () => {
    try {
      const [handles, pastedSpecs] = await Promise.all([
        getAllHandles(),
        getAllPastedSpecs(),
      ])
      const fileEntries: RecentHandleFile[] = handles.map(
        ({ fileName, title, version, lastOpened }) => ({
          fileName,
          title,
          version,
          lastOpened,
          source: "file" as const,
        }),
      )
      const pasteEntries: RecentHandleFile[] = pastedSpecs.map(
        ({ fileName, title, version, lastOpened }) => ({
          fileName,
          title,
          version,
          lastOpened,
          source: "paste" as const,
        }),
      )
      setRecentFiles(
        [...fileEntries, ...pasteEntries].sort(
          (a, b) => b.lastOpened - a.lastOpened,
        ),
      )
    } catch {}
  }, [])

  useEffect(() => {
    if (loadingRef.current) return
    loadingRef.current = true
    removeLegacyCachedRecentFiles()
    Promise.all([pruneHandles(), prunePastedSpecs()])
      .catch(() => {})
      .then(() => Promise.all([getAllHandles(), getAllPastedSpecs()]))
      .then(([handles, pastedSpecs]) => {
        const fileEntries: RecentHandleFile[] = handles.map(
          ({ fileName, title, version, lastOpened }) => ({
            fileName,
            title,
            version,
            lastOpened,
            source: "file" as const,
          }),
        )
        const pasteEntries: RecentHandleFile[] = pastedSpecs.map(
          ({ fileName, title, version, lastOpened }) => ({
            fileName,
            title,
            version,
            lastOpened,
            source: "paste" as const,
          }),
        )
        setRecentFiles(
          [...fileEntries, ...pasteEntries].sort(
            (a, b) => b.lastOpened - a.lastOpened,
          ),
        )
      })
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

  const addPastedSpec = useCallback(
    async (
      fileName: string,
      title: string,
      version: string,
      rawContent: string,
    ) => {
      await putPastedSpec({
        fileName,
        title,
        version,
        lastOpened: Date.now(),
        rawContent,
      })
      await prunePastedSpecs()
      await refreshFiles()
    },
    [refreshFiles],
  )

  const removeHandle = useCallback(
    async (fileName: string) => {
      await Promise.all([
        deleteHandle(fileName).catch(() => {}),
        deletePastedSpec(fileName).catch(() => {}),
      ])
      await refreshFiles()
    },
    [refreshFiles],
  )

  return { recentFiles, addHandle, addPastedSpec, removeHandle, refreshFiles }
}
