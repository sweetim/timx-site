import './globals.css'

export const metadata = {
  title: 'timx',
  description: 'my personal site',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
