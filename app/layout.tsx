import type { Metadata } from "next"
import { Mali } from "next/font/google"
import "./globals.css"

const mali = Mali({
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "timx",
  description: "my personal site",
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
