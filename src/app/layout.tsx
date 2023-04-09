import './globals.css'
import { Mali } from "next/font/google"

export const metadata = {
  title: 'timx',
  description: 'my personal site',
}

const mali = Mali({
  weight: "400",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${mali.className} h-full`}>{children}</body>
    </html>
  )
}
