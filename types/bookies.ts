export interface Odd {
  type: string
  value: number
}

export interface Category {
  category: string
  odds: Odd[]
}

export interface Bookie {
  name: string
  categories: Category[]
}

export interface Tip {
  type: string
  odd: number
}

export interface OddsEntry {
  [key: string]: number
}

// Basic match data for the main table
export interface BasicMatch {
  id: number
  matchup: string
  league: string
  start_time: string
  country: string
  // Configurable markets with best odds for quick display
  quickMarkets: {
    [key: string]: {
      bestOdds: number
      bestBookie: string
    } | null
  }
}

// Detailed match data for expanded rows
export interface DetailedMatch {
  id: number
  matchup: string
  league: string
  odds: OddsEntry[]
  tips: Tip[]
  bookies: Bookie[]
}

export type BasicMatchesData = BasicMatch[]

// Legacy interface for backward compatibility
export interface Match extends DetailedMatch {}
export type BookiesData = Match[]

// Updated interfaces for bet type selections (not specific bookie odds)
export interface BetTypeSelection {
  matchId: number
  matchup: string
  league: string
  category: string
  type: string
}

export interface BookieOddsComparison {
  bookie: string
  odds: number | null
  available: boolean
}

export interface BetAnalysisResult {
  selection: BetTypeSelection
  bookieOdds: BookieOddsComparison[]
  bestOdds: number
  bestBookie: string
}

export interface BookieSummary {
  bookie: string
  totalOdds: number
  potentialWin: number
  availableSelections: number
  missingSelections: BetTypeSelection[]
  allAvailable: boolean
}

export interface BetSelection {
  matchId: number
  matchup: string
  bookie: string
  category: string
  type: string
  odds: number
}
