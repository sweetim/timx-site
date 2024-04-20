export async function GET(request: Request) {
  const data = await request.json()
  console.log(data)
  return new Response('Hello, Next.js!')
}

export async function POST(request: Request) {
  const data = await request.json()
  console.log(data)
  return new Response('Hello, Next.js POST!')
}
