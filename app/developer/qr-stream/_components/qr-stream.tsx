"use client"

import clsx from "clsx"
import { FileDown, QrCode } from "lucide-react"
import { type FC, useState } from "react"
import { match } from "ts-pattern"
import QrStreamDecoder from "./decoder"
import QrStreamEncoder from "./encoder"

type QrStreamMode = "encode" | "decode"

const QrStream: FC = () => {
  const [mode, setMode] = useState<QrStreamMode>("encode")

  return (
    <div className="flex min-h-full flex-col bg-dev-canvas text-dev-text">
      <div className="flex items-center justify-between gap-4 border-b border-dev-border px-4 py-2">
        <div className="min-w-0 shrink">
          <h1 className="flex items-center gap-1.5 text-sm font-medium leading-relaxed text-dev-text truncate">
            <QrCode className="size-4 shrink-0" />
            QR Stream
          </h1>
          <p className="hidden sm:block text-xs leading-relaxed text-dev-text-secondary truncate">
            Encode files into a playable QR code stream, or scan the stream with
            a camera or video to rebuild the file.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className={clsx(
              "inline-flex items-center gap-1.5 rounded p-1.5 text-sm transition-colors cursor-pointer sm:px-3 sm:py-1",
              mode === "encode"
                ? "bg-dev-accent-blue text-white"
                : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
            )}
            onClick={() => setMode("encode")}
            aria-pressed={mode === "encode"}
          >
            <FileDown size={14} />
            <span className="hidden sm:inline">Encode</span>
          </button>
          <button
            type="button"
            className={clsx(
              "inline-flex items-center gap-1.5 rounded p-1.5 text-sm transition-colors cursor-pointer sm:px-3 sm:py-1",
              mode === "decode"
                ? "bg-dev-accent-blue text-white"
                : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
            )}
            onClick={() => setMode("decode")}
            aria-pressed={mode === "decode"}
          >
            <QrCode size={14} />
            <span className="hidden sm:inline">Decode</span>
          </button>
        </div>
      </div>
      {match(mode)
        .with("encode", () => <QrStreamEncoder key="encode" />)
        .with("decode", () => <QrStreamDecoder key="decode" />)
        .exhaustive()}
    </div>
  )
}

export default QrStream
