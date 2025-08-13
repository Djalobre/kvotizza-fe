import type { BasicMatch, DetailedMatch } from "../types/bookies"
import { sportsConfigService } from "../services/sports-config-service" // Declare the variable before using it

// Client-side API service
export class ApiService {
  private static instance: ApiService

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  // Fetch basic matches data with sport parameter (simplified for client-side filtering)
  async getMatches(
    sport?: string,
    options?: {
      dateSpan?: string
      league?: string
      search?: string
    },
  ): Promise<BasicMatch[]> {
    try {
      const params = new URLSearchParams()

      // Always add sport parameter
      if (sport) {
        params.append("sport", sport)
      }

      // Always add dateSpan parameter - use default if not provided
      const dateSpan = options?.dateSpan || sportsConfigService.getDefaultDateSpan()
      params.append("dateSpan", dateSpan)

      // Add other optional parameters
      if (options?.league) params.append("league", options.league)
      if (options?.search) params.append("search", options.search)


      const response = await fetch(`/api/matches?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === "object") {
        return data.matches || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error("Error in getMatches:", error)
      throw error
    }
  }

  // Fetch detailed match data by ID with sport parameter
  async getMatchDetails(matchId: number, sport?: string, dateSpan?: string): Promise<DetailedMatch> {
    try {
      const params = new URLSearchParams()
      if (sport) params.append("sport", sport)
      if (dateSpan) params.append("dateSpan", dateSpan)

      const response = await fetch(`/api/matches/${matchId}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Match not found")
        }
        throw new Error(`Failed to fetch match details: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Error in getMatchDetails for match ${matchId}:`, error)
      throw error
    }
  }

  // Optional: Add methods for filtering matches by various criteria
  async getMatchesByLeague(league: string, sport?: string, dateSpan?: string): Promise<BasicMatch[]> {
    try {
      const params = new URLSearchParams()
      params.append("league", league)
      if (sport) params.append("sport", sport)
      if (dateSpan) params.append("dateSpan", dateSpan)

      const response = await fetch(`/api/matches?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch matches by league")

      const data = await response.json()
      return Array.isArray(data) ? data : data.matches || data.data || []
    } catch (error) {
      console.error("Error in getMatchesByLeague:", error)
      throw error
    }
  }

  async searchMatches(query: string, sport?: string, dateSpan?: string): Promise<BasicMatch[]> {
    try {
      const params = new URLSearchParams()
      params.append("search", query)
      if (sport) params.append("sport", sport)
      if (dateSpan) params.append("dateSpan", dateSpan)

      const response = await fetch(`/api/matches?${params.toString()}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      return Array.isArray(data) ? data : data.matches || data.data || []
    } catch (error) {
      console.error("Error in searchMatches:", error)
      throw error
    }
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance()
