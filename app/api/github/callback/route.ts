import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

const STATE_COOKIE = "gitropolis_oauth_state"
const TOKEN_COOKIE = "gitropolis_token"
const DESTINATION = "/gitropolis"

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    redirect(`${DESTINATION}?error=config`)
  }

  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")

  const store = await cookies()
  const expectedState = store.get(STATE_COOKIE)?.value
  store.delete(STATE_COOKIE)

  if (!code || !state || !expectedState || state !== expectedState) {
    redirect(`${DESTINATION}?error=state`)
  }

  const redirectUri = `${request.nextUrl.origin}/api/github/callback`
  let accessToken: string | null = null
  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
        signal: AbortSignal.timeout(15_000),
      },
    )
    const payload = await response.json()
    accessToken = payload?.access_token ?? null
  } catch {
    redirect(`${DESTINATION}?error=exchange`)
  }

  if (!accessToken) {
    redirect(`${DESTINATION}?error=denied`)
  }

  store.set(TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect(DESTINATION)
}
