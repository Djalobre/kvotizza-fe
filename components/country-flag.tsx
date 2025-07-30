"use client"

interface CountryFlagProps {
  countryCode?: string
  className?: string
}

// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
  GB: "🇬🇧", // Great Britain
  EN: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", // England
  DE: "🇩🇪", // Germany
  ES: "🇪🇸", // Spain
  FR: "🇫🇷", // France
  IT: "🇮🇹", // Italy
  NL: "🇳🇱", // Netherlands
  PT: "🇵🇹", // Portugal
  BR: "🇧🇷", // Brazil
  AR: "🇦🇷", // Argentina
  US: "🇺🇸", // United States
  CA: "🇨🇦", // Canada
  MX: "🇲🇽", // Mexico
  AU: "🇦🇺", // Australia
  JP: "🇯🇵", // Japan
  KR: "🇰🇷", // South Korea
  CN: "🇨🇳", // China
  IN: "🇮🇳", // India
  RU: "🇷🇺", // Russia
  TR: "🇹🇷", // Turkey
  EG: "🇪🇬", // Egypt
  ZA: "🇿🇦", // South Africa
  NG: "🇳🇬", // Nigeria
  GH: "🇬🇭", // Ghana
  MA: "🇲🇦", // Morocco
  TN: "🇹🇳", // Tunisia
  DZ: "🇩🇿", // Algeria
  SE: "🇸🇪", // Sweden
  NO: "🇳🇴", // Norway
  DK: "🇩🇰", // Denmark
  FI: "🇫🇮", // Finland
  BE: "🇧🇪", // Belgium
  CH: "🇨🇭", // Switzerland
  AT: "🇦🇹", // Austria
  PL: "🇵🇱", // Poland
  CZ: "🇨🇿", // Czech Republic
  HU: "🇭🇺", // Hungary
  RO: "🇷🇴", // Romania
  BG: "🇧🇬", // Bulgaria
  HR: "🇭🇷", // Croatia
  RS: "🇷🇸", // Serbia
  GR: "🇬🇷", // Greece
  UA: "🇺🇦", // Ukraine
  BY: "🇧🇾", // Belarus
  LT: "🇱🇹", // Lithuania
  LV: "🇱🇻", // Latvia
  EE: "🇪🇪", // Estonia
  SK: "🇸🇰", // Slovakia
  SI: "🇸🇮", // Slovenia
  IE: "🇮🇪", // Ireland
  IS: "🇮🇸", // Iceland
  MT: "🇲🇹", // Malta
  CY: "🇨🇾", // Cyprus
  LU: "🇱🇺", // Luxembourg
  MC: "🇲🇨", // Monaco
  AD: "🇦🇩", // Andorra
  SM: "🇸🇲", // San Marino
  VA: "🇻🇦", // Vatican City
  LI: "🇱🇮", // Liechtenstein
}

export function CountryFlag({ countryCode, className = "" }: CountryFlagProps) {
  if (!countryCode) {
    return <span className={`text-muted-foreground ${className}`}>🌍</span>
  }

  const flag = countryFlags[countryCode.toUpperCase()]

  if (!flag) {
    return <span className={`text-muted-foreground ${className}`}>🌍</span>
  }

  return (
    <span className={`inline-block ${className}`} title={`Country: ${countryCode.toUpperCase()}`}>
      {flag}
    </span>
  )
}
