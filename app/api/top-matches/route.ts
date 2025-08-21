// app/api/top-matches/route.ts
import { NextResponse } from "next/server"
import { API_CONFIG, apiRequest, getApiHeaders } from "@/lib/api-config"
import { sportsConfigService } from "@/lib/sports-config"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TopMatches } from "@/types/bookies";

// ——— Tipovi (opciono, zbog boljeg DX) ———
type BetItem = {
  bestOdds: number
  bestBookie: string
  key?: string
}
type TopMatchIn = {
  id: number
  matchup: string
  league: string
  country?: string | null
  start_time: string // ISO
  sport: string
  bets: Record<string, BetItem> // npr. "Konačan ishod 1": {...}
}
type TopMatchesIn = {
  pick_date: string // "YYYY-MM-DD"
  sport?: string
  created_by?: string
  matches: TopMatchIn[]
}

export async function POST(request: Request) {
  
  try {
    const session = await getServerSession(authOptions);
    // Only allow admins
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = (await request.json()) as TopMatchesIn

    // ——— Minimalna validacija ———
    if (!payload?.pick_date) {
      return NextResponse.json({ error: "pick_date is required" }, { status: 400 })
    }
    if (!Array.isArray(payload.matches) || payload.matches.length === 0) {
      return NextResponse.json({ error: "matches must be a non-empty array" }, { status: 400 })
    }

    // Real API endpoint
    const apiConfig = sportsConfigService.getApiConfig()
    const topMatchesEndpoint =
      (apiConfig?.endpoints as any)?.top_matches ?? "/top-matches"
    const apiUrl = `${API_CONFIG.baseUrl}${topMatchesEndpoint}`
    console.log(JSON.stringify({
      pick_date: payload.pick_date,
      sport: payload.sport,
      created_by: payload.created_by ?? "system",
      matches: payload.matches,
    }))
    // Prosledi payload ka real API-ju
    const resp = await apiRequest(apiUrl, {
      method: "POST",
      headers: {
        ...getApiHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pick_date: payload.pick_date,
        sport: payload.sport,
        created_by: payload.created_by ?? "system",
        matches: payload.matches,
      }),
    })

    // Vrati šta god backend vrati (status + body)
    const body = await resp.json().catch(() => ({}))
    return NextResponse.json(body, { status: resp.status })
  } catch (error) {
    console.error("Error posting top matches to real API:", error)
    return NextResponse.json(
      {
        error: "Failed to save top matches",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
    

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || sportsConfigService.getDefaultDate()



    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    // Add sport parameter
    queryParams.set("date", date)

    // Add date span parameter using the API value from config



    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${'/top-matches'}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    console.log(apiUrl, "Fetching top matches from API")
    // Call your real API
    const response = await apiRequest(apiUrl)
    const data = await response.json()

    // Transform your API response using sport-specific configuration
    let top_matches: any[] = []

    // Handle different API response formats
    if (Array.isArray(data)) {
      top_matches = data
    } else if (data && typeof data === "object") {
      top_matches = data.matches || data.data || data.results || []
    }
    const topMatchesData: TopMatches[] = top_matches


    // Return simple array for client-side filtering and pagination
    return NextResponse.json(topMatchesData)
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