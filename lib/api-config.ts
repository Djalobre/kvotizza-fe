// API Configuration - Single unified endpoint
export const API_CONFIG = {
  baseUrl: "https://api.kvotizza.online/api",

  // Single endpoint that handles all sports
  endpoints: {
    // Basic matches endpoint - sport passed as query parameter
    matches: `https://api.kvotizza.online/api/matches`,

    // Categories endpoint - no sport parameter, returns all categories
    categories: `https://api.kvotizza.online/api/categories`,

    market_deviations: `https://api.kvotizza.online/market-deviations`,

    // Daily picks endpoint - no sport parameter, returns all daily picks
    daily_picks: `https://api.kvotizza.online/api/daily-picks`,

    matchup_events: `https://api.kvotizza.online/matchup-events`,

    top_matches: `https://api.kvotizza.online/api/top-matches`,

    daily_picks_candidates: `https://api.kvotizza.online/api/admin/daily-picks/candidates`,

    daily_picks_save: `https://api.kvotizza.online/api/admin/daily-picks`,

    daily_picks_filters: `https://api.kvotizza.online/api/admin/daily-picks/filters`,

    tipovanje_filters: `https://api.kvotizza.online/api/tipovanje/filters`,

    tipovanje_matches: `https://api.kvotizza.online/api/tipovanje/matches`,

    picks: `https://api.kvotizza.online/api/picks`,

    pick_status: `https://api.kvotizza.online/api/picks/status`,

    pick_leaderboard: `https://api.kvotizza.online/api/picks/leaderboard`,

    pick_me_stats: `https://api.kvotizza.online/api/picks/me/stats`,
    // Detailed match endpoint - sport passed as query parameter
    matchDetails: (matchId: number) =>
      `https://api.kvotizza.online/api/matches/${matchId}`,

    matchMarkets: (matchId: number) =>
      `https://api.kvotizza.online/api/tipovanje/match/${matchId}/markets`,
    football_analysis_metrics: `https://api.kvotizza.online/api/football/analysis/metrics`,

    football_analysis_team_statistics: `https://api.kvotizza.online/api/football/analysis/team-statistics`,

    football_analysis_countries: `https://api.kvotizza.online/api/football/analysis/countries`,

    football_analysis_leagues: `https://api.kvotizza.online/api/football/analysis/leagues`,

    football_analysis_recommendations: `https://api.kvotizza.online/api/football/analysis/recommendations`,

    football_analysis_summary: `https://api.kvotizza.online/api/football/analysis/stats/summary`,

    football_analysis_refresh: `https://api.kvotizza.online/api/football/analysis/refresh-metrics`,
  },
  // Request configuration
  timeout: 10000,
  retries: 3,
};
// Helper function to build headers for your API requests
export const getApiHeaders = () => ({
  "Content-Type": "application/json",
  // Add any other headers your API requires
  // 'X-API-Key': API_CONFIG.apiKey,
  // 'Accept': 'application/json',
});

// Helper function for API requests with error handling
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  console.log(`Making API request to: ${url}`);
  const headers = {
    ...getApiHeaders(),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    // Add timeout using AbortController
    signal: AbortSignal.timeout(API_CONFIG.timeout),
  };

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= API_CONFIG.retries; attempt++) {
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`API request attempt ${attempt} failed:`, error);

      // Don't retry on the last attempt
      if (attempt === API_CONFIG.retries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw lastError || new Error("API request failed after all retries");
};
