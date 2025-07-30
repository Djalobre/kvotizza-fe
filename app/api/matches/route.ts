import { NextResponse } from "next/server"
import type { BasicMatch } from "../../../types/bookies"
import { API_CONFIG, apiRequest } from "../../../lib/api-config"
import { sportsConfigService } from "../../../lib/sports-config"

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get("sport") || sportsConfigService.getDefaultSport()
    const dateSpan = searchParams.get("dateSpan") || sportsConfigService.getDefaultDateSpan()
    const league = searchParams.get("league")
    const search = searchParams.get("search")

    // Validate sport
    const sportConfig = sportsConfigService.getSportConfig(sport)
    if (!sportConfig) {
      return NextResponse.json({ error: `Unsupported sport: ${sport}` }, { status: 400 })
    }

    // Validate date span
    const dateSpanConfig = sportsConfigService.getDateSpanConfig(dateSpan)
    if (!dateSpanConfig) {
      return NextResponse.json({ error: `Unsupported date span: ${dateSpan}` }, { status: 400 })
    }

    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    // Add sport parameter
    queryParams.append(apiConfig.queryParams.sport, sport)
    console.log(apiConfig)
    // Add date span parameter using the API value from config

    queryParams.append(apiConfig.queryParams.dateSpan, dateSpan)

    if (league && league !== "all") queryParams.append(apiConfig.queryParams.league, league)
    if (search) queryParams.append(apiConfig.queryParams.search, search)

    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.matches}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    console.log(`Fetching ${sport} matches for ${dateSpanConfig.displayName} from: ${apiUrl}`)
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

    const transformedMatches: BasicMatch[] = matches.map((match: any) => {
      return sportsConfigService.transformMatchData(match, sport)
    })

    console.log(
      `Successfully transformed ${transformedMatches.length} ${sport} matches for ${dateSpanConfig.displayName}`,
    )

    // Return simple array for client-side filtering and pagination
    return NextResponse.json(transformedMatches)
  } catch (error) {
    console.error("Error fetching matches from real API:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch matches",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Optional: Add POST method for creating matches (if your API supports it)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sport = body.sport || sportsConfigService.getDefaultSport()

    // Validate sport
    const sportConfig = sportsConfigService.getSportConfig(sport)
    if (!sportConfig) {
      return NextResponse.json({ error: `Unsupported sport: ${sport}` }, { status: 400 })
    }

    const apiConfig = sportsConfigService.getApiConfig()
    const response = await apiRequest(`${API_CONFIG.baseUrl}${apiConfig.endpoints.matches}`, {
      method: "POST",
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create match", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
