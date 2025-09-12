// app/api/top-matches/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest, getApiHeaders } from '@/lib/api-config'
import { sportsConfigService } from '@/lib/sports-config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // 1) Require login
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const role = String((session as any).user?.role || 'USER').toLowerCase()
    const uid  = String((session as any).user?.id ?? '')
    const email = String(session.user?.email ?? '')

    // 2) Parse & (light) validate input
    const payload = await request.json()
    const required = ['match_id','bet_category','bet_name','odd','confidence']
    for (const k of required) {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '')
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 })
    }

    // 3) Build FastAPI URL
    const apiConfig = sportsConfigService.getApiConfig()
    const submitPick = (apiConfig?.endpoints as any)?.picks ?? '/picks'
    const apiUrl = `${API_CONFIG.baseUrl}${submitPick}`

    // 4) Call FastAPI and FORWARD identity headers
    const resp = await apiRequest(apiUrl, {
      method: 'POST',
      headers: {
        ...getApiHeaders(),
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': uid,
        'x-user-email': email,
      },
      body: JSON.stringify({
        match_id: payload.match_id,
        bet_category: payload.bet_category,
        bet_name: payload.bet_name,
        bookie: payload.bookie ?? null,
        odd: Number(payload.odd),
        stake: payload.stake != null ? Number(payload.stake) : undefined,
        analysis: payload.analysis ?? null,
        confidence: Number(payload.confidence),
      }),
    })

    const body = await resp.json().catch(() => ({}))
    return NextResponse.json(body, { status: resp.status })
  } catch (error) {
    console.error('Error submitting tip to real API:', error)
    return NextResponse.json(
      { error: 'Failed to submit tip matches', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
