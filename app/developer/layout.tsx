import NavBar from "./_components/nav-bar"

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <NavBar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
