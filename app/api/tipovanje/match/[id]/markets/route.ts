import { NextResponse, NextRequest } from 'next/server'
import type { DetailedMatch } from '../../../../../../types/bookies'
import { API_CONFIG, apiRequest } from '../../../../../../lib/api-config'
import { sportsConfigService } from '../../../../../../lib/sports-config'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(request.url)

  const matchId = Number.parseInt(url.pathname.split('/')[4] || '')

  // Validate the ID
  if (isNaN(matchId) || matchId <= 0) {
    return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 })
  }

  try {
    // Get sport and dateSpan from query parameters
    const { searchParams } = new URL(request.url)

    // Call your real API with the match ID and date span
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()

    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.matchMarkets.replace(
      '{id}',
      matchId.toString()
    )}`

    const response = await apiRequest(apiUrl)
    const data = await response.json()
    console.log(data, `Fetched match ${matchId} data from real API for span:`)
    // Transform your API response using sport-specific configuration
    let tipovanje_match_markets: any[] = []

    // Log the transformation for debugging
    if (Array.isArray(data)) {
      tipovanje_match_markets = data
    } else if (data && typeof data === 'object') {
      tipovanje_match_markets = data.markets || data.data || data.results || []
    }
    const tipovanjeMarketsData: string[] = tipovanje_match_markets

    return NextResponse.json(tipovanjeMarketsData)
  } catch (error) {
    console.error(`Error fetching match ${matchId} from real API:`, error)

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('HTTP 404')) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 })
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout - API took too long to respond' },
          { status: 408 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch match details',
        message: error instanceof Error ? error.message : 'Unknown error',
        matchId: matchId,
      },
      { status: 500 }
    )
  }
}
