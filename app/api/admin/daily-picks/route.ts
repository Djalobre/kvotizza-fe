// app/api/picks/route.ts
import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest, getApiHeaders } from '@/lib/api-config'
import { sportsConfigService } from '@/lib/sports-config'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    console.log('Received payload for daily picks:', payload)

    const apiConfig = sportsConfigService.getApiConfig()
    const dailyPicksEndpoint =
      (apiConfig?.endpoints as any)?.daily_picks_save ?? '/admin/daily-picks'
    const apiUrl = `${API_CONFIG.baseUrl}${dailyPicksEndpoint}`

    const resp = await apiRequest(apiUrl, {
      method: 'POST',
      headers: {
        ...getApiHeaders(),
        'Content-Type': 'application/json',
        // forward identity (middleware injected these)
        'x-user-role': request.headers.get('x-user-role') || '',
        'x-user-id': request.headers.get('x-user-id') || '',
        'x-user-email': request.headers.get('x-user-email') || '',
      },
      body: JSON.stringify({
        pick_date: payload.pick_date,
        legs: payload.legs,
        notes: payload.notes,
      }),
    })

    const body = await resp.json().catch(() => ({}))
    return NextResponse.json(body, { status: resp.status })
  } catch (error) {
    console.error('Error posting daily ticket to real API:', error)
    return NextResponse.json(
      { error: 'Failed to save daily ticket matches' },
      { status: 500 }
    )
  }
}
