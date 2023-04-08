export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-slate-800 min-h-screen">
            {children}
        </div>
    )
}
