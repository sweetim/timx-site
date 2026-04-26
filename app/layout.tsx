import type { Metadata } from "next"
import { Mali } from "next/font/google"
import "./globals.css"

const mali = Mali({
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: { default: "Tim — Developer Tools & Portfolio", template: "%s | timx" },
  description:
    "Free browser-based developer tools: JSON viewer, background remover, image cropper, and LLM pricing comparison. By Tim, a developer in Tokyo.",
  alternates: { canonical: "https://timx.co" },
  openGraph: {
    type: "website",
    url: "https://timx.co",
    siteName: "timx",
    title: "Tim — Developer Tools & Portfolio",
    description:
      "Free browser-based developer tools: JSON viewer, background remover, image cropper, and LLM pricing comparison. By Tim, a developer in Tokyo.",
    images: [{ url: "https://timx.co/opengraph.webp" }],
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${mali.className} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  )
}
