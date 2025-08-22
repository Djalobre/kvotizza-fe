'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <section className={['w-full ', className].filter(Boolean).join(' ')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Optional: place for "Otvori tikete X" */}
        {/* <button className="text-sm text-muted-foreground hover:underline">Otvori tikete 0</button> */}
      </div>

      <Card className="border-none shadow-none bg-transparent ">
        <CardContent className="p-0">
          <div className="space-y-4">
            {bets.map((b) => (
              <div
                key={`${b.match_id}-${b.bet_name}-${b.bookie}`}
                className="flex items-center justify-between rounded-2xl border bg-white/60 dark:bg-white/5 px-4 py-5"
              >
                {/* LEFT: flag + match info */}
                <div className="flex items-center gap-4 min-w-0">
                  <Image
                    src={`/flags/${b.country_name.toLowerCase()}.png`}
                    alt="Bookie"
                    width={40}
                    height={40}
                    className="hidden sm:block rounded-full border border-gray-300 dark:border-white/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm sm:text-lg font-semibold truncate">
                      {b.home_team} - {b.away_team}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
                      <span className="truncate">{b.competition_name}</span>
                      <span>•</span>
                      <span className="truncate">{b.bet_category}</span>
                      <span>•</span>
                      <span className="truncate">
                        {b.bet_name} @ {b.bookie}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: odds + link */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-xl sm:text-2xl font-bold tabular-nums text-sport-green-500">
                    {b.odd ? Number(b.odd).toFixed(2) : 'N/A'}
                  </div>
                  <a
                    href={openBookieUrl(b.bookie || 'defaultBookie')}
                    className="text-sm underline underline-offset-2 hover:opacity-80"
                    aria-label={`Otvori ${b.bookie}`}
                    rel="nofollow noopener"
                  >
                    otvori {b.bookie}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer bar */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border px-4 py-4 dark:bg-kvotizza-dark-bg-20 dark:border dark:border-white/30">
            <div className="flex items-center gap-3 dark:bg-kvotizza-dark-bg-20">
              <label
                htmlFor="stake"
                className="text-sm text-muted-foreground dark:bg-kvotizza-dark-bg-20"
              >
                Ulog
              </label>
              <input
                id="stake"
                type="text" // use text to avoid browser forcing formats
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
              <div className="text-sm text-muted-foreground ">Ukupna kvota</div>
              <div className="text-xl sm:text-2xl font-extrabold tabular-nums text-sport-green-500">
                {bets.length ? totalOdds.toFixed(2) : '—'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="h-11 bg-transparent rounded-xl px-6 text-base dark:bg-kvotizza-dark-bg-10 dark:border dark:border-white/30 dark:text-white/80 dark:hover:bg-black/20"
              onClick={handleOpenTicket}
              disabled={!bets.length || !stake || stake <= 0}
            >
              Otvori Tiket
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
