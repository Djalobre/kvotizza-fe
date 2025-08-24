import { NextResponse } from 'next/server'
import type { DailyTicketLeg } from '../../../types/bookies'
import { API_CONFIG, apiRequest } from '../../../lib/api-config'
import { sportsConfigService } from '../../../lib/sports-config'

// 🔴 disables ISR/Next cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()

    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.daily_picks}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    console.log(`Fetching daily picks from API: ${apiUrl}`)

    // Call your real API, disable fetch cache as well
    const response = await apiRequest(apiUrl, { cache: 'no-store' })
    const data = await response.json()

    // Transform your API response
    let dailyPicks: any[] = []
    if (Array.isArray(data)) {
      dailyPicks = data
    } else if (data && typeof data === 'object') {
      dailyPicks = data.data || data.results || data.legs || []
    }
    const dailyPicksData: DailyTicketLeg[] = dailyPicks

    // 🚫 Return with no-cache headers
    return NextResponse.json(dailyPicksData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error fetching daily picks from real API:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch daily picks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    )
  }
}
