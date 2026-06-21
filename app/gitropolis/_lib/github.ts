"use server"

import { cookies } from "next/headers"
import type {
  GithubData,
  GithubUser,
  YearContributions,
} from "../_components/types"

const TOKEN_COOKIE = "gitropolis_token"
const GRAPHQL_URL = "https://api.github.com/graphql"

export type GithubDataResult =
  | { status: "unauthenticated" }
  | { status: "ok"; data: GithubData }
  | { status: "error"; message: string }

const DAY_FIELDS = `
  contributionDays {
    date
    contributionCount
    weekday
    color
  }
`

const CALENDAR_FIELDS = `
  totalContributions
  colors
  weeks {
    ${DAY_FIELDS}
  }
`

type RawDay = {
  date: string
  contributionCount: number
  weekday: number
  color: string
}

type RawCalendar = {
  totalContributions: number
  colors: string[]
  weeks: { contributionDays: RawDay[] }[]
}

function buildYear(year: number, raw: RawCalendar): YearContributions {
  const colors = raw.colors ?? []
  return {
    year,
    totalContributions: raw.totalContributions,
    weeks: raw.weeks.map((week) => ({
      contributionDays: week.contributionDays.map((day) => ({
        date: day.date,
        contributionCount: day.contributionCount,
        weekday: day.weekday,
        intensityLevel: Math.max(0, colors.indexOf(day.color)),
      })),
    })),
  }
}

function yearFields(years: number[]): string {
  return years
    .map(
      (year) =>
        `year_${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") {
          contributionCalendar {
            ${CALENDAR_FIELDS}
          }
        }`,
    )
    .join("\n")
}

export async function getGithubData(): Promise<GithubDataResult> {
  const store = await cookies()
  const token = store.get(TOKEN_COOKIE)?.value
  if (!token) return { status: "unauthenticated" }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }

  try {
    const profileResponse = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: "query { viewer { login name avatarUrl createdAt } }",
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (profileResponse.status === 401 || profileResponse.status === 403) {
      return {
        status: "error",
        message: "GitHub rejected the access token. Please sign in again.",
      }
    }
    if (!profileResponse.ok) {
      return {
        status: "error",
        message: `GitHub API error (HTTP ${profileResponse.status}).`,
      }
    }

    const profilePayload = await profileResponse.json()
    const profile = profilePayload?.data?.viewer
    if (!profile) {
      const message =
        profilePayload?.errors?.[0]?.message
        ?? "Unexpected response from GitHub."
      return { status: "error", message }
    }

    const createdAt = new Date(profile.createdAt)
    const startYear = createdAt.getUTCFullYear()
    const currentYear = new Date().getUTCFullYear()
    const years: number[] = []
    for (let year = startYear; year <= currentYear; year++) years.push(year)

    const yearsResponse = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `query { viewer { ${yearFields(years)} } }`,
      }),
      signal: AbortSignal.timeout(20_000),
    })

    if (!yearsResponse.ok) {
      return {
        status: "error",
        message: `GitHub API error (HTTP ${yearsResponse.status}).`,
      }
    }

    const yearsPayload = await yearsResponse.json()
    const viewer = yearsPayload?.data?.viewer
    if (!viewer) {
      const message =
        yearsPayload?.errors?.[0]?.message ?? "Unexpected response from GitHub."
      return { status: "error", message }
    }

    const built = years
      .map((year) => {
        const raw = viewer[`year_${year}`]?.contributionCalendar as
          | RawCalendar
          | undefined
        return raw ? buildYear(year, raw) : null
      })
      .filter((year): year is YearContributions => year !== null)

    const user: GithubUser = {
      login: profile.login,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    }

    return { status: "ok", data: { user, years: built } }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach GitHub."
    return { status: "error", message }
  }
}
