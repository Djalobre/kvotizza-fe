// app/api/top-matches/route.ts
import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest, getApiHeaders } from '@/lib/api-config'
import { sportsConfigService } from '@/lib/sports-config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Real API endpoint
    const apiConfig = sportsConfigService.getApiConfig()
    const submitPick = (apiConfig?.endpoints as any)?.picks
    const apiUrl = `${API_CONFIG.baseUrl}${submitPick}`
    // console.log(
    //   JSON.stringify({
    //     match_id: payload.match_id,
    //     bet_category: payload.bet_category,
    //     bet_name: payload.bet_name,
    //     bookie: payload.bookie,
    //     odd: payload.odd,
    //     stake: payload.stake,
    //     analysis: payload.analysis,
    //     confidence: payload.confidence,
    //   })
    // )
    // Prosledi payload ka real API-ju
    const resp = await apiRequest(apiUrl, {
      method: 'POST',
      headers: {
        ...getApiHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        match_id: payload.match_id,
        bet_category: payload.bet_category,
        bet_name: payload.bet_name,
        bookie: payload.bookie,
        odd: payload.odd,
        stake: payload.stake,
        analysis: payload.analysis,
        confidence: payload.confidence,
      }),
    })

    // Vrati šta god backend vrati (status + body)
    const body = await resp.json().catch(() => ({}))
    return NextResponse.json(body, { status: resp.status })
  } catch (error) {
    console.error('Error submitting tip to real API:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit tip matches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
