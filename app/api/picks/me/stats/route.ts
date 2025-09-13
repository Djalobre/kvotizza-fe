// app/api/picks/me-stats/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { API_CONFIG, apiRequest } from '@/lib/api-config'

// build the headers FastAPI expects
function headersFromSession(session: any) {
  const u = session?.user || {}
  return {
    'X-User-Id': String(u.id ?? ''),
    'X-User-Email': String(u.email ?? ''),
    'X-User-Role': String(u.role ?? 'USER').toUpperCase(),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'month'

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = `${API_CONFIG.baseUrl.replace(/\/$/, '')}/picks/me/stats?period=${encodeURIComponent(period)}`
  try {
    const res = await apiRequest(url, {
      method: 'GET',
      headers: {
        ...headersFromSession(session),
      },
      cache: 'no-store',
    })

    // bubble up upstream error codes/body
    const text = await res.text()
    const body = (() => { try { return JSON.parse(text) } catch { return { raw: text } } })()
    return NextResponse.json(body, { status: res.status })
  } catch (err: any) {
    console.error('me-stats proxy error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to load stats' }, { status: 500 })
  }
}
