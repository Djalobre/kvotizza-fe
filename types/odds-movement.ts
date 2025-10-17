export interface OddsEvent {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  competition_name: string;
  country_name: string;
  bookie: string;
  bet_category: string;
  bet_name: string;
  odd: number;
  match_status: string;
  updated_at: string;
  is_active: boolean;
  trend: "up" | "down" | "stable";
}

export interface OddsHistory {
  match_id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  competition_name: string;
  country_name: string;
  bookie: string;
  bet_category: string;
  bet_name: string;
  history: {
    bookie: string;
    timestamp: string;
    odd: number;
    trend: "up" | "down" | "stable";
  }[];
}

export interface OddsChange {
  match_id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  competition_name: string;
  country_name: string;
  bookie: string;
  bet_category: string;
  bet_name: string;
  opening_odd: number;
  current_odd: number;
  change_amount: number;
  change_percent: number;
  trend: "up" | "down";
  updated_at: string;
}

export interface OddsMovementFilter {
  countries: string[];
  leagues: string[];
  betCategories: string[];
  bookies: string[];
  dateFrom: string;
  dateTo: string;
  dateRange: "today" | "tomorrow" | "week" | "all";
  minChange: number;
  showOnlyActive: boolean;
  maxCurrentOdd?: number;
}
