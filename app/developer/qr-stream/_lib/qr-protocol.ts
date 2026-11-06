export const CHUNK_SIZE = 700
export const DEFAULT_FPS = 4
export const MIN_FPS = 1
export const MAX_FPS = 10
export const QR_CANVAS_SIZE = 512

const BASE64_CHUNK = 0x8000

type HeaderFrame = {
  v: 1
  t: number
  n: string
  m: string
  s: number
}

type DataFrame = {
  i: number
  d: string
}

export type QrStreamHeader = {
  totalFrames: number
  name: string
  mimeType: string
  size: number
}

export type ParsedQrFrame =
  | { kind: "header"; header: QrStreamHeader }
  | { kind: "data"; index: number; data: string }

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BASE64_CHUNK))
  }
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function countFrames(fileSize: number): number {
  return Math.max(1, Math.ceil(fileSize / CHUNK_SIZE))
}

export function buildFrames(
  bytes: Uint8Array,
  name: string,
  mimeType: string,
): string[] {
  const totalFrames = countFrames(bytes.length)
  const header: HeaderFrame = {
    v: 1,
    t: totalFrames,
    n: name,
    m: mimeType,
    s: bytes.length,
  }
  const frames: string[] = [JSON.stringify(header)]
  for (let i = 0; i < totalFrames; i++) {
    const frame: DataFrame = {
      i: i + 1,
      d: bytesToBase64(bytes.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)),
    }
    frames.push(JSON.stringify(frame))
  }
  return frames
}

export function parseQrFrame(text: string): ParsedQrFrame | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof parsed !== "object" || parsed === null) return null
  const frame = parsed as Record<string, unknown>
  if (
    frame.v === 1
    && typeof frame.t === "number"
    && typeof frame.n === "string"
    && typeof frame.m === "string"
    && typeof frame.s === "number"
  ) {
    return {
      kind: "header",
      header: {
        totalFrames: frame.t,
        name: frame.n,
        mimeType: frame.m,
        size: frame.s,
      },
    }
  }
  if (typeof frame.i === "number" && typeof frame.d === "string") {
    return { kind: "data", index: frame.i, data: frame.d }
  }
  return null
}

export function assembleFile(
  header: QrStreamHeader,
  chunks: Map<number, string>,
): Blob | null {
  const byteCount = Array.from(chunks.keys()).reduce((sum, index) => {
    const data = chunks.get(index)
    return sum + (data ? base64ToBytes(data).length : 0)
  }, 0)
  if (byteCount !== header.size) return null
  const parts = new Array<Uint8Array<ArrayBuffer>>(header.totalFrames)
  for (let i = 1; i <= header.totalFrames; i++) {
    const data = chunks.get(i)
    if (!data) return null
    parts[i - 1] = base64ToBytes(data)
  }
  return new Blob(parts, {
    type: header.mimeType || "application/octet-stream",
  })
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.ceil(seconds % 60)
  return `${minutes}m ${remaining}s`
}
