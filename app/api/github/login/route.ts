import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

const STATE_COOKIE = "gitropolis_oauth_state"
const SCOPES = "read:user"

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response(
      "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
      { status: 500 },
    )
  }

  const store = await cookies()
  const state = crypto.randomUUID()
  store.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  })

  const redirectUri = `${request.nextUrl.origin}/api/github/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  })

  redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
}
