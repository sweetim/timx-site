export type ContributionDay = {
  date: string
  contributionCount: number
  weekday: number
  intensityLevel: number
}

export type ContributionWeek = {
  contributionDays: ContributionDay[]
}

export type GithubUser = {
  login: string
  name: string | null
  avatarUrl: string
}

export type YearContributions = {
  year: number
  totalContributions: number
  weeks: ContributionWeek[]
}

export type GithubData = {
  user: GithubUser
  years: YearContributions[]
}
