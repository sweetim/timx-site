import { useCallback, useRef } from "react"
import type { SourceImage } from "../image-editor"

type UseSourceFileInputOptions = {
  onAddSourceImages?: ((files: File[]) => Promise<SourceImage[]>) | undefined
}

function useSourceFileInput({ onAddSourceImages }: UseSourceFileInputOptions) {
  const sourceFileInputRef = useRef<HTMLInputElement>(null)

  const handleSourceFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      if (files.length > 0) void onAddSourceImages?.(files)
      e.target.value = ""
    },
    [onAddSourceImages],
  )

  return { sourceFileInputRef, handleSourceFileInput }
}

export default useSourceFileInput
