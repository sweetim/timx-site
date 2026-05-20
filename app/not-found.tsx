import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center h-full bg-neutral-200">
      <h1 className="text-8xl font-bold">404</h1>
      <p className="text-slate-900 mt-4">page not found</p>
      <Link
        href="/"
        className="mt-8 px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700"
      >
        go home
      </Link>
    </div>
  )
}
