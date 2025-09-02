import { NextResponse } from 'next/server'
import type { BasicMatch, MatchCand } from '../../../../../types/bookies'
import { API_CONFIG, apiRequest } from '../../../../../lib/api-config'
import { sportsConfigService } from '../../../../../lib/sports-config'
import { exec } from 'child_process'

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport') || sportsConfigService.getDefaultSport()
    const day = searchParams.get('day') || sportsConfigService.getDefaultDate()
    const leaguesArray = searchParams.getAll('leagues')
    const categoriesArray = searchParams.getAll('categories')

    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    // Add sport parameter
    queryParams.append(apiConfig.queryParams.sport, sport)
    console.log(apiConfig)
    // Add date span parameter using the API value from config

    queryParams.set('day', day)
    leaguesArray.forEach((league) => {
      queryParams.append('leagues', league)
    })

    categoriesArray.forEach((category) => {
      queryParams.append('categories', category)
    })

    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.daily_picks_candidates}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    // Call your real API
    const response = await apiRequest(apiUrl)
    const data = await response.json()

    // Transform your API response using sport-specific configuration
    let matchCandidates: any[] = []

    // Handle different API response formats
    if (Array.isArray(data)) {
      matchCandidates = data
    } else if (data && typeof data === 'object') {
      matchCandidates = data.matches || data.data || data.results || []
    }
    const matchCandidatesData: MatchCand[] = matchCandidates

    // Return simple array for client-side filtering and pagination
    return NextResponse.json(matchCandidatesData)
  } catch (error) {
    console.error('Error fetching matches from real API:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch matches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
