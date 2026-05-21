import { useEffect, useRef } from "react"

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
  const onLoadRef = useRef(onLoad)
  useEffect(() => { onLoadRef.current = onLoad }, [onLoad])

  useEffect(() => {
    if (!isActive) return
    if (!droppedFiles || droppedFiles.length === 0) return
    onLoadRef.current(droppedFiles)
  }, [isActive, droppedFiles, droppedFilesKey])
}

export default useDroppedFiles
