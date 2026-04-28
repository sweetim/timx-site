import { useEffect, useRef } from "react"

type UseWorkspaceResetOptions = {
  workspaceResetKey: number
  onReset: () => void
}

function useWorkspaceReset({
  workspaceResetKey,
  onReset,
}: UseWorkspaceResetOptions) {
  const handledKeyRef = useRef(workspaceResetKey)

  useEffect(() => {
    if (handledKeyRef.current === workspaceResetKey) return
    handledKeyRef.current = workspaceResetKey
    onReset()
  }, [workspaceResetKey, onReset])

  return { handledKeyRef }
}

export default useWorkspaceReset
