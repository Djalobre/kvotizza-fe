'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import type { MarketDeviation } from '../types/bookies'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"; // optional if you prefer table layout
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
// If you don't have this import path, adjust or remove the cast at the bottom.

type BetOfTheDayProp = {
  marketDeviation: MarketDeviation
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
    <Card className="shadow-md dark:bg-kvotizza-dark-bg-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
      <CardContent className="space-y-3">
        {marketDeviation ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {marketDeviation.home_team} - {marketDeviation.away_team}
                </p>
                <p className="text-sm text-muted-foreground">{marketDeviation.competition_name}</p>
              </div>
              <img
                src={`/images/${marketDeviation.bookie.toLowerCase()}.png`}
                alt="Logo kladionice"
                className="h-10 w-10 rounded-md"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xl font-bold">{marketDeviation.bet_name}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-kvotizza-green-400 ">
                  {marketDeviation.odd.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Prosek tržišta: {marketDeviation.avg_odd.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-white bg-kvotizza-green-400 hover:bg-kvotizza-green-400 dark:hover:bg-kvotizza-green-400">
                +{marketDeviation.odstupanje.toFixed(2)}%
              </Badge>
              <span className="text-sm text-muted-foreground ">u odnosu na tržište</span>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                className="bg-transparent dark:bg-kvotizza-dark-bg-10 dark:text-white/80 dark:border dark:border-white/30 dark:hover:bg-black/20"
                onClick={() => alert('Preview: Detalji meča')}
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
