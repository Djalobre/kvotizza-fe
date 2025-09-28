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
