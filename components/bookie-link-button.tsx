'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, AlertTriangle, Search } from 'lucide-react'
import { generateBookieUrl, getBookieInfo, trackBookieClick } from '@/lib/bookie-urls'

interface BookieLinkButtonProps {
  bookieName: string
  matchId?: number
  betType?: string
  odds?: number
  campaign?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'lg' | 'default' | 'icon' | 'xs'
  className?: string
  children?: React.ReactNode
}

export function BookieLinkButton({
  bookieName,
  matchId,
  betType,
  odds,
  campaign = 'daily_ticket',
  variant = 'default',
  size = 'default',
  className = '',
  children,
}: BookieLinkButtonProps) {
  const [isClicked, setIsClicked] = useState(false)
  const bookieInfo = getBookieInfo(bookieName)

  const handleClick = () => {
    setIsClicked(true)

    // Track the click
    trackBookieClick(bookieName, campaign)

    if (bookieInfo.isSupported) {
      // Generate and open affiliate URL
      const url = generateBookieUrl(bookieName, {
        matchId,
        betType,
        campaign,
        customParams: {
          odds: odds?.toString() || '',
          source_page: 'kvotizza_pick',
        },
      })

      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Handle unsupported bookie
      const searchUrl = generateBookieUrl(bookieName) // Returns Google search
      window.open(searchUrl, '_blank', 'noopener,noreferrer')
    }

    // Reset clicked state after animation
    setTimeout(() => setIsClicked(false), 200)
  }

  const getButtonContent = () => {
    if (children) return children

    if (bookieInfo.isSupported) {
      return (
        <>
          <span>Otvori {bookieName}</span>
          {odds && <span className="font-bold">- {odds.toFixed(2)}</span>}
          <ExternalLink className="h-4 w-4 ml-2" />
        </>
      )
    } else {
      return (
        <>
          <Search className="h-4 w-4 mr-2" />
          <span>Pronađi {bookieName}</span>
        </>
      )
    }
  }

  const getButtonVariant = () => {
    if (!bookieInfo.isSupported) return 'outline'
    return variant
  }

  const getButtonClassName = () => {
    let baseClass = className

    if (bookieInfo.isSupported) {
      baseClass += ' bg-sport-green-600 hover:bg-sport-green-700 text-white'
    } else {
      baseClass += ' border-orange-300 text-orange-700 hover:bg-orange-50'
    }

    if (isClicked) {
      baseClass += ' scale-95 transition-transform duration-150'
    }

    return baseClass
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleClick}
        variant={getButtonVariant()}
        size={size}
        className={getButtonClassName()}
        title={
          bookieInfo.isSupported
            ? `Otvori ${bookieName} sa affiliate linkom`
            : `${bookieName} nije podržan - pretražiće se online`
        }
      >
        {getButtonContent()}
      </Button>

      {!bookieInfo.isSupported && (
        <div className="flex items-center gap-1 text-xs text-orange-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Nije podržan</span>
        </div>
      )}

      {bookieInfo.isSupported && bookieInfo.hasDeepLink && (
        <Badge variant="secondary" className="text-xs w-fit">
          Direct link
        </Badge>
      )}
    </div>
  )
}

// Simplified version for small buttons
export function SmallBookieButton({
  bookieName,
  matchId,
  betType,
  className = '',
}: {
  bookieName: string
  matchId?: number
  betType?: string
  className?: string
}) {
  const bookieInfo = getBookieInfo(bookieName)

  const handleClick = () => {
    trackBookieClick(bookieName, 'odds_comparison')

    const url = generateBookieUrl(bookieName, {
      matchId,
      betType,
      campaign: 'odds_comparison',
    })

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className={`text-xs dark:text-white/70 text-sport-blue-700 hover:underline font-medium ${className}`}
      title={`Otvori ${bookieName}`}
    >
      {bookieInfo.isSupported ? 'otvori' : 'pronađi'}
    </button>
  )
}
