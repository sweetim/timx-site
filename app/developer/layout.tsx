import NavBar from "./_components/nav-bar"

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full bg-dev-canvas">
      <NavBar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
