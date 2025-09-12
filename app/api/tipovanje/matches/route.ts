import { NextResponse } from 'next/server'
import type { Categories } from '../../../../types/bookies'
import { API_CONFIG, apiRequest } from '../../../../lib/api-config'
import { sportsConfigService } from '../../../../lib/sports-config'

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport') || sportsConfigService.getDefaultSport()
    const day = searchParams.get('day') || sportsConfigService.getDefaultDate()
    const leagues = searchParams.get('leagues') || sportsConfigService.getDefaultCompetition()

    // Validate sport
    const sportConfig = sportsConfigService.getSportConfig(sport)
    if (!sportConfig) {
      return NextResponse.json({ error: `Unsupported sport: ${sport}` }, { status: 400 })
    }

    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    // Add sport parameter
    queryParams.append(apiConfig.queryParams.sport, sport)
    queryParams.set('day', day)
    queryParams.set('leagues', leagues)

    // Add date span parameter using the API value from config

    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.tipovanje_matches}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    // Call your real API
    const response = await apiRequest(apiUrl)
    const data = await response.json()

    // Transform your API response using sport-specific configuration
    let filter_matches: any[] = []

    // Handle different API response formats
    if (Array.isArray(data)) {
      filter_matches = data
    } else if (data && typeof data === 'object') {
      filter_matches = data.matches || data.data || data.results || []
    }
    const filterMatchesData: string[] = filter_matches

    // Return simple array for client-side filtering and pagination
    return NextResponse.json(filterMatchesData)
  } catch (error) {
    console.error('Error fetching categories from real API:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch tipovanje leagues data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
