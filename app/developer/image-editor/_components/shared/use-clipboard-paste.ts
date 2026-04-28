import { useEffect } from "react"
import type { SourceImage } from "../image-editor"

type UseClipboardPasteOptions = {
  isActive: boolean
  onFile?: ((file: File) => void) | undefined
  onFiles?: ((files: File[]) => void) | undefined
  onAddSourceImages?: ((files: File[]) => Promise<SourceImage[]>) | undefined
}

function useClipboardPaste({
  isActive,
  onFile,
  onFiles,
  onAddSourceImages,
}: UseClipboardPasteOptions) {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isActive) return
      const files = Array.from(e.clipboardData?.files ?? []).filter((file) =>
        file.type.startsWith("image/"),
      )
      if (files.length === 0) return
      e.preventDefault()
      if (onFiles) onFiles(files)
      else onFile?.(files[0])
      if (onAddSourceImages) void onAddSourceImages(files)
    }
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isActive, onFile, onFiles, onAddSourceImages])
}

export default useClipboardPaste
