// app/api/picks/me-stats/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest } from '@/lib/api-config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    // 1) Require login
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const role = String((session as any).user?.role || 'USER').toLowerCase()
    const uid  = String((session as any).user?.id ?? '')
    const email = String(session.user?.email ?? '')

    // 2) Params passthrough
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? 'month'

    // 3) Build FastAPI URL
    const path = `/picks/me/stats?period=${encodeURIComponent(period)}`
    const url = `${API_CONFIG.baseUrl}${path}`
    console.log('Fetching me-stats from:', url)

    // 4) Forward request to backend with identity headers
    const res = await apiRequest(url, {
      method: 'GET',
      headers: {
        'x-user-role': role,
        'x-user-id': uid,
        'x-user-email': email,
      },
      cache: 'no-store',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('me-stats proxy error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
