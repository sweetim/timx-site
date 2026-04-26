import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for timx.co — free browser-based developer tools. No data is collected or sent to any server.",
  alternates: { canonical: "https://timx.co/privacy" },
  openGraph: {
    title: "Privacy Policy",
    description:
      "Privacy policy for timx.co — free browser-based developer tools. No data is collected or sent to any server.",
    url: "https://timx.co/privacy",
    images: [{ url: "https://timx.co/opengraph.webp" }],
  },
}

export default function PrivacyPage() {
  return (
    <div className="flex justify-center items-center min-h-full bg-neutral-200 p-6">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          Privacy Policy
        </h1>

        <p className="text-slate-700 leading-relaxed">
          Last updated: April 2026
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            No data collection
          </h2>
          <p className="text-slate-700 leading-relaxed">
            All tools on timx.co run entirely in your browser. No files, text,
            or personal data are uploaded to any server. There are no accounts,
            no cookies for tracking, and no analytics that identify you
            personally.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Background Remover
          </h2>
          <p className="text-slate-700 leading-relaxed">
            The AI background removal model is downloaded to your browser and
            runs in a Web Worker. Your images are processed locally and never
            sent to any external service.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            LLM Pricing
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Model pricing data is fetched from the public OpenRouter API. No
            personal information is included in these requests.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Third-party services
          </h2>
          <p className="text-slate-700 leading-relaxed">
            This site is hosted on a third-party hosting provider that may
            collect standard server logs (IP address, browser user agent) as
            part of normal operations. These logs are not controlled by timx.co.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Changes</h2>
          <p className="text-slate-700 leading-relaxed">
            This policy may be updated from time to time. The &ldquo;last
            updated&rdquo; date at the top reflects the most recent change.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="text-blue-700 hover:text-blue-900 underline"
          >
            Back to home
          </Link>
          {" · "}
          <Link
            href="/about"
            className="text-blue-700 hover:text-blue-900 underline"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  )
}
