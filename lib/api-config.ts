// API Configuration - Single unified endpoint
export const API_CONFIG = {
    baseUrl:  "https://api.kvotizza.online/api",  
    // Single endpoint that handles all sports
    endpoints: {
      // Basic matches endpoint - sport passed as query parameter
      matches: `https://api.kvotizza.online/api/matches`,

      // Categories endpoint - no sport parameter, returns all categories
      categories: `https://api.kvotizza.online/api/categories`,

      // Detailed match endpoint - sport passed as query parameter
      matchDetails: (matchId: number) =>
        `https://api.kvotizza.online/api/matches/${matchId}`,

    },
  
    // Request configuration
    timeout: 10000,
    retries: 3,
  }
  
  // Helper function to build headers for your API requests
  export const getApiHeaders = () => ({
    "Content-Type": "application/json",
    // Add any other headers your API requires
    // 'X-API-Key': API_CONFIG.apiKey,
    // 'Accept': 'application/json',
  })
  
  // Helper function for API requests with error handling
  export const apiRequest = async (url: string, options: RequestInit = {}) => {
    console.log(`Making API request to: ${url}`)
    const headers = {
      ...getApiHeaders(),
      ...options.headers,
    }
  
    const config: RequestInit = {
      ...options,
      headers,
      // Add timeout using AbortController
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    }
  
    let lastError: Error | null = null
  
    // Retry logic
    for (let attempt = 1; attempt <= API_CONFIG.retries; attempt++) {
      try {
        const response = await fetch(url, config)
  
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
  
        return response
      } catch (error) {
        lastError = error as Error
        console.warn(`API request attempt ${attempt} failed:`, error)
  
        // Don't retry on the last attempt
        if (attempt === API_CONFIG.retries) {
          break
        }
  
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  
    throw lastError || new Error("API request failed after all retries")
  }
  
