// Utility functions for generating specific structured data

export interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  league: string
  startTime: string
  odds: {
    home: number
    draw: number
    away: number
  }
  venue?: string
}

export interface BestOdd {
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

// Generate SportsEvent structured data for matches
export function generateSportsEventSchema(match: Match) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam} vs ${match.awayTeam}`,
    description: `${match.league} meč između ${match.homeTeam} i ${match.awayTeam}`,
    startDate: match.startTime,
    sport: {
      '@type': 'Sport',
      name: 'Football',
    },
    competitor: [
      {
        '@type': 'SportsTeam',
        name: match.homeTeam,
      },
      {
        '@type': 'SportsTeam',
        name: match.awayTeam,
      },
    ],
    location: match.venue
      ? {
          '@type': 'Place',
          name: match.venue,
        }
      : undefined,
    organizer: {
      '@type': 'SportsOrganization',
      name: match.league,
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Pobeda domaćina',
        price: match.odds.home.toString(),
        priceCurrency: 'RSD',
        availability: 'https://schema.org/InStock',
        category: 'Sports Betting Odds',
      },
      {
        '@type': 'Offer',
        name: 'Nerešeno',
        price: match.odds.draw.toString(),
        priceCurrency: 'RSD',
        availability: 'https://schema.org/InStock',
        category: 'Sports Betting Odds',
      },
      {
        '@type': 'Offer',
        name: 'Pobeda gosta',
        price: match.odds.away.toString(),
        priceCurrency: 'RSD',
        availability: 'https://schema.org/InStock',
        category: 'Sports Betting Odds',
      },
    ],
  }
}

// Generate BreadcrumbList structured data
export function generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

// Generate Product schema for best odds
export function generateBestOddSchema(bestOdd: BestOdd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Najbolja kvota: ${bestOdd.matchup} - ${bestOdd.type}`,
    description: `Najbolja kvota za ${bestOdd.matchup} u kategoriji ${bestOdd.category} - ${
      bestOdd.type
    }. ${bestOdd.improvementPct.toFixed(1)}% bolje od proseka tržišta.`,
    category: 'Sports Betting Odds',
    brand: {
      '@type': 'Brand',
      name: bestOdd.bookie,
    },
    offers: {
      '@type': 'Offer',
      price: bestOdd.odd.toString(),
      priceCurrency: 'RSD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: bestOdd.bookie,
      },
      priceValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '1',
      bestRating: '5',
      worstRating: '1',
    },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Organization',
        name: 'Kvotizza',
      },
      reviewBody: `Odličan value bet sa ${bestOdd.improvementPct.toFixed(
        1
      )}% boljom kvotom od proseka tržišta.`,
    },
  }
}

// Generate FAQ structured data
export function generateFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Šta je Kvotizza?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kvotizza je platforma za poređenje kvota svih licenciranih kladionica u Srbiji u realnom vremenu. Pomažemo vam da pronađete najbolje kvote i povećate svoj očekivani prinos.',
        },
      },
      {
        '@type': 'Question',
        name: 'Da li su sve kladionice licencirane?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Da, prikazujemo kvote samo od licenciranih operatera u Republici Srbiji. Svi operateri imaju važeće licence izdane od strane Uprave za igre na sreću.',
        },
      },
      {
        '@type': 'Question',
        name: 'Koliko često se ažuriraju kvote?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kvote se ažuriraju u realnom vremenu. Naš sistem kontinuirano prati promene kvota kod svih operatera i prikazuje najnovije informacije.',
        },
      },
      {
        '@type': 'Question',
        name: 'Da li je korišćenje Kvotizza besplatno?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Da, Kvotizza je potpuno besplatna za korišćenje. Možete porediti kvote, graditi tikete i analizirati najbolje ponude bez ikakvih troškova.',
        },
      },
      {
        '@type': 'Question',
        name: "Kako funkcioniše 'Tiket dana'?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tiket dana je naša preporuka kombinacije mečeva sa najboljim kvotama. Svaki dan analiziramo tržište i biramo optimalne kombinacije za maksimalan prinos.',
        },
      },
    ],
  }
}

// Generate Article schema for blog posts
export function generateArticleSchema(article: {
  title: string
  description: string
  content: string
  publishDate: string
  modifiedDate?: string
  author: string
  image?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    articleBody: article.content,
    datePublished: article.publishDate,
    dateModified: article.modifiedDate || article.publishDate,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kvotizza',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kvotizza.rs/logo.png',
      },
    },
    image: article.image
      ? {
          '@type': 'ImageObject',
          url: article.image,
          width: 1200,
          height: 630,
        }
      : undefined,
    url: article.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    articleSection: 'Sports Betting',
    keywords: ['kvote', 'kladionice', 'sportsko klađenje', 'analize'],
  }
}
