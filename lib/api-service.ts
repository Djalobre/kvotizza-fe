import {
  buildQS,
  CompetitionSummary,
  MyStatsPayload,
  type BasicMatch,
  type DailyTicketLeg,
  type DetailedMatch,
  type FeedSort,
  type LeaderboardData,
  type MarketDeviation,
  type MatchCand,
  type PicksFeed,
  type PickStatus,
  type TopMatches,
} from '../types/bookies'
import { sportsConfigService } from '../services/sports-config-service' // Declare the variable before using it
import { Market, Match } from '@/components/tip-submission-form'

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

  async getMarketDeviations(sport?: string): Promise<MarketDeviation[]> {
    try {
      const params = new URLSearchParams()

      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }

      const response = await fetch(`/api/market-deviations?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(
          `Failed to fetch market deviations: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error('Error in getMarketDeviations:', error)
      throw error
    }
  }

  async getTopMatches(date?: string): Promise<TopMatches[]> {
    try {
      const params = new URLSearchParams()
      const eventDate = date || sportsConfigService.getDefaultDate()
      params.append('date', eventDate)
      // Always add sport parameter

      const response = await fetch(`/api/top-matches?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(
          `Failed to fetch market deviations: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error('Error in getMarketDeviations:', error)
      throw error
    }
  }

  async getMatchupEvents(sport: string, date: string, leagues: string[]): Promise<BasicMatch[]> {
    try {
      const params = new URLSearchParams()

      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }

      if (leagues.length > 1) {
        leagues.forEach((league) => params.append('leagues', league))
      } else if (leagues.length === 1) {
        params.append('leagues', leagues[0])
      }
      // Always add dateSpan parameter - use default if not provided
      const eventDate = date || sportsConfigService.getDefaultDate()
      params.append('date', eventDate)

      // Add other optional parameters
      const response = await fetch(`/api/matchup-events?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch matchup events: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || data.legs || []
      }

      return []
    } catch (error) {
      console.error('Error in matchupEvents:', error)
      throw error
    }
  }

  async getCategories(sport?: string): Promise<string[]> {
    try {
      const params = new URLSearchParams()

      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }
      const response = await fetch(`/api/categories?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error('Error in getCategories:', error)
      throw error
    }
  }

  async getDailyPicks(date?: string): Promise<DailyTicketLeg[]> {
    try {
      const params = new URLSearchParams()

      const eventDate = date || sportsConfigService.getDefaultDate()
      params.append('date', eventDate)

      const response = await fetch(`/api/daily-picks?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch daily picks: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || data.legs || []
      }

      return []
    } catch (error) {
      console.error('Error in getDailyTicket:', error)
      throw error
    }
  }

  async getBettingCompetitionFilters(sport?: string, day?: string): Promise<string[]> {
    try {
      const params = new URLSearchParams()

      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }

      if (day) {
        params.append('day', day)
      }

      const response = await fetch(`/api/tipovanje/filters?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch league filters: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.leagues || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error('Error in getBettingCompetitionFilters:', error)
      throw error
    }
  }

  async getBettingCompetitionMatchesForDay(
    sport?: string,
    day?: string,
    leagues?: string
  ): Promise<Match[]> {
    try {
      const params = new URLSearchParams()

      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }

      if (day) {
        params.append('day', day)
      }

      if (leagues) {
        params.append('leagues', leagues)
      }

      const response = await fetch(`/api/tipovanje/matches?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch league matches: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error('Error in getBettingCompetitinoMatchesForDay:', error)
      throw error
    }
  }

  // Fetch basic matches data with sport parameter (simplified for client-side filtering)
  async getMatches(
    sport?: string,
    options?: {
      dateSpan?: string
      league?: string
      search?: string
    }
  ): Promise<BasicMatch[]> {
    try {
      const params = new URLSearchParams()

      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }

      // Always add dateSpan parameter - use default if not provided
      const dateSpan = options?.dateSpan || sportsConfigService.getDefaultDateSpan()
      params.append('dateSpan', dateSpan)

      // Add other optional parameters
      if (options?.league) params.append('league', options.league)
      if (options?.search) params.append('search', options.search)

      const response = await fetch(`/api/matches?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error('Error in getMatches:', error)
      throw error
    }
  }

  async getBettingCompetitionMatchMarkets(matchId: number): Promise<Market[]> {
    try {
      const params = new URLSearchParams()

      const response = await fetch(`/api/tipovanje/match/${matchId}/markets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Match not found')
        }
        throw new Error(`Failed to fetch match details: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in getBettingCompetitionMatchMarkets for match ${matchId}:`, error)
      throw error
    }
  }

  // Fetch detailed match data by ID with sport parameter
  async getMatchDetails(
    matchId: number,
    sport?: string,
    dateSpan?: string
  ): Promise<DetailedMatch> {
    try {
      const params = new URLSearchParams()
      if (sport) params.append('sport', sport)
      if (dateSpan) params.append('dateSpan', dateSpan)

      const response = await fetch(`/api/matches/${matchId}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Match not found')
        }
        throw new Error(`Failed to fetch match details: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      return data;
    } catch (error) {
      console.error(`Error in getMatchDetails for match ${matchId}:`, error)
      throw error
    }
  }

  // Optional: Add methods for filtering matches by various criteria
  async getMatchesByLeague(
    league: string,
    sport?: string,
    dateSpan?: string
  ): Promise<BasicMatch[]> {
    try {
      const params = new URLSearchParams()
      params.append('league', league)
      if (sport) params.append('sport', sport)
      if (dateSpan) params.append('dateSpan', dateSpan)

      const response = await fetch(`/api/matches?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch matches by league')

      const data = await response.json()
      return Array.isArray(data) ? data : data.matches || data.data || []
    } catch (error) {
      console.error('Error in getMatchesByLeague:', error)
      throw error
    }
  }

  async searchMatches(query: string, sport?: string, dateSpan?: string): Promise<BasicMatch[]> {
    try {
      const params = new URLSearchParams()
      params.append('search', query)
      if (sport) params.append('sport', sport)
      if (dateSpan) params.append('dateSpan', dateSpan)

      const response = await fetch(`/api/matches?${params.toString()}`)
      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      return Array.isArray(data) ? data : data.matches || data.data || []
    } catch (error) {
      console.error('Error in searchMatches:', error)
      throw error
    }
  }

  async loadFilters(sport: string, day: string): Promise<any> {
    try {
      const params = new URLSearchParams()
      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }

      if (day) {
        params.append('day', day)
      }
      const res = await fetch(`/api/admin/daily-picks/filters?${params.toString()}`)
      const data = await res.json()
      console.log('Filters data:', data)

      return data
    } catch (error) {
      console.error('Error in get filters:', error)
      throw error
    }
  }

  async getCandidates(
    sport: string,
    day: string,
    leagues: string[],
    betCategories: string[]
  ): Promise<MatchCand[]> {
    try {
      const params = new URLSearchParams()
      // Always add sport parameter
      if (sport) {
        params.append('sport', sport)
      }
      if (day) {
        params.append('day', day)
      }
      if (leagues.length > 1) {
        leagues.forEach((league) => params.append('leagues', league))
      } else if (leagues.length === 1) {
        params.append('leagues', leagues[0])
      }

      if (betCategories.length > 1) {
        betCategories.forEach((betCategory) => params.append('categories', betCategory))
      } else if (betCategories.length === 1) {
        params.append('categories', betCategories[0])
      }

      const res = await fetch(`/api/admin/daily-picks/candidates?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        return data
      } else if (data && typeof data === 'object') {
        return data.matches || data.data || data.results || []
      }

      return []
    } catch (error) {
      console.error('Error in get candidates:', error)
      throw error
    }
  }

  async getMyPickStatus(day: string | Date, signal?: AbortSignal): Promise<PickStatus> {
    try {
      // Accept either "YYYY-MM-DD" or a Date
      const belgradeDay =
        typeof day === 'string'
          ? day
          : new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Europe/Belgrade',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(day)

      const params = new URLSearchParams()
      params.append('day', belgradeDay)

      const res = await fetch(`/api/picks/status?${params.toString()}`, {
        signal,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Failed to fetch tip status (${res.status}): ${text}`)
      }

      const data = await res.json()
      // Normalize possible variants just in case (hasPick vs hasTip)
      return {
        hasPick: Boolean(data?.hasPick ?? data?.hasTip ?? data?.has_pick ?? false),
        pick: data?.pick ?? null,
      }
    } catch (error) {
      console.error('Error in getMyTipStatus:', error)
      throw error
    }
  }

  async getLeaderboardData(query: string): Promise<LeaderboardData> {
    try {
      // Accept either "YYYY-MM-DD" or a Date

      const res = await fetch(`/api/picks/leaderboard?${query}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      return await res.json()
    } catch (error) {
      console.error('Error in getMyTipStatus:', error)
      throw error
    }
  }

  async getTipsFeed(
    params: {
      day?: string // YYYY-MM-DD
      period?: 'day' | 'week' | 'month'
      leagues?: string[] // repeatable
      categories?: string[] // repeatable
      statuses?: PickStatus[] // repeatable
      sort?: FeedSort
      limit?: number
      offset?: number
    } = {}
  ): Promise<PicksFeed> {
    const qs = buildQS(params)
    const res = await fetch(`/api/picks/feed${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  saveTopMatches = async (body: {
    pick_date: string
    sport: string
    created_by: string
    matches: any[]
  }) => {
    await fetch(`/api/top-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  saveTicket = async (body: { pick_date: string; legs: any[]; notes: string }) => {
    const res = await fetch('/api/admin/daily-picks/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pick_date: body.pick_date,
        legs: body.legs,
        notes: body.notes,
      }),
    })
    console.log(JSON.stringify({ body }), 'this is respooonsee')
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(`Save failed: ${j.detail || res.statusText}`)
      return
    }
    const j = await res.json()
    alert(`Saved daily ticket id=${j.id}, total_odds=${j.total_odds.toFixed(2)}`)
  }

  async getMyStats(period: 'month' | 'week' | 'all' = 'month'): Promise<MyStatsPayload> {
    const res = await fetch(`/api/picks/me/stats?period=${period}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  submitTip = async (body: {
    match_id: number
    bet_category: string
    bet_name: string
    bookie: string
    odd: number
    analysis: string
    stake: number
    confidence: number
  }) => {
    try {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        return { ok: false, error: j.detail || res.statusText }
      }

      const j = await res.json()
      return { ok: true, data: j }
    } catch (err: any) {
      return { ok: false, error: err.message || 'Unknown error' }
    }
  }

  async getCompetitionSummary(): Promise<CompetitionSummary> {
    const res = await fetch('/api/picks/summary', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance()
