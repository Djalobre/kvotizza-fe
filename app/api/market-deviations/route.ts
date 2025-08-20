import { NextResponse } from "next/server"
import type {MarketDeviation } from "../../../types/bookies"
import { API_CONFIG, apiRequest } from "../../../lib/api-config"
import { sportsConfigService } from "../../../lib/sports-config"

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get("sport") || sportsConfigService.getDefaultSport()

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
    // Add date span parameter using the API value from config



    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${'/market-deviations'}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    // Call your real API
    const response = await apiRequest(apiUrl)
    console.log(`Fetching market deviations for ${sport} from API: ${apiUrl}`)
    const data = await response.json()

    // Transform your API response using sport-specific configuration
    let market_deviations: any[] = []

    // Handle different API response formats
    if (Array.isArray(data)) {
      market_deviations = data
    } else if (data && typeof data === "object") {
      market_deviations = data.market_deviations || data.data || data.results || []
    }
    const marketDeviationsData: MarketDeviation[] = market_deviations


    // Return simple array for client-side filtering and pagination
    return NextResponse.json(marketDeviationsData)
  } catch (error) {
    console.error("Error fetching categories from real API:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
