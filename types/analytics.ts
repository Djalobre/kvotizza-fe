export interface AnalysisMetric {
  value: string;
  label: string;
  category: string;
}

export interface LeagueOption {
  country: string;
  tournament: string;
}

export interface MatchRecommendation {
  rank: number;
  match: string;
  league: string;
  country: string;
  date: string;
  round?: string;
  home_pct: number;
  away_pct: number;
  combined_pct: number;
  avg_matches: number;
  confidence: string;
}

export interface RecommendationsResponse {
  analysis_type: string;
  analysis_label: string;
  filters: {
    countries: string[] | null;
    leagues: string[] | null;
    date_from: string | null;
    date_to: string | null;
    min_matches: number;
    min_score: number;
  };
  data: MatchRecommendation[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TeamStatMetric {
  count: number;
  total: number;
  percentage: number;
}

export interface TeamStatistic {
  team: string;
  league: string;
  country: string;
  total_matches: number;
  over_2_5_ft: TeamStatMetric;
  btts_ft: TeamStatMetric;
  over_1_5_fh: TeamStatMetric;
  clean_sheets: TeamStatMetric;
}

export type GetTeamStatisticsParams = {
  countries?: string[];
  leagues?: string[];
  dateFrom?: string;
  dateTo?: string;
  minMatches?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
};

export interface TeamStatisticsResponse {
  data: TeamStatistic[];
  total_count: number;
  total_pages: number;
  filters: {
    countries: string[] | null;
    leagues: string[] | null;
    min_matches: number;
  };
}
export interface TeamFormStatistic {
  rank: number;
  team: string;
  league: string;
  country: string;
  matches_hit: number; // e.g., 4
  matches_total: number; // e.g., 5
  percentage: number; // e.g., 80.0
}

export interface TeamFormResponse {
  data: TeamFormStatistic[];
  total_teams: number;
  average_percentage: number;
  best_percentage: number;
  above_70_count: number;
  filters: {
    criterion: string;
    last_n_matches: number;
    countries?: string[];
    leagues?: string[];
    date_from?: string;
    date_to?: string;
    min_percentage: number;
  };
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SummaryStats {
  fixtures: {
    total_countries: number;
    total_leagues: number;
    total_fixtures: number;
    earliest_fixture: string | null;
    latest_fixture: string | null;
  };
  metrics: {
    total_teams: number;
    avg_matches_per_team: number;
    last_update: string | null;
  };
}
// New types for form analysis
export interface MatchResult {
  opponent: string;
  homeAway: "home" | "away";
  result: "W" | "D" | "L";
  goalsFor: number;
  goalsAgainst: number;
  totalGoals: number;
  over15: boolean;
  over25: boolean;
  over35: boolean;
  btts: boolean;
  cleanSheet: boolean;
}

export interface TeamFormHistory {
  team: string;
  league: string;
  recentMatches: MatchResult[];
}

export type FormCriteriaType =
  | "over15"
  | "over25"
  | "over35"
  | "btts"
  | "cleanSheet"
  | "win"
  | "goalsFor2+"
  | "goalsFor3+";
