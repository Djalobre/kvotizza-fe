export interface Odd {
  type: string
  value: number
  trend: string
}

export interface Category {
  category: string
  odds: Odd[]
}

export interface Bookie {
  name: string
  categories: Category[]
}

// Basic match data for the main table
export interface BasicMatch {
  id: number
  matchup: string
  league: string
  start_time: string
  country_name: string
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
  start_time: string
  bookies: Bookie[]
}


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
  id: string
  matchId: number
  matchup: string
  league: string
  category: string
  type: string
  odds: number
  bookie: string
  isBest?: boolean
}


export interface BonusThreshold {
  minMatches: number
  minOdds: number
  bonusPercentage: number
}

export interface ConditionalBonusThreshold extends BonusThreshold {
  excludeCategories?: string[]
  includeCategories?: string[]
  condition?: "exclude" | "include"
  alternativePercentage?: number
  conditionDescription?: string
}

export interface BookieBonusConfig {
  bookie: string
  displayName: string
  thresholds: (BonusThreshold | ConditionalBonusThreshold)[]
  description: string
  hasConditionalBonuses?: boolean
}

export interface BonusCalculation {
  qualifyingSelections: BetSelection[]
  appliedThreshold: BonusThreshold | ConditionalBonusThreshold | null
  bonusAmount: number
  bonusPercentage: number
  totalQualifyingOdds: number
  conditionMet?: boolean
  conditionDescription?: string
}
