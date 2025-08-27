'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  structuredData?: object[]
  noIndex?: boolean
  alternateLanguages?: { lang: string; url: string }[]
}

export function SEOHead({
  title = 'Kvotizza - Uporedi kvote svih kladionica u Srbiji u realnom vremenu',
  description = 'Kvotizza ti pomaže da pronađeš najbolju kvotu, izgradiš optimalan tiket i povećaš očekivani prinos. Sve lige, svi sportovi, svi licencirani operateri na jednom mestu.',
  keywords = [
    'kvote',
    'kladionice',
    'poređenje kvota',
    'najbolje kvote',
    'sportsko klađenje',
    'fudbal kvote',
    'košarka kvote',
    'tenis kvote',
    'live kvote',
    'Srbija kladionice',
    'licencirane kladionice',
    'Mozzart',
    'Superbet',
    'Pinnbet',
    'Admiralbet',
    'Balkanbet',
    'Soccerbet',
    'tiket dana',
    'value bet',
    'arbitraža',
    'odds comparison',
  ],
  canonicalUrl = 'https://kvotizza.rs',
  ogImage = 'https://kvotizza.rs/og-image.jpg',
  ogType = 'website',
  structuredData = [],
  noIndex = false,
  alternateLanguages = [
    { lang: 'sr', url: 'https://kvotizza.rs' },
    { lang: 'en', url: 'https://kvotizza.rs/en' },
  ],
}: SEOHeadProps) {
  const defaultStructuredData = [
    // Organization Schema
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Kvotizza',
      description: 'Pametno poređenje kvota svih kladionica u Srbiji',
      url: 'https://kvotizza.rs',
      logo: 'https://kvotizza.rs/logo.png',
      foundingDate: '2024',
      founder: {
        '@type': 'Person',
        name: 'Kvotizza Team',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+381-XX-XXX-XXXX',
        contactType: 'customer service',
        availableLanguage: ['Serbian', 'English'],
      },
      sameAs: [
        'https://twitter.com/kvotizza',
        'https://facebook.com/kvotizza',
        'https://instagram.com/kvotizza',
        'https://t.me/kvotizza',
      ],
      areaServed: {
        '@type': 'Country',
        name: 'Serbia',
      },
      serviceType: 'Odds Comparison Service',
    },
    // WebSite Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Kvotizza',
      url: 'https://kvotizza.rs',
      description: 'Uporedi kvote svih kladionica u Srbiji u realnom vremenu',
      inLanguage: 'sr',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://kvotizza.rs/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Kvotizza',
        logo: {
          '@type': 'ImageObject',
          url: 'https://kvotizza.rs/logo.png',
        },
      },
    },
    // Service Schema
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Poređenje kvota kladionica',
      description: 'Uporedi kvote svih licenciranih kladionica u Srbiji u realnom vremenu',
      provider: {
        '@type': 'Organization',
        name: 'Kvotizza',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Serbia',
      },
      serviceType: 'Odds Comparison',
      category: 'Sports Betting',
      audience: {
        '@type': 'Audience',
        audienceType: 'Sports Bettors',
        geographicArea: {
          '@type': 'Country',
          name: 'Serbia',
        },
      },
    },
  ]

  const allStructuredData = [...defaultStructuredData, ...structuredData]

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Kvotizza" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Serbian" />
      <meta name="revisit-after" content="1 days" />
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        }
      />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Alternate Languages */}
      {alternateLanguages.map((alt) => (
        <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.url} />
      ))}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Kvotizza - Poređenje kvota kladionica" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Kvotizza" />
      <meta property="og:locale" content="sr_RS" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@kvotizza" />
      <meta name="twitter:creator" content="@kvotizza" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Kvotizza - Poređenje kvota kladionica" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#2d8f5f" />
      <meta name="msapplication-TileColor" content="#2d8f5f" />
      <meta name="application-name" content="Kvotizza" />
      <meta name="apple-mobile-web-app-title" content="Kvotizza" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />

      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data),
          }}
        />
      ))}

      {/* Additional Meta for Betting Sites */}
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="coverage" content="worldwide" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="true" />
      <meta name="MobileOptimized" content="320" />

      {/* Geo Tags for Serbia */}
      <meta name="geo.region" content="RS" />
      <meta name="geo.country" content="Serbia" />
      <meta name="geo.placename" content="Belgrade" />
      <meta name="ICBM" content="44.8176, 20.4633" />

      {/* Copyright and Legal */}
      <meta name="copyright" content="© 2024 Kvotizza. Sva prava zadržana." />
      <meta
        name="disclaimer"
        content="Igraj odgovorno. 18+. Klađenje može biti opasno po zdravlje."
      />
    </Head>
  )
}
