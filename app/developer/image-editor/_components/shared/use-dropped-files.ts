import { useEffect } from "react"

type UseDroppedFilesOptions = {
  isActive: boolean
  droppedFiles: File[] | undefined
  droppedFilesKey: number | undefined
  onLoad: (files: File[]) => void
}

function useDroppedFiles({
  isActive,
  droppedFiles,
  droppedFilesKey,
  onLoad,
}: UseDroppedFilesOptions) {
  useEffect(() => {
    if (!isActive) return
    if (!droppedFiles || droppedFiles.length === 0) return
    onLoad(droppedFiles)
  }, [isActive, droppedFiles, droppedFilesKey, onLoad])
}

export default useDroppedFiles
