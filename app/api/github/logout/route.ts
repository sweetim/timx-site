import { cookies } from "next/headers"

const TOKEN_COOKIE = "gitropolis_token"

export async function POST() {
  const store = await cookies()
  store.delete(TOKEN_COOKIE)
  return Response.json({ ok: true })
}
