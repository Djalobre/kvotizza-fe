import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest } from '@/lib/api-config'
import { sportsConfigService } from '@/lib/sports-config'

export async function GET() {
  try {
    const base = API_CONFIG.baseUrl.replace(/\/$/, '') // ensure no trailing slash
    // You can also add this path to your sportsConfigService if you prefer
    const url = `${base}/picks/summary`

    const res = await apiRequest(url, { method: 'GET' })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: t || 'Upstream error' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error proxying competitions/summary:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
