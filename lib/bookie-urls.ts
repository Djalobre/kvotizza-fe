// Centralized bookie URL management
export interface BookieUrlConfig {
  name: string
  baseUrl: string
  affiliateId?: string
  trackingParams?: Record<string, string>
  deepLinkSupport?: boolean
}

// Configuration for all supported bookies
export const BOOKIE_CONFIGS: Record<string, BookieUrlConfig> = {
  Mozzartbet: {
    name: 'Mozzartbet',
    baseUrl: 'https://www.mozzartbet.com',
    affiliateId: 'kvotizza123',
    trackingParams: {
      utm_source: 'kvotizza',
      utm_medium: 'referral',
      utm_campaign: 'daily_ticket',
    },
    deepLinkSupport: true,
  },
  Superbet: {
    name: 'Superbet',
    baseUrl: 'https://www.superbet.rs',
    affiliateId: 'kvotizza456',
    trackingParams: {
      utm_source: 'kvotizza',
      utm_medium: 'referral',
    },
    deepLinkSupport: false,
  },
  Pinnbet: {
    name: 'Pinnbet',
    baseUrl: 'https://www.pinnbet.rs',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  Volcano: {
    name: 'Volcano',
    baseUrl: 'https://www.volcano.rs',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  Admiralbet: {
    name: 'Admiralbet',
    baseUrl: 'https://www.admiralbet.rs',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  Betole: {
    name: 'Betole',
    baseUrl: 'https://www.betole.com',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  Soccerbet: {
    name: 'Soccerbet',
    baseUrl: 'https://www.soccerbet.rs',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  MerkurXTip: {
    name: 'Merkur X Tip',
    baseUrl: 'https://www.merkurxtip.rs',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  Balkanbet: {
    name: 'Balkanbet',
    baseUrl: 'https://www.balkanbet.rs',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  Maxbet: {
    name: 'Maxbet',
    baseUrl: 'https://www.maxbet.rs',
    affiliateId: 'kvotizza789',
    trackingParams: {
      source: 'kvotizza',
      campaign: 'daily_picks',
    },
    deepLinkSupport: true,
  },
  // Fallback for unknown bookies
  default: {
    name: 'Unknown Bookie',
    baseUrl: '#',
    trackingParams: {},
    deepLinkSupport: false,
  },
}

// Generate affiliate URL for a bookie
export function generateBookieUrl(
  bookieName: string,
  options: {
    matchId?: number
    betType?: string
    campaign?: string
    customParams?: Record<string, string>
  } = {}
): string {
  const config = BOOKIE_CONFIGS[bookieName] || BOOKIE_CONFIGS['default']

  if (config.baseUrl === '#') {
    // Unknown bookie - return search URL or generic landing
    return `https://www.google.com/search?q=${encodeURIComponent(bookieName + ' kladionica')}`
  }

  const url = new URL(config.baseUrl)

  // Add affiliate ID if available
  if (config.affiliateId) {
    url.searchParams.set('ref', config.affiliateId)
  }

  // Add tracking parameters
  Object.entries(config.trackingParams || {}).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  // Add custom campaign
  if (options.campaign) {
    url.searchParams.set('utm_campaign', options.campaign)
  }

  // Add custom parameters
  if (options.customParams) {
    Object.entries(options.customParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  // Add match-specific parameters if supported
  if (options.matchId && config.deepLinkSupport) {
    url.searchParams.set('match', options.matchId.toString())
  }

  if (options.betType && config.deepLinkSupport) {
    url.searchParams.set('bet_type', options.betType)
  }

  return url.toString()
}

// Check if bookie is supported
export function isBookieSupported(bookieName: string): boolean {
  return (
    (bookieName in BOOKIE_CONFIGS && BOOKIE_CONFIGS[bookieName].baseUrl !== '#') ||
    (bookieName.replace(/\s+/g, '') in BOOKIE_CONFIGS &&
      BOOKIE_CONFIGS[bookieName.replace(/\s+/g, '')].baseUrl !== '#')
  )
}

// Get bookie display info
export function getBookieInfo(bookieName: string) {
  const config = BOOKIE_CONFIGS[bookieName] || BOOKIE_CONFIGS['default']
  return {
    name: config.name,
    isSupported: isBookieSupported(bookieName),
    hasDeepLink: config.deepLinkSupport || false,
  }
}

// Analytics tracking for bookie clicks
export function trackBookieClick(bookieName: string, context: string) {
  // In production, this would send to your analytics service
  console.log('📊 Bookie click tracked:', {
    bookie: bookieName,
    context,
    timestamp: new Date().toISOString(),
    supported: isBookieSupported(bookieName),
  })

  // Example: Send to Google Analytics, Mixpanel, etc.
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'bookie_click', {
      bookie_name: bookieName,
      context: context,
      supported: isBookieSupported(bookieName),
    })
  }
}
