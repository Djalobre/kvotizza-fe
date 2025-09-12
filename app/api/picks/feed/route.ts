// app/api/picks/feed/route.ts
import { NextResponse } from 'next/server'
import { API_CONFIG, apiRequest } from '@/lib/api-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Build query params transparently from client request
    const queryParams = new URLSearchParams(searchParams)

    // Construct API URL
    const apiUrl = `${API_CONFIG.baseUrl}/picks/feed${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    console.log('Proxying to:', apiUrl)

    // Call FastAPI backend
    const response = await apiRequest(apiUrl)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/picks/feed proxy:', error)
    return NextResponse.json({ error: 'Failed to fetch picks feed' }, { status: 500 })
  }
}
