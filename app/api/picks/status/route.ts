// app/api/picks/status/route.ts
import { NextResponse } from "next/server"
import type { PickStatus } from "@/types/bookies"
import { API_CONFIG, apiRequest } from "@/lib/api-config"
import { sportsConfigService } from "@/lib/sports-config"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const day = searchParams.get("day") || sportsConfigService.getDefaultDate()

    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    queryParams.set("day", day)

    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.pick_status}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`

    // Call your real API with auth headers
    const response = await apiRequest(apiUrl, {
      method: "GET",
      headers: {
        "x-user-id": String((session.user as any).id),
        "x-user-email": (session.user as any).email,
        "x-user-role": (session.user as any).role || "USER",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const t = await response.text()
      return NextResponse.json({ error: t || "Upstream error" }, { status: response.status })
    }

    const data = await response.json()
    const pickStatusData: PickStatus[] = data

    return NextResponse.json(pickStatusData)
  } catch (error: any) {
    console.error("Error fetching pick status from real API:", error)
    return NextResponse.json(
      { error: "Failed to fetch pick status", message: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
