import type { Metadata } from "next"
import Link from "next/link"
import opengraph from "@/app/opengraph.jpg"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for timx.co — free browser-based developer tools.",
  alternates: { canonical: "https://timx.co/terms" },
  openGraph: {
    title: "Terms of Service",
    description:
      "Terms of service for timx.co — free browser-based developer tools.",
    url: "https://timx.co/terms",
    images: [opengraph.src],
  },
}

export default function TermsPage() {
  return (
    <div className="flex justify-center items-center min-h-full bg-neutral-200 p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-900">
            Terms of Service
          </h1>
          <p className="text-slate-700 leading-relaxed">
            Last updated: April 2026
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Acceptance of terms
          </h2>
          <p className="text-slate-700 leading-relaxed">
            By using timx.co, you agree to these terms. If you do not agree, do
            not use the site.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Usage</h2>
          <p className="text-slate-700 leading-relaxed">
            All tools on timx.co are provided free of charge for personal and
            commercial use. You may use the output of the tools in any project
            without attribution, though it is appreciated.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            No warranty
          </h2>
          <p className="text-slate-700 leading-relaxed">
            The tools are provided &ldquo;as is&rdquo; without warranty of any
            kind. timx.co makes no guarantees about accuracy, reliability, or
            fitness for a particular purpose. Use the output at your own
            discretion.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Liability</h2>
          <p className="text-slate-700 leading-relaxed">
            timx.co is not liable for any damages arising from the use of these
            tools, including but not limited to data loss, incorrect results, or
            service interruptions.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Changes</h2>
          <p className="text-slate-700 leading-relaxed">
            These terms may be updated from time to time. The &ldquo;last
            updated&rdquo; date at the top reflects the most recent change.
            Continued use of the site after changes constitutes acceptance of the
            updated terms.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/developer"
            className="text-blue-700 hover:text-blue-900"
          >
            Back to Developer Tools
          </Link>
        </div>
      </div>
    </div>
  )
}
