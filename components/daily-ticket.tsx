'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"; // optional if you prefer table layout
import type { BetTypeSelection, DailyTicketLeg } from '@/types/bookies' // so we can cast
// If you don't have this import path, adjust or remove the cast at the bottom.

type DailyTicketProps = {
  bets: DailyTicketLeg[]
  title?: string
  onAnalyze: (selections: DailyTicketLeg[], stake: number) => void // your handleAnalyzeBet
  initialStake?: number
  className?: string
}

export function DailyTicket({
  bets,
  title = 'Tiket dana',
  onAnalyze,
  initialStake = 0,
  className,
}: DailyTicketProps) {
  const [stake, setStake] = useState<number>(initialStake)
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

  const betsDate =
    bets.length > 0 && bets[0].start_time
      ? new Date(bets[0].start_time)
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .replace(/\//g, '.') // Replace slashes with dots
      : ''
  const totalOdds = useMemo(
    () => (bets.length ? bets.reduce((acc, b) => acc * Number(b.odd || 1), 1) : 0),
    [bets]
  )

  const openBookieUrl = (bookie: string) => {
    // plug your outUrl(bookie, …) builder here if you need tracking
    return `#open-${encodeURIComponent(bookie)}`
  }

  const handleOpenTicket = () => {
    // cast DailyBets -> BetTypeSelection[] if your modal expects that exact type
    onAnalyze(bets as unknown as DailyTicketLeg[], stake)
  }

  return (
    <Card className="flex flex-col h-full rounded-lg bg-transparent border-none shadow-none">
      <CardHeader className="mb-2 shadow-lg dark:bg-gradient-to-r dark:from-kvotizza-dark-bg-20 dark:to-kvotizza-dark-bg-20 bg-gradient-to-r from-sport-blue-50 to-sport-green-50 pb-3 bg-black rounded-lg dark:border-b dark:border-white/30">
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
          Tiket dana
        </CardTitle>
      </CardHeader>
      <CardContent className="dark:bg-kvotizza-dark-bg-20 shadow-lg p-6 flex-1 flex flex-col rounded-lg bg-white dark:border-b dark:border-white/30 ">
        <div
          className={`text-center align-middle space-y-2 pb-4 border-b  ${
            isMobileView ? 'min-h-[50px]' : 'min-h-[80px]'
          }`}
        >
          <h3 className="text-xl text-center font-bold">Tiket za dan {betsDate}</h3>
        </div>
        <div className={`space-y-4 ${isMobileView ? 'mt-[8px] mb-[8px]' : 'mt-[8px]'} `}>
          {bets.map((b) => (
            <div
              key={`${b.match_id}-${b.bet_name}-${b.bookie}`}
              className="flex items-center justify-between rounded-2xl border dark:border-white/30 bg-white/60 dark:bg-white/5 px-2 py-2"
            >
              {/* LEFT: flag + match info */}
              <div className="flex items-center gap-4 min-w-0">
                <Image
                  src={`/flags/${b.country_name.toLowerCase()}.png`}
                  alt="Bookie"
                  width={30}
                  height={30}
                  className="hidden sm:block rounded-full border border-gray-300 dark:border-white/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold truncate">
                    {b.home_team} - {b.away_team}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
                    <span className="truncate">{b.competition_name}</span>
                    <span>•</span>
                    <span className="truncate">{b.bet_category}</span>
                    <span>•</span>
                    <span className="truncate">{b.bet_name}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: odds + link */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-xl sm:text-2xl font-bold tabular-nums text-sport-green-500">
                  {b.odd ? Number(b.odd).toFixed(2) : 'N/A'}
                </div>
                <div className="flex flex-row gap-2">
                  <a
                    href={openBookieUrl(b.bookie || 'defaultBookie')}
                    className="text-xs underline underline-offset-2 hover:opacity-80"
                    rel="nofollow noopener"
                  >
                    {b.bookie}
                  </a>
                  <Image
                    src={`/images/${b.bookie ? b.bookie.toLowerCase() : 'default'}.png`}
                    alt={`${b.bookie} logo`}
                    width={20}
                    height={20}
                    className="hidden sm:block rounded-full border border-gray-300 dark:border-white/30 shrink-0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-6 border-t pt-4">
          {/* Footer bar */}
          <div className="flex flex-col gap-2 md:gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border px-2  py-2 md:px-4 md:py-4 dark:bg-kvotizza-dark-bg-20 dark:border dark:border-white/30">
            <div className="flex items-center gap-3 dark:bg-kvotizza-dark-bg-20">
              <label
                htmlFor="stake"
                className="text-xs md:text-sm text-muted-foreground dark:bg-kvotizza-dark-bg-20"
              >
                Ulog
              </label>
              <input
                id="stake"
                type="text"
                min={0}
                step="100"
                inputMode="decimal"
                value={Number.isFinite(stake) ? stake : ''}
                onChange={(e) => setStake(Number(e.target.value || 0))}
                className="h-9 w-28 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring dark:bg-kvotizza-dark-bg-10 dark:border dark:border-white/30"
                placeholder="0"
              />
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full">
              <div className="text-xs md:text-sm text-muted-foreground">Ukupna kvota</div>
              <div className="text-xl sm:text-2xl font-extrabold tabular-nums text-sport-green-500">
                {bets.length ? totalOdds.toFixed(2) : '—'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="bg-transparent dark:bg-kvotizza-dark-bg-10 dark:text-white/80 dark:border dark:border-white/30 dark:hover:bg-black/20"
              onClick={handleOpenTicket}
              disabled={!bets.length || !stake || stake <= 0}
            >
              Otvori Tiket
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
