import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest } from '../../../../lib/api-config'

export const revalidate = 0

function trimSlashes(s: string) {
  return s.replace(/^\/+|\/+$/g, '')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Build query for upstream
    const qp = new URLSearchParams()
    const competitionId = searchParams.get('competition_id')
    const period = searchParams.get('period')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const limit = searchParams.get('limit')

    if (competitionId) qp.set('competition_id', competitionId!)
    if (start) qp.set('start', start!)
    if (end) qp.set('end', end!)
    if (!start || !end) qp.set('period', period ?? 'month')
    if (limit) qp.set('limit', limit!)

    // ---- Robust URL join + fallback endpoint ----
    const endpoint = API_CONFIG?.endpoints?.pick_leaderboard ?? '/picks/leaderboard' // <— fallback

    const apiUrl = `${trimSlashes(endpoint)}` + (qp.toString() ? `?${qp.toString()}` : '')

    // If baseUrl already includes protocol/host (e.g. https://api.kvotizza.online/api),
    // the leading “/” above is fine because baseUrl should be the full origin+path.
    // If baseUrl is only the origin (https://api.kvotizza.online), include the “api” part there.

    // Optional debug:
    // console.log('Calling upstream:', apiUrl)

    const resp = await apiRequest(apiUrl)
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return NextResponse.json(
        { error: 'Upstream error', status: resp.status, details: text || undefined },
        { status: 502 }
      )
    }

    const data = await resp.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Leaderboard proxy error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', message: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
