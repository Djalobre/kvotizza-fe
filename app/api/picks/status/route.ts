import { NextResponse } from 'next/server'
import type { Categories, PickStatus } from '../../../../types/bookies'
import { API_CONFIG, apiRequest } from '../../../../lib/api-config'
import { sportsConfigService } from '../../../../lib/sports-config'

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const day = searchParams.get('day') || sportsConfigService.getDefaultDate()

    // Build query parameters for your API
    const apiConfig = sportsConfigService.getApiConfig()
    const queryParams = new URLSearchParams()
    // Add sport parameter
    queryParams.set('day', day)
    // Add date span parameter using the API value from config

    // Construct the API URL with query parameters
    const apiUrl = `${API_CONFIG.baseUrl}${apiConfig.endpoints.pick_status}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    // Call your real API
    const response = await apiRequest(apiUrl)
    const data = await response.json()

    const pickStatusData: PickStatus[] = data

    // Return simple array for client-side filtering and pagination
    return NextResponse.json(pickStatusData)
  } catch (error) {
    console.error('Error fetching pick Status from real API:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
