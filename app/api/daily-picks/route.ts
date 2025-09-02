import { NextResponse } from 'next/server'
import type { DailyTicket, DailyTicketLeg, MarketDeviation } from '../../../types/bookies'
import { API_CONFIG, apiRequest } from '../../../lib/api-config'
import { sportsConfigService } from '../../../lib/sports-config'

export async function GET(request: Request) {
  try {
    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    // Add sport parameter
    // Add date span parameter using the API value from config

    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.daily_picks}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    console.log(`Fetching daily picks from API: ${apiUrl}`)
    // Call your real API
    console.log(apiUrl, 'APisadidasiiadsiadsiiasiad')

    const response = await apiRequest(apiUrl)
    const data = await response.json()

    // Transform your API response using sport-specific configuration
    let dailyPicks: any[] = []

    // Handle different API response formats
    if (Array.isArray(data)) {
      dailyPicks = data
    } else if (data && typeof data === 'object') {
      dailyPicks = data.data || data.results || data.legs || []
    }
    const dailyPicksData: DailyTicketLeg[] = dailyPicks

    // Return simple array for client-side filtering and pagination
    return NextResponse.json(dailyPicksData)
  } catch (error) {
    console.error('Error fetching daily picks from real API:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch picks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
