import { NextResponse } from "next/server"
import type { DetailedMatch } from "../../../../types/bookies"
import { API_CONFIG, apiRequest } from "../../../../lib/api-config"
import { sportsConfigService } from "../../../../lib/sports-config"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const matchId = Number.parseInt(params.id)

  // Validate the ID
  if (isNaN(matchId) || matchId <= 0) {
    return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
  }

  try {
    // Get sport and dateSpan from query parameters
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get("sport") || sportsConfigService.getDefaultSport()
    const dateSpan = searchParams.get("dateSpan") || sportsConfigService.getDefaultDateSpan()

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

    // Call your real API with the match ID and date span
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    queryParams.append("sport", sport)
    if (dateSpanConfig.apiValue !== "all") {
      queryParams.append("dateSpan", dateSpanConfig.apiValue)
    }

    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.matchDetails.replace("{id}", matchId.toString())}?${queryParams.toString()}`


    const response = await apiRequest(apiUrl)
    const data = await response.json()

    // Get field mappings for this sport
    const fieldMappings = sportsConfigService.getFieldMappings(sport)

    // Transform your API response to match our DetailedMatch interface
    const transformedData: DetailedMatch = {
      id: sportsConfigService.extractValue(data, fieldMappings.id || ["id"]) || matchId,
      matchup: sportsConfigService.extractValue(data, fieldMappings.matchup || ["matchup"]) || "Unknown Match",
      league: sportsConfigService.extractValue(data, fieldMappings.league || ["league"]) || "Unknown League",

      // Transform odds data - adjust based on your API structure
      odds: data.odds || data.oddsData || [],

      // Transform tips/recommendations data
      tips: (data.tips || data.recommendations || data.predictions || []).map((tip: any) => ({
        type: tip.type || tip.betType || tip.name,
        odd: tip.odd || tip.odds || tip.value || tip.price,
      })),

      // Transform bookmakers/bookies data
      bookies: (data.bookies || data.bookmakers || data.sportsbooks || []).map((bookie: any) => ({
        name: bookie.name || bookie.bookmakerName || bookie.provider,
        categories: (bookie.categories || bookie.markets || bookie.betTypes || []).map((category: any) => ({
          category: category.category || category.marketType || category.name || category.type,
          odds: (category.odds || category.selections || category.bets || []).map((odd: any) => ({
            type: odd.type || odd.selectionName || odd.name || odd.betName,
            value: Number(odd.value || odd.odds || odd.price || odd.decimal),
          })),
        })),
      })),
    }

    // Log the transformation for debugging
    console.log(`Successfully transformed ${sport} match ${matchId} data for ${dateSpanConfig.displayName}:`, {
      sport,
      dateSpan: dateSpanConfig.displayName,
      originalBookies: data.bookies?.length || 0,
      transformedBookies: transformedData.bookies.length,
      originalTips: data.tips?.length || 0,
      transformedTips: transformedData.tips.length,
    })

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error(`Error fetching match ${matchId} from real API:`, error)

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("HTTP 404")) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 })
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json({ error: "Request timeout - API took too long to respond" }, { status: 408 })
      }
    }

    return NextResponse.json(
      {
        error: "Failed to fetch match details",
        message: error instanceof Error ? error.message : "Unknown error",
        matchId: matchId,
      },
      { status: 500 },
    )
  }
}
