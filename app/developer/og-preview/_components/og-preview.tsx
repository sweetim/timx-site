"use client"

import classNames from "classnames"
import { type FC, useState } from "react"
import { match } from "ts-pattern"
import { AlertCircle, Loader2, Search } from "lucide-react"
import { fetchOgData, type OgData } from "../_lib/fetch-og"

type Status =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "loaded"; data: OgData }
  | { phase: "error"; message: string }

const OgPreview: FC = () => {
  const [url, setUrl] = useState("")
  const [status, setStatus] = useState<Status>({ phase: "idle" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setStatus({ phase: "loading" })
    const result = await fetchOgData(url.trim())
    if (result.ok) {
      setStatus({ phase: "loaded", data: result.data })
    } else {
      setStatus({ phase: "error", message: result.error })
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <h1 className="text-xl font-semibold text-dev-text mb-1">
        Open Graph Preview
      </h1>
      <p className="text-sm text-dev-text-secondary mb-6">
        Enter a URL to inspect its Open Graph and Twitter Card meta tags.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-3 py-2 rounded-md border border-dev-border bg-dev-inset text-dev-text placeholder:text-dev-text-secondary text-sm focus:outline-none focus:border-dev-link"
        />
        <button
          type="submit"
          disabled={status.phase === "loading"}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-dev-button hover:bg-dev-button-hover text-dev-text text-sm font-medium transition-colors disabled:opacity-50"
        >
          {status.phase === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Preview
        </button>
      </form>

      {match(status)
        .with({ phase: "loading" }, () => (
          <div className="flex items-center justify-center py-12 text-dev-text-secondary">
            <Loader2 className="size-5 animate-spin mr-2" />
            Fetching meta tags…
          </div>
        ))
        .with({ phase: "error" }, ({ message }) => (
          <div className="flex items-start gap-3 p-4 rounded-md border border-dev-accent-red/30 bg-dev-accent-red/10">
            <AlertCircle className="size-5 text-dev-accent-red shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-dev-accent-red">
                Failed to fetch
              </p>
              <p className="text-sm text-dev-text-secondary mt-1">{message}</p>
            </div>
          </div>
        ))
        .with({ phase: "loaded" }, ({ data }) => (
          <OgResult data={data} />
        ))
        .with({ phase: "idle" }, () => null)
        .exhaustive()}
    </div>
  )
}

type OgResultProps = {
  data: OgData
}

const FIELD_ORDER: { label: string; key: keyof OgData }[] = [
  { label: "URL", key: "url" },
  { label: "Title", key: "title" },
  { label: "Description", key: "description" },
  { label: "Image", key: "image" },
  { label: "Site Name", key: "siteName" },
  { label: "Type", key: "type" },
  { label: "Twitter Card", key: "twitterCard" },
  { label: "Twitter Title", key: "twitterTitle" },
  { label: "Twitter Description", key: "twitterDescription" },
  { label: "Twitter Image", key: "twitterImage" },
  { label: "Favicon", key: "favicon" },
]

const OgResult: FC<OgResultProps> = ({ data }) => {
  const hasOgImage = !!data.image

  return (
    <div className="space-y-6">
      {hasOgImage && (
        <div className="rounded-md border border-dev-border overflow-hidden">
          <div className="bg-dev-inset p-2">
            <p className="text-xs text-dev-text-secondary font-medium uppercase tracking-wide">
              Preview
            </p>
          </div>
          <div className="p-4 bg-dev-surface">
            <div className="rounded border border-dev-border overflow-hidden bg-dev-inset">
              {data.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.image}
                  alt={data.title ?? "OG Preview"}
                  className="w-full max-h-80 object-cover"
                />
              )}
              <div className="p-3 space-y-1">
                <p className="text-xs text-dev-text-secondary">
                  {data.siteName ?? new URL(data.url).hostname}
                </p>
                <p className="text-sm font-medium text-dev-text">
                  {data.title ?? "No title"}
                </p>
                {data.description && (
                  <p className="text-xs text-dev-text-secondary line-clamp-2">
                    {data.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-dev-border overflow-hidden">
        <div className="bg-dev-inset p-2">
          <p className="text-xs text-dev-text-secondary font-medium uppercase tracking-wide">
            Raw Tags
          </p>
        </div>
        <div className="divide-y divide-dev-border">
          {FIELD_ORDER.map(({ label, key }) => {
            const value = data[key]
            if (!value) return null
            const isUrl = key === "url" || key === "image" || key === "twitterImage" || key === "favicon"
            return (
              <div
                key={key}
                className="grid grid-cols-[120px_1fr] gap-3 px-4 py-2.5"
              >
                <span className="text-sm text-dev-text-secondary">{label}</span>
                <span
                  className={classNames("text-sm text-dev-text break-all", {
                    "text-dev-link": isUrl,
                  })}
                >
                  {isUrl ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OgPreview
