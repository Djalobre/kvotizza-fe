'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import type { MarketDeviation } from '../types/bookies'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"; // optional if you prefer table layout
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp, Trophy } from 'lucide-react'
import { SmallBookieButton } from './bookie-link-button'
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
const formatTime = (isoString: string) => {
  try {
    return new Intl.DateTimeFormat('sr-RS', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(isoString))
  } catch {
    return 'TBD'
  }
}
export function BetOfTheDay({ marketDeviation }: BetOfTheDayProp) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [isVeryNarrow, setIsVeryNarrow] = useState(false)
  useEffect(() => {
    const update = () => {
      setIsMobileView(window.innerWidth < 550)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <Card className="rounded-lg h-full bg-transparent border-none shadow-none">
      <CardHeader className="mb-2 shadow-lg dark:bg-gradient-to-r dark:from-kvotizza-dark-bg-20 dark:to-kvotizza-dark-bg-20 bg-gradient-to-r from-sport-blue-50 to-sport-green-50 pb-3 bg-black rounded-lg dark:border-white/30">
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
      <CardContent className="dark:bg-kvotizza-dark-bg-20 shadow-lg  p-6 flex-1 flex flex-col rounded-lg bg-white dark:border-b dark:border-white/30 ">
        {marketDeviation ? (
          <>
            <div
              className={`"text-center space-y-2 pb-4   ${
                isMobileView ? 'min-h-[50px]' : 'min-h-[80px]'
              } "`}
            >
              {/* Match info - kompaktniji layout */}
              <div className="text-center space-y-2 pb-4 border-b min-h-[80px] ">
                <h3 className="text-xl font-bold">
                  {marketDeviation.home_team} - {marketDeviation.away_team}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {marketDeviation.competition_name}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(marketDeviation.start_time)}
                  </Badge>
                </div>
              </div>
              {/* Best Odd Highlight */}
              <div className="bg-sport-green-50/30 dark:bg-sport-green-950/20 rounded-lg p-4 border border-sport-green-200/60 dark:border-sport-green-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-sport-green-700 dark:text-sport-green-300">
                      Najbolja kvota
                    </p>
                    <p className="text-xs text-muted-foreground">{marketDeviation.bet_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-sport-green-600">
                      {marketDeviation.odd.toFixed(2)}
                    </p>
                    <p className="text-xs text-sport-green-600 font-medium">
                      @ {marketDeviation.bookie}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Prosek tržišta: {marketDeviation.avg_odd.toFixed(2)}
                  </span>
                  <Badge className="bg-sport-green-600 hover:bg-sport-green-700">
                    +{marketDeviation.odstupanje.toFixed(2)}% bolje
                  </Badge>
                </div>
              </div>
              {/* Action buttons - stack na mobilnom */}
              <div className="space-y-2 pb-[15px]">
                {marketDeviation.allOdds.slice(0, 4).map((odd, index) => (
                  <div
                    key={`${odd.bookie}-${index}`}
                    className={`flex items-center justify-between p-1 rounded-lg 
                      ${
                        index === 0
                          ? 'bg-sport-green-50/30 dark:bg-sport-green-950/20 border border-sport-green-200/60 dark:border-sport-green-800'
                          : ' dark:border-white/30 bg-muted/50 dark:bg-white/5 border bg-white/60'
                      }`}
                  >
                    <div className="flex items-center gap-3 px-2">
                      <img
                        src={`/images/${odd.bookie.toLowerCase()}.png`}
                        alt={odd.bookie}
                        className="h-6 w-6 rounded border"
                      />
                      <span className="font-medium text-sm">{odd.bookie}</span>
                    </div>
                    <div className="text-right px-2">
                      <p className="text-lg font-bold text-foreground">{odd.odd.toFixed(2)}</p>
                      <SmallBookieButton
                        bookieName={odd.bookie}
                        matchId={marketDeviation.match_id}
                        betType={`${marketDeviation.bet_name}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t">
                <div className="bg-transparent bg-muted/30 rounded-2xl p-4 dark:border border dark:border-white/30">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Najbolja</p>
                      <p className="text-lg font-bold text-sport-green-600">
                        {marketDeviation.odd.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prosek</p>
                      <p className="text-lg font-bold">{marketDeviation.avg_odd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Najgora</p>
                      <p className="text-lg font-bold text-kvotizza-red-500">
                        {marketDeviation.allOdds[marketDeviation.allOdds.length - 1]?.odd.toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
          </>
        ) : (
          <p>Trenutno nema dostupnih kvota.</p>
        )}
      </CardContent>
    </Card>
  )
}
