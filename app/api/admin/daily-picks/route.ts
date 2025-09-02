// app/api/top-matches/route.ts
import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest, getApiHeaders } from '@/lib/api-config'
import { sportsConfigService } from '@/lib/sports-config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    // Only allow admins
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = await request.json()

    console.log('Received payload for daily picks:', payload)
    // Real API endpoint
    const apiConfig = sportsConfigService.getApiConfig()
    const dailyPicksEndpoint =
      (apiConfig?.endpoints as any)?.daily_picks_save ?? '/admin/daily-picks'
    const apiUrl = `${API_CONFIG.baseUrl}${dailyPicksEndpoint}`

    // Prosledi payload ka real API-ju
    const resp = await apiRequest(apiUrl, {
      method: 'POST',
      headers: {
        ...getApiHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pick_date: payload.pick_date,
        legs: payload.legs,
        notes: payload.notes,
      }),
    })

    // Vrati šta god backend vrati (status + body)
    const body = await resp.json().catch(() => ({}))
    return NextResponse.json(body, { status: resp.status })
  } catch (error) {
    console.error('Error posting daily ticket to real API:', error)
    return NextResponse.json(
      {
        error: 'Failed to save daily ticket matches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
