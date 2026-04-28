import { removeBackground } from "@imgly/background-removal"

export type WorkerRequest = { type: "process"; file: File }

export type WorkerEvent =
  | { type: "progress"; key: string; current: number; total: number }
  | { type: "done"; blob: Blob }
  | { type: "error"; message: string }

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { file } = event.data

  try {
    const resultBlob = await removeBackground(file, {
      output: { format: "image/png" },
      progress: (key: string, current: number, total: number) => {
        self.postMessage({ type: "progress", key, current, total })
      },
    })

    self.postMessage({ type: "done", blob: resultBlob })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred."
    self.postMessage({ type: "error", message })
  }
}
