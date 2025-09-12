import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { API_CONFIG, apiRequest, getApiHeaders } from '@/lib/api-config'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = `${API_CONFIG.baseUrl}/picks/me/stats?period=month`

  const res = await apiRequest(url, {
    method: "GET",
    headers: {
      "x-user-id": String((session.user as any).id),
      "x-user-email": (session.user as any).email,
      "x-user-role": (session.user as any).role || "USER",
    },
    cache: "no-store",
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
