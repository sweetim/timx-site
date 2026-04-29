import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata } from "next"
import { Mali } from "next/font/google"
import opengraph from "@/app/opengraph.jpg"
import "./globals.css"

const mali = Mali({
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://timx.co"),
  title: {
    default: "Tim",
    template: "%s | timx",
  },
  description:
    "Free browser-based developer tools: JSON viewer, background remover, image cropper, and LLM pricing comparison. By Tim, a developer in Tokyo.",
  alternates: { canonical: "https://timx.co" },
  openGraph: {
    type: "website",
    url: "https://timx.co",
    siteName: "timx",
    title: "Tim — Tokyo",
    description:
      "Tim — a developer based in Tokyo building tools for the robotics, AI and blockchain.",
    images: [opengraph.src],
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
      <body className="h-full">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {children}
      </body>
    </html>
  )
}
