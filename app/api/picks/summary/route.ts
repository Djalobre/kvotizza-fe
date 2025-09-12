// app/api/picks/summary/route.ts
import { NextResponse } from "next/server"
import { API_CONFIG, apiRequest } from "@/lib/api-config"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const base = API_CONFIG.baseUrl.replace(/\/$/, "") // ensure no trailing slash
    const url = `${base}/picks/summary`

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
    console.error("Error proxying /picks/summary:", err)
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}
