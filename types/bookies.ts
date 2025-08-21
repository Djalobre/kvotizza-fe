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

export interface Categories {
  categories: string[];
}

export interface MarketDeviation {
  home_team: string,
  away_team: string,
  competition_name: string,
  bet_name: string,
  odd: number,
  start_time: string,
  bookie: string,
  match_id: number,
  country_name: string,
  sport_name: string,
  avg_odd: number,
  odstupanje: number
}
export interface BetItem {
  key: string;            // e.g. "konacanIshod1"
  bestOdds: number;
  bestBookie: string;
}

export type BetsMap = Record<string, BetItem>;

export interface MatchCarouselProps {
  matches: TopMatches[]
  className?: string
}

export interface MatchOutcome {
  type: string
  odd: number | null
  bookie: string | null
}

export interface TopMatches {
  id: number;
  bets: BetsMap;
  sport: string;
  league: string;
  country: string;
  matchup: string;
  start_time: string;     // ISO 8601 string
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



export interface BetTypeSelection {
  matchId: number
  matchup: string
  league: string
  category: string
  type: string
  odd?: number
  bookie?: string
}
export type DailyTicket = {
  id: number,
  pick_date: string,
  created_at: string,
  legs: DailyTicketLeg[],
  total_odds: number,
  expires_at: string,
  algo_version:string,
  is_manual: boolean,
  published_by: string,
  published_at:string,
  notes: string | null,
}


export type DailyTicketLeg = {
  match_id: number | string;
  odd?: number | string | null;
  bookie?: string | null;
  country_name: string;
  bet_name: string;
  away_team: string;
  home_team: string;
  sport_name?: string;
  start_time?: string;
  bet_category: string;
  competition_name: string;
};

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

export interface Tip {
  type: string
  odd: number
}

export interface OddsEntry {
  [key: string]: number
}

export interface Match {
  id: number
  matchup: string
  league: string
  odds: OddsEntry[]
  tips: Tip[]
  bookies: Bookie[]
  startTime: string // ISO UTC kickoff time
  status: "scheduled" | "live" | "finished" | "postponed"
}

export type BookiesData = Match[]

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


// New type for best odd of day result
export interface BestOddResult {
  matchId: number
  matchup: string
  league: string
  category: string
  type: string
  bookie: string
  odd: number
  marketAvg: number
  improvementPct: number
}



// New type for daily ticket result
export interface DailyTicketResult {
  legs: DailyTicketLeg[]
  totalOdds: number
}
