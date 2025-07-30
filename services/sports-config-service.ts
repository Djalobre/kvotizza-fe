import sportsConfigData from "../app/config/sports-config.json"

export interface QuickMarket {
  key: string
  category: string
  type: string
  displayName: string
  apiMappings: {
    odds: string[]
    bookie: string[]
  }
}

export interface SportConfig {
  name: string
  displayName: string
  quickMarkets: QuickMarket[]
  fieldMappings: {
    [key: string]: string[]
  }
}

export interface DateSpan {
  key: string
  displayName: string
  description: string
  apiValue: string
}

export interface SportsConfig {
  sports: {
    [key: string]: SportConfig
  }
  defaultSport: string
  apiConfig: {
    endpoints: {
      matches: string
      matchDetails: string
    }
    queryParams: {
      [key: string]: string
    }
  }
  dateSpans: {
    [key: string]: DateSpan
  }
  defaultDateSpan: string
}

class SportsConfigService {
  private static instance: SportsConfigService
  private config: SportsConfig

  private constructor() {
    this.config = sportsConfigData as SportsConfig
  }

  static getInstance(): SportsConfigService {
    if (!SportsConfigService.instance) {
      SportsConfigService.instance = new SportsConfigService()
    }
    return SportsConfigService.instance
  }

  // Get all available sports
  getSports(): { [key: string]: SportConfig } {
    return this.config.sports
  }

  // Get configuration for a specific sport
  getSportConfig(sport: string): SportConfig | null {
    return this.config.sports[sport] || null
  }

  // Get quick markets for a sport
  getQuickMarkets(sport: string): QuickMarket[] {
    const sportConfig = this.getSportConfig(sport)
    return sportConfig?.quickMarkets || []
  }

  // Get field mappings for a sport
  getFieldMappings(sport: string): { [key: string]: string[] } {
    const sportConfig = this.getSportConfig(sport)
    return sportConfig?.fieldMappings || {}
  }

  // Get default sport
  getDefaultSport(): string {
    return this.config.defaultSport
  }

  // Get API configuration
  getApiConfig() {
    return this.config.apiConfig
  }

  // Helper function to extract value from nested object using dot notation
  extractValue(obj: any, paths: string[]): any {
    for (const path of paths) {
      try {
        // Handle special case for concatenated fields like "homeTeam|vs|awayTeam"
        if (path.includes("|")) {
          const parts = path.split("|")
          if (parts.length === 3 && parts[1] === "vs") {
            const homeValue = this.getNestedValue(obj, parts[0])
            const awayValue = this.getNestedValue(obj, parts[2])
            if (homeValue && awayValue) {
              return `${homeValue} vs ${awayValue}`
            }
          }
          continue
        }

        const value = this.getNestedValue(obj, path)
        if (value !== undefined && value !== null) {
          return value
        }
      } catch (error) {
        // Continue to next path if this one fails
        continue
      }
    }
    return null
  }

  // Helper to get nested value using dot notation
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  // Transform API response based on sport configuration
  transformMatchData(rawData: any, sport: string): any {
    const fieldMappings = this.getFieldMappings(sport)
    const quickMarkets = this.getQuickMarkets(sport)

    const transformed: any = {
      id: this.extractValue(rawData, fieldMappings.id || ["id"]),
      matchup: this.extractValue(rawData, fieldMappings.matchup || ["matchup"]),
      league: this.extractValue(rawData, fieldMappings.league || ["league"]),
      start_time: this.extractValue(rawData, fieldMappings.start_time || ["start_time"]),
      quickMarkets: {},
    }

    // Transform quick markets
    quickMarkets.forEach((market) => {
      const odds = this.extractValue(rawData, market.apiMappings.odds)
      const bookie = this.extractValue(rawData, market.apiMappings.bookie)

      if (odds && bookie) {
        transformed.quickMarkets[market.key] = {
          bestOdds: typeof odds === "object" ? odds.odds || odds.value : odds,
          bestBookie: typeof bookie === "object" ? bookie.name || bookie : bookie,
        }
      } else {
        transformed.quickMarkets[market.key] = null
      }
    })

    return transformed
  }

  // Get available sports list for UI
  getSportsList(): Array<{ key: string; name: string; displayName: string }> {
    return Object.entries(this.config.sports).map(([key, config]) => ({
      key,
      name: config.name,
      displayName: config.displayName,
    }))
  }

  // Get all available date spans
  getDateSpans(): { [key: string]: DateSpan } {
    return this.config.dateSpans || {}
  }

  // Get configuration for a specific date span
  getDateSpanConfig(dateSpan: string): DateSpan | null {
    return this.config.dateSpans?.[dateSpan] || null
  }

  // Get default date span
  getDefaultDateSpan(): string {
    return this.config.defaultDateSpan || "next7days"
  }

  // Get available date spans list for UI
  getDateSpansList(): Array<{ key: string; displayName: string; description: string; apiValue: string }> {
    return Object.entries(this.config.dateSpans || {}).map(([key, config]) => ({
      key,
      displayName: config.displayName,
      description: config.description,
      apiValue: config.apiValue,
    }))
  }
}

export const sportsConfigService = SportsConfigService.getInstance()
