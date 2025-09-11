// app/api/admin/whoami/route.ts  (primer)
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const fastapi = process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8000'
  const r = await fetch(`${fastapi}/api/admin/whoami`, {
    headers: {
      'x-user-role':  req.headers.get('x-user-role')  || '',
      'x-user-id':    req.headers.get('x-user-id')    || '',
      'x-user-email': req.headers.get('x-user-email') || '',
    },
  })
  return NextResponse.json(await r.json(), { status: r.status })
}
