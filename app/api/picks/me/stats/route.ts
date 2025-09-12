// app/api/picks/me-stats/route.ts
import { NextResponse } from "next/server"
import { API_CONFIG, apiRequest } from "@/lib/api-config"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") ?? "month"

    const path = `/picks/me/stats?period=${encodeURIComponent(period)}`
    const url = `${API_CONFIG.baseUrl}${path}`

    console.log("Fetching me-stats from:", url)

    const res = await apiRequest(url, {
      method: "GET",
      headers: {
        "x-user-id": String((session.user as any).id),
        "x-user-email": (session.user as any).email,
        "x-user-role": (session.user as any).role || "USER",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: t || "Upstream error" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error("me-stats proxy error:", err)
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
