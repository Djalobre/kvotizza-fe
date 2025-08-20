import { NextResponse } from "next/server"
import type { BasicMatch } from "../../../types/bookies"
import { API_CONFIG, apiRequest } from "../../../lib/api-config"
import { sportsConfigService } from "../../../lib/sports-config"

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get("sport") || sportsConfigService.getDefaultSport()
    const date = searchParams.get("date") || sportsConfigService.getDefaultDate()
    const league = searchParams.get("league") || sportsConfigService.getDefaultCompetition()

    // Validate sport
    const sportConfig = sportsConfigService.getSportConfig(sport)
    if (!sportConfig) {
      return NextResponse.json({ error: `Unsupported sport: ${sport}` }, { status: 400 })
    }


    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()

    queryParams.set("sport", sport)
    queryParams.set("date", date)
    queryParams.set("league", league)

    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.matchup_events}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

    // Call your real API
    const response = await apiRequest(apiUrl)
    const data = await response.json()

    // Transform your API response using sport-specific configuration
    let matches: any[] = []

    // Handle different API response formats
    if (Array.isArray(data)) {
      matches = data
    } else if (data && typeof data === "object") {
      matches = data.matches || data.data || data.results || []
    }

    // Return simple array for client-side filtering and pagination
    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error fetching matchup_events from real API:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch matches",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
