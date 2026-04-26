"use server"

import dns from "node:dns/promises"
import { match, P } from "ts-pattern"

export type OgData = {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  type: string | null
  twitterCard: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  favicon: string | null
}

type FetchResult = { ok: true; data: OgData } | { ok: false; error: string }

const MAX_HTML_BYTES = 512 * 1024

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "0:0:0:0:0:0:0:1",
  "[::1]",
])

function isPrivateIpv4(octets: number[]): boolean {
  return match(octets)
    .with([10, P._, P._, P._], () => true)
    .with([172, P.when((b) => b >= 16 && b <= 31), P._, P._], () => true)
    .with([192, 168, P._, P._], () => true)
    .with([169, 254, 169, P._], () => true)
    .with([127, P._, P._, P._], () => true)
    .with([0, P._, P._, P._], () => true)
    .otherwise(() => false)
}

function isPrivateIpv6(groups: string[]): boolean {
  return match(groups[0])
    .with(P.union("fc", "fd"), () => true)
    .with("fe80", () => true)
    .otherwise(() => groups.every((g) => g === "0" || g === "0000"))
}

async function isPrivateHost(hostname: string): Promise<boolean> {
  if (BLOCKED_HOSTS.has(hostname)) return true

  let resolved: string[]
  try {
    const result = await dns.resolve4(hostname)
    resolved = result
  } catch {
    try {
      const result = await dns.resolve6(hostname)
      resolved = result
    } catch {
      return true
    }
  }

  for (const addr of resolved) {
    if (BLOCKED_HOSTS.has(addr)) return true

    if (addr.includes(":")) {
      const groups = addr
        .split(":")
        .map((g) => g.toLowerCase().replace(/^0+/, "") || "0")
      if (isPrivateIpv6(groups)) return true
    } else {
      const octets = addr.split(".").map(Number)
      if (octets.length === 4 && isPrivateIpv4(octets)) return true
    }
  }

  return false
}

function extractMeta(html: string): OgData {
  const getMeta = (patterns: RegExp[]): string | null => {
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const title =
    getMeta([
      /<meta\s+property="og:title"\s+content="([^"]*)"/i,
      /<meta\s+content="([^"]*)"\s+property="og:title"/i,
    ]) ?? getMeta([/<title>([^<]*)<\/title>/i])

  const description = getMeta([
    /<meta\s+property="og:description"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+property="og:description"/i,
    /<meta\s+name="description"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+name="description"/i,
  ])

  const image = getMeta([
    /<meta\s+property="og:image"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+property="og:image"/i,
    /<meta\s+property="og:image:url"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+property="og:image:url"/i,
  ])

  const siteName = getMeta([
    /<meta\s+property="og:site_name"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+property="og:site_name"/i,
  ])

  const type = getMeta([
    /<meta\s+property="og:type"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+property="og:type"/i,
  ])

  const twitterCard = getMeta([
    /<meta\s+name="twitter:card"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+name="twitter:card"/i,
  ])

  const twitterTitle = getMeta([
    /<meta\s+name="twitter:title"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+name="twitter:title"/i,
  ])

  const twitterDescription = getMeta([
    /<meta\s+name="twitter:description"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+name="twitter:description"/i,
  ])

  const twitterImage = getMeta([
    /<meta\s+name="twitter:image"\s+content="([^"]*)"/i,
    /<meta\s+content="([^"]*)"\s+name="twitter:image"/i,
  ])

  const favicon = getMeta([
    /<link\s+[^>]*rel="(?:icon|shortcut icon)"[^>]*href="([^"]*)"/i,
    /<link\s+[^>]*href="([^"]*)"[^>]*rel="(?:icon|shortcut icon)"/i,
  ])

  return {
    url: "",
    title,
    description,
    image,
    siteName,
    type,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    favicon,
  }
}

function resolveUrl(base: string, relative: string | null): string | null {
  if (!relative) return null
  try {
    return new URL(relative, base).href
  } catch {
    return relative
  }
}

async function readBodyWithLimit(
  response: Response,
  maxBytes: number,
): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error("No response body")

  const chunks: Uint8Array[] = []
  let total = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      reader.cancel()
      throw new Error("Response too large")
    }
    chunks.push(value)
  }

  const decoder = new TextDecoder()
  return (
    chunks.map((c) => decoder.decode(c, { stream: true })).join("")
    + decoder.decode()
  )
}

export async function fetchOgData(inputUrl: string): Promise<FetchResult> {
  let url: URL
  try {
    url = new URL(
      inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`,
    )
  } catch {
    return { ok: false, error: "Invalid URL" }
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "Only HTTPS URLs are allowed" }
  }

  if (await isPrivateHost(url.hostname)) {
    return { ok: false, error: "URL resolves to a private or reserved address" }
  }

  try {
    const response = await fetch(url.href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; OGPreviewBot/1.0; +https://timx.co)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    })

    const finalHost = new URL(response.url).hostname
    if (await isPrivateHost(finalHost)) {
      return {
        ok: false,
        error: "Redirect target resolves to a private address",
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP ${response.status} ${response.statusText}`,
      }
    }

    const html = await readBodyWithLimit(response, MAX_HTML_BYTES)
    const data = extractMeta(html)
    data.url = response.url
    data.image = resolveUrl(response.url, data.image)
    data.twitterImage = resolveUrl(response.url, data.twitterImage)
    data.favicon = resolveUrl(response.url, data.favicon)

    return { ok: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch URL"
    return { ok: false, error: message }
  }
}
