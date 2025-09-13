// app/api/picks/me-stats/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/api-config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    // 1) Require login
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const uid   = String((session.user as any).id ?? '')
    const email = String((session.user as any).email ?? '')
    const role  = String((session.user as any).role ?? 'USER')

    // 2) Params passthrough
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? 'month'

    // 3) Build URL
    const url = `${API_CONFIG.baseUrl.replace(/\/$/, '')}/picks/me/stats?period=${encodeURIComponent(period)}`
    console.log('Proxy →', url)

    // 4) Call FastAPI directly (avoid wrappers that throw on !ok)
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-user-id': uid,
        'x-user-email': email,
        'x-user-role': role,
      },
      cache: 'no-store',
    })

    // 5) Pipe upstream status/body back
    const text = await res.text()
    let body: any
    try { body = JSON.parse(text) } catch { body = text ? { error: text } : {} }
    return NextResponse.json(body, { status: res.status })
  } catch (err: any) {
    console.error('me-stats proxy error:', err?.stack || err?.message || err)
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
  }
}
