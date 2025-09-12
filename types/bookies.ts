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
  categories: string[]
}
export interface BookieOdd {
  bookie: string
  odd: number
}
export interface MarketDeviation {
  home_team: string
  away_team: string
  competition_name: string
  bet_name: string
  odd: number
  start_time: string
  bookie: string
  match_id: number
  country_name: string
  sport_name: string
  avg_odd: number
  odstupanje: number
  allOdds: BookieOdd[]
}
export interface BetItem {
  key: string // e.g. "konacanIshod1"
  bestOdds: number
  bestBookie: string
}

export type BetsMap = Record<string, BetItem>

export interface MatchCarouselProps {
  matches: TopMatches[]
  className?: string
}

export interface MatchOutcome {
  type: string
  odd: number | null
  bookie: string | null
}

export type Market = {
  bet_category: string
  bet_name: string
  odd: number
  bookie: string
  avg_other?: number | null
  market_diff_pct?: number | null
}

export type MatchCand = {
  match_id: number
  home_team: string
  away_team: string
  competition_name: string
  sport_name: string
  country_name: string
  start_time: string
  markets: Market[]
}

export type Leg = {
  odd: number
  bookie: string
  bet_name: string
  match_id: number
  avg_other?: number | null
  away_team: string
  home_team: string
  sport_name: string
  start_time: string
  bet_category: string
  country_name: string
  market_diff_pct?: number | null
  competition_name: string
}

export interface TopMatches {
  id: number
  bets: BetsMap
  sport: string
  league: string
  country: string
  matchup: string
  start_time: string // ISO 8601 string
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
  id: number
  pick_date: string
  created_at: string
  legs: DailyTicketLeg[]
  total_odds: number
  expires_at: string
  algo_version: string
  is_manual: boolean
  published_by: string
  published_at: string
  notes: string | null
}
export function buildQS(params: Record<string, any>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    if (Array.isArray(v)) v.forEach((x) => q.append(k, String(x)))
    else q.set(k, String(v))
  })
  return q.toString()
}
export interface PickStatus {
  hasPick: boolean
  pick: { id: number; submitted_at: string; day_belgrade?: string } | null
}

export type TipStatus = 'pending' | 'won' | 'lost' | 'void'
export type FeedSort = 'newest' | 'popular' | 'highest-odds' | 'highest-confidence'

export type LeaderboardRow = {
  rank: number
  user: { id: number; name: string; initials: string; verified: boolean }
  points: number
  stats: {
    tips: number
    wins: number
    success_pct: number
    roi_pct: number
    avg_odds: number
    streak_win: number
  }
}

export type LeaderboardData = {
  competition_id: number
  period: { start: string; end: string }
  rows: LeaderboardRow[]
}

export type PicksFeed = { rows: PickRow[] } | PickRow[]

export type MyStatsPayload = {
  user: { name: string; avatar: string; verified: boolean }
  currentRank: number | null
  totalPlayers: number | null
  points: number
  monthlyStats: {
    totalTips: number
    wonTips: number
    lostTips: number
    winRate: number
    roi: number
    avgOdds: number
    totalStake: number
    totalReturn: number
    profit: number
    currentStreak: number
    bestStreak: number
  }
  recentTips: Array<{
    match: string
    result: 'won' | 'lost' | 'void'
    odds: number
    profit: number
  }>
  achievements: Array<{ name: string; icon: string; unlocked: boolean }>
}

export type CompetitionSummary = {
  title: string
  competition_id: number
  starts_at: string
  ends_at: string
  days: {
    left: number
    total: number
    progress_pct: number
  }
  participants: number
  active_tips: number
  total_prize_eur: number
  prizes: { place: number; label: string }[]
}

export type PickRow = {
  id: number
  user_id: number
  user_name?: string | null
  user_verified?: boolean | null

  competition_id: number
  match_id: number

  // MATCH META: now comes from feed directly (snapshot)
  home_team: string
  away_team: string
  competition_name: string
  sport_name: string
  start_time: string // ISO

  // pick details
  bet_category: string
  bet_name: string
  bookie?: string | null
  odd: number
  stake?: number | null
  confidence?: number | null
  analysis?: string | null
  status: 'pending' | 'won' | 'lost' | 'void'
  points?: number | null
  submitted_at: string // ISO
}

export type Props = {
  period?: 'month' | 'all'
  start?: string // 'YYYY-MM-DD' (overrides period if both start & end are present)
  end?: string // 'YYYY-MM-DD'
  limit?: number
}

export type DailyTicketLeg = {
  match_id: number | string
  odd?: number | string | null
  bookie?: string | null
  country_name: string
  bet_name: string
  away_team: string
  home_team: string
  sport_name?: string
  start_time?: string
  bet_category: string
  competition_name: string
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
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
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
  condition?: 'exclude' | 'include'
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
