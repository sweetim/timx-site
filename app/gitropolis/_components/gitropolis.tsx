"use client"

import { SiGithub } from "@icons-pack/react-simple-icons"
import { AlertCircle, Loader2, LogOut } from "lucide-react"
import Image from "next/image"
import { type ReactNode, useEffect, useState } from "react"
import { match } from "ts-pattern"
import { type GithubDataResult, getGithubData } from "../_lib/github"
import { ContributionHeatmap } from "./contribution-heatmap"
import type { GithubData } from "./types"

type Phase =
  | { phase: "loading" }
  | { phase: "unauthenticated"; error: string | null }
  | { phase: "ready"; data: GithubData }
  | { phase: "error"; message: string }

const ERROR_MESSAGES: Record<string, string> = {
  config: "GitHub sign-in is not configured on this server.",
  state: "Sign-in session expired or was invalid. Please try again.",
  exchange: "Could not reach GitHub to complete sign-in. Please try again.",
  denied: "GitHub did not grant access. Please try again.",
}

const DESTINATION = "/gitropolis"
const LOGIN_HREF = "/api/github/login"

function LoginButton({ label }: { label: string }) {
  return (
    <a
      href={LOGIN_HREF}
      className="inline-flex items-center gap-2 rounded-md bg-dev-button px-4 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
    >
      <SiGithub size={16} />
      {label}
    </a>
  )
}

export default function Gitropolis({
  landingContent,
}: {
  landingContent: ReactNode
}) {
  const [phase, setPhase] = useState<Phase>({ phase: "loading" })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorCode = params.get("error")
    const initialError = errorCode
      ? (ERROR_MESSAGES[errorCode] ?? "Sign-in failed. Please try again.")
      : null
    if (errorCode) {
      window.history.replaceState({}, "", DESTINATION)
    }

    let active = true
    getGithubData().then((result: GithubDataResult) => {
      if (!active) return
      match(result)
        .with({ status: "unauthenticated" }, () =>
          setPhase({ phase: "unauthenticated", error: initialError }),
        )
        .with({ status: "ok" }, ({ data }) =>
          setPhase({ phase: "ready", data }),
        )
        .with({ status: "error" }, ({ message }) =>
          setPhase({ phase: "error", message }),
        )
        .exhaustive()
    })
    return () => {
      active = false
    }
  }, [])

  const handleLogout = async () => {
    await fetch("/api/github/logout", { method: "POST" })
    window.location.assign(DESTINATION)
  }

  return (
    <div className="flex h-full flex-col bg-dev-canvas text-dev-text">
      {match(phase)
        .with({ phase: "loading" }, () => (
          <div className="flex flex-1 items-center justify-center text-dev-text-secondary">
            <Loader2 className="mr-2 size-5 animate-spin" />
            Loading your contribution history…
          </div>
        ))
        .with({ phase: "unauthenticated" }, ({ error }) => (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              {landingContent}
              {error ? (
                <div className="mb-4 flex items-start gap-3 rounded-md border border-dev-accent-red/30 bg-dev-accent-red/10 p-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-dev-accent-red" />
                  <p className="text-sm text-dev-text-secondary">{error}</p>
                </div>
              ) : null}
              <div className="flex justify-center">
                <LoginButton label="Sign in with GitHub" />
              </div>
              <p className="mt-4 text-center text-xs text-dev-text-secondary">
                Read-only access to your profile and contribution history. You
                can revoke access anytime from your GitHub settings.
              </p>
            </div>
          </div>
        ))
        .with({ phase: "error" }, ({ message }) => (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="w-full max-w-md text-center">
              <div className="flex items-start gap-3 rounded-md border border-dev-accent-red/30 bg-dev-accent-red/10 p-4 text-left">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-dev-accent-red" />
                <p className="text-sm text-dev-text-secondary">{message}</p>
              </div>
              <div className="mt-4 flex justify-center">
                <LoginButton label="Sign in again" />
              </div>
            </div>
          </div>
        ))
        .with({ phase: "ready" }, ({ data }) => {
          const total = data.years.reduce(
            (sum, year) => sum + year.totalContributions,
            0,
          )
          const yearsByNewest = [...data.years].sort((a, b) => b.year - a.year)
          return (
            <div className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-4xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={data.user.avatarUrl}
                      alt={data.user.login}
                      width={40}
                      height={40}
                      className="size-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-dev-text">
                        {data.user.name ?? data.user.login}
                      </p>
                      <p className="text-xs text-dev-text-secondary">
                        @{data.user.login} · {total.toLocaleString()}{" "}
                        contributions
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-md bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>

                <div className="space-y-6">
                  {yearsByNewest.map((year) => (
                    <div key={year.year}>
                      <div className="mb-2 flex items-baseline gap-2">
                        <h2 className="text-sm font-semibold text-dev-text">
                          {year.year}
                        </h2>
                        <span className="text-xs text-dev-text-secondary">
                          {year.totalContributions.toLocaleString()}{" "}
                          contribution
                          {year.totalContributions === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="rounded-lg border border-dev-border bg-dev-surface p-4 sm:p-6">
                        <ContributionHeatmap weeks={year.weeks} />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs text-dev-text-secondary">
                  These heatmaps are the blueprint for an isometric city —
                  coming in the next step.
                </p>
              </div>
            </div>
          )
        })
        .exhaustive()}
    </div>
  )
}
