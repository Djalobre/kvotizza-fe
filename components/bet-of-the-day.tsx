'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import type { MarketDeviation } from '../types/bookies'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"; // optional if you prefer table layout
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Trophy } from 'lucide-react'
// If you don't have this import path, adjust or remove the cast at the bottom.

type BetOfTheDayProp = {
  marketDeviation: MarketDeviation
}
const navigateToMatch = (matchId: number) => {
  // For Next.js App Router
  if (typeof window !== 'undefined') {
    window.location.href = `/match/${matchId}`
  }
}
export function BetOfTheDay({ marketDeviation }: BetOfTheDayProp) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [isVeryNarrow, setIsVeryNarrow] = useState(false)
  console.log('BetOfTheDay', marketDeviation)
  useEffect(() => {
    const update = () => {
      setIsMobileView(window.innerWidth < 550)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <Card className="shadow-lg dark:bg-kvotizza-dark-bg-20 dark:border-b dark:border-white/30 rounded-lg">
      <CardHeader className="dark:bg-gradient-to-r dark:from-kvotizza-dark-bg-10 dark:to-kvotizza-dark-bg-10 bg-gradient-to-r from-sport-blue-50 to-sport-green-50 pb-3 bg-black rounded-lg">
        <CardTitle className="flex items-center gap-2 text-lg text-kvotizza-green-500 dark:text-sport-green-600">
          <Image
            src="/images/kvotizza-logo.png"
            alt="Kvotizza Logo"
            width={30}
            height={30}
            className="block dark:hidden h-10 w-auto"
          />
          <Image
            src="/images/kvotizza-logo-white.png"
            alt="Kvotizza Logo"
            width={30}
            height={30}
            className="h-10 w-auto hidden dark:block"
          />{' '}
          Kvotizza dana
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {marketDeviation ? (
          <>
            <div className="space-y-4">
              {/* Match info - kompaktniji layout */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-lg leading-tight">
                    {marketDeviation.home_team} - {marketDeviation.away_team}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {marketDeviation.competition_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {marketDeviation.bet_name}
                    </Badge>
                  </div>
                </div>
                <img
                  src={`/images/${marketDeviation.bookie.toLowerCase()}.png`}
                  alt="Logo kladionice"
                  className="h-10 w-10 rounded-md border shrink-0"
                />
              </div>
              {/* Odds display - horizontalni layout */}
              <div className="flex items-center justify-between bg-muted/60 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Najbolja kvota</p>
                  <p className="text-3xl font-extrabold text-sport-green-600 ">
                    {marketDeviation.odd.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Prosek tržišta</p>
                  <p className="text-xl font-semibold text-muted-foreground">
                    {marketDeviation.avg_odd.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <Badge className="text-white bg-sport-green-600 hover:bg-kvotizza-green-400 dark:hover:bg-kvotizza-green-400 dark:bg-sport-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" /> +{marketDeviation.odstupanje.toFixed(2)}
                    %
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">bolje</p>
                </div>
              </div>
              {/* Action buttons - stack na mobilnom */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="bg-transparent dark:bg-kvotizza-dark-bg-10 dark:text-white/80 dark:border dark:border-white/30 dark:hover:bg-black/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToMatch(marketDeviation.match_id)
                  }}
                >
                  Detalji meča
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p>Trenutno nema dostupnih kvota.</p>
        )}
      </CardContent>
    </Card>
  )
}
