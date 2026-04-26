import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://timx.co"
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/developer`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/developer/json-viewer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/developer/background-remover`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/developer/image-cropper`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/developer/llm-usage`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/developer/og-preview`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ]
}
