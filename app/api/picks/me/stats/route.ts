// app/api/picks/me-stats/route.ts
import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest } from '@/lib/api-config' // your existing helper

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'month'

  const path = `${'/picks/me/stats'}?period=${encodeURIComponent(period)}`

  const url = `${API_CONFIG.baseUrl}${path}`
  console.log('Fetching me-stats from:', url)
  try {
    const res = await apiRequest(url, { method: 'GET', cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('me-stats proxy error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
