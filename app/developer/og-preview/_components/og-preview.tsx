"use client"

import {
  SiDiscord,
  SiDiscordHex,
  SiFacebook,
  SiFacebookHex,
  SiWhatsapp,
  SiWhatsappHex,
} from "@icons-pack/react-simple-icons"
import clsx from "clsx"
import { AlertCircle, Loader2, Search } from "lucide-react"
import Image from "next/image"
import { type FC, useState } from "react"
import { match } from "ts-pattern"
import { fetchOgData, type OgData } from "../_lib/fetch-og"

const BRAND = {
  Facebook: { Icon: SiFacebook, hex: SiFacebookHex },
  WhatsApp: { Icon: SiWhatsapp, hex: SiWhatsappHex },
  Discord: { Icon: SiDiscord, hex: SiDiscordHex },
  LinkedIn: { logo: "/linkedin.svg" },
} as const

const FONT = {
  Facebook:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  WhatsApp: '"Segoe UI", Helvetica, Arial, sans-serif',
  Discord:
    '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
  LinkedIn:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
} as const

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
    <div className="mx-auto px-6 py-8 w-full">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-dev-text mb-1">
          Open Graph Preview
        </h1>
        <p className="text-sm text-dev-text-secondary mb-6">
          Enter a URL to inspect its Open Graph and Twitter Card meta tags.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 mb-6"
        >
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
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-dev-button hover:bg-dev-button-hover text-dev-text text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {status.phase === "loading" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Preview
          </button>
        </form>
      </div>

      {match(status)
        .with({ phase: "loading" }, () => (
          <div className="max-w-2xl mx-auto flex items-center justify-center py-12 text-dev-text-secondary">
            <Loader2 className="size-5 animate-spin mr-2" />
            Fetching meta tags…
          </div>
        ))
        .with({ phase: "error" }, ({ message }) => (
          <div className="max-w-2xl mx-auto flex items-start gap-3 p-4 rounded-md border border-dev-accent-red/30 bg-dev-accent-red/10">
            <AlertCircle className="size-5 text-dev-accent-red shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-dev-accent-red">
                Failed to fetch
              </p>
              <p className="text-sm text-dev-text-secondary mt-1">{message}</p>
            </div>
          </div>
        ))
        .with({ phase: "loaded" }, ({ data }) => <OgResult data={data} />)
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

function getHostname(data: OgData): string {
  try {
    return new URL(data.url).hostname
  } catch {
    return data.url
  }
}

const OgResult: FC<OgResultProps> = ({ data }) => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PlatformCard label="Facebook">
        <FacebookPreview data={data} />
      </PlatformCard>
      <PlatformCard label="WhatsApp">
        <WhatsAppPreview data={data} />
      </PlatformCard>
      <PlatformCard label="Discord">
        <DiscordPreview data={data} />
      </PlatformCard>
      <PlatformCard label="LinkedIn">
        <LinkedInPreview data={data} />
      </PlatformCard>
    </div>

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
          const isUrl =
            key === "url"
            || key === "image"
            || key === "twitterImage"
            || key === "favicon"
          return (
            <div
              key={key}
              className="grid grid-cols-[120px_1fr] gap-3 px-4 py-2.5"
            >
              <span className="text-sm text-dev-text-secondary">{label}</span>
              <span
                className={clsx("text-sm text-dev-text break-all", {
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

const PlatformCard: FC<{
  label: keyof typeof BRAND
  children: React.ReactNode
}> = ({ label, children }) => {
  const brand = BRAND[label]
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {"Icon" in brand ? (
          <brand.Icon
            color={brand.hex}
            size={16}
          />
        ) : (
          <Image
            src={brand.logo}
            alt={label}
            width={16}
            height={16}
          />
        )}
        <p className="text-xs text-dev-text-secondary font-medium uppercase tracking-wide">
          {label}
        </p>
      </div>
      {children}
    </div>
  )
}

const FacebookPreview: FC<{ data: OgData }> = ({ data }) => (
  <div
    style={{ fontFamily: FONT.Facebook }}
    className="rounded-lg overflow-hidden border border-[#dadde1] bg-[#f0f2f5] w-full"
  >
    {data.image && (
      <div className="bg-[#e4e6eb]">
        <Image
          src={data.image}
          alt={data.title ?? ""}
          width={800}
          height={419}
          unoptimized
          className="w-full aspect-[1.91/1] object-cover"
        />
      </div>
    )}
    <div className="p-3 space-y-0.5 bg-white">
      <p className="text-[11px] text-[#65676b] uppercase tracking-wide truncate">
        {getHostname(data)}
      </p>
      <p className="text-[15px] font-semibold text-[#050505] leading-snug line-clamp-2">
        {data.title ?? "No title"}
      </p>
      {data.description && (
        <p className="text-[13px] text-[#65676b] line-clamp-2">
          {data.description}
        </p>
      )}
    </div>
  </div>
)

const WhatsAppPreview: FC<{ data: OgData }> = ({ data }) => (
  <div
    style={{ fontFamily: FONT.WhatsApp }}
    className="rounded-lg overflow-hidden w-full"
  >
    {data.image && (
      <div className="bg-[#1a2731]">
        <Image
          src={data.image}
          alt={data.title ?? ""}
          width={800}
          height={419}
          unoptimized
          className="w-full aspect-[1.91/1] object-cover"
        />
      </div>
    )}
    <div className="p-3 space-y-0.5 bg-[#1a2731] border-t border-[#2a3942]">
      <p className="text-[11px] text-[#8696a0] uppercase tracking-wide truncate">
        {getHostname(data)}
      </p>
      <p className="text-[14px] text-[#e9edef] leading-snug line-clamp-2">
        {data.title ?? "No title"}
      </p>
      {data.description && (
        <p className="text-[13px] text-[#8696a0] line-clamp-2">
          {data.description}
        </p>
      )}
    </div>
  </div>
)

const DiscordPreview: FC<{ data: OgData }> = ({ data }) => (
  <div
    style={{ fontFamily: FONT.Discord }}
    className="rounded-lg overflow-hidden w-full bg-[#2b2d31] border-l-4 border-[#5865f2]"
  >
    {data.image && (
      <div className="bg-[#1e1f22]">
        <Image
          src={data.image}
          alt={data.title ?? ""}
          width={800}
          height={419}
          unoptimized
          className="w-full aspect-[1.91/1] object-cover"
        />
      </div>
    )}
    <div className="p-3 space-y-0.5">
      {data.siteName && (
        <p className="text-[11px] text-[#b5bac1]">{data.siteName}</p>
      )}
      <p className="text-[15px] font-semibold text-[#00a8fc] leading-snug line-clamp-2">
        {data.title ?? "No title"}
      </p>
      {data.description && (
        <p className="text-[13px] text-[#dbdee1] line-clamp-3">
          {data.description}
        </p>
      )}
      <p className="text-[11px] text-[#b5bac1] mt-1">{getHostname(data)}</p>
    </div>
  </div>
)

const LinkedInPreview: FC<{ data: OgData }> = ({ data }) => (
  <div
    style={{ fontFamily: FONT.LinkedIn }}
    className="rounded-lg overflow-hidden border border-[#e0e0e0] w-full bg-white"
  >
    {data.image && (
      <div className="bg-[#f3f2ef]">
        <Image
          src={data.image}
          alt={data.title ?? ""}
          width={800}
          height={419}
          unoptimized
          className="w-full aspect-[1.91/1] object-cover"
        />
      </div>
    )}
    <div className="p-3 space-y-0.5">
      <p className="text-[14px] font-semibold text-[#000000] leading-snug line-clamp-2">
        {data.title ?? "No title"}
      </p>
      {data.description && (
        <p className="text-[13px] text-[#666666] line-clamp-2">
          {data.description}
        </p>
      )}
      <p className="text-[11px] text-[#666666] truncate">{getHostname(data)}</p>
    </div>
  </div>
)

export default OgPreview
