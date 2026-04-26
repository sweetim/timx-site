"use server"

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

type FetchResult =
  | { ok: true; data: OgData }
  | { ok: false; error: string }

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

export async function fetchOgData(inputUrl: string): Promise<FetchResult> {
  let url: URL
  try {
    url = new URL(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`)
  } catch {
    return { ok: false, error: "Invalid URL" }
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

    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP ${response.status} ${response.statusText}`,
      }
    }

    const html = await response.text()
    const data = extractMeta(html)
    data.url = url.href
    data.image = resolveUrl(url.href, data.image)
    data.twitterImage = resolveUrl(url.href, data.twitterImage)
    data.favicon = resolveUrl(url.href, data.favicon)

    return { ok: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch URL"
    return { ok: false, error: message }
  }
}
