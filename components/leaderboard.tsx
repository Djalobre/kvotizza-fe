'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Trophy, Medal, Award, TrendingUp, Target, Percent } from 'lucide-react'
import { Props, LeaderboardData } from '@/types/bookies'
import { apiService } from '@/lib/api-service'

export function Leaderboard({ period = 'month', start, end, limit = 50 }: Props) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build query
  const query = useMemo(() => {
    const p = new URLSearchParams()
    if (start && end) {
      p.set('start', start)
      p.set('end', end)
    } else if (period) {
      p.set('period', period)
    }
    if (limit) p.set('limit', String(limit))
    return p.toString()
  }, [period, start, end, limit])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getLeaderboardData(query)
      setData(data)
    } catch {
      setError('Greška pri učitavanju rang liste.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" aria-label="1. mesto" />
    if (rank === 2)
      return <Medal className="h-4 w-4 md:h-5 md:w-5 text-gray-400" aria-label="2. mesto" />
    if (rank === 3)
      return <Award className="h-4 w-4 md:h-5 md:w-5 text-amber-600" aria-label="3. mesto" />
    return (
      <span className="font-bold text-[13px] md:text-lg" aria-label={`${rank}. mesto`}>
        #{rank}
      </span>
    )
  }

  const rows = data?.rows ?? []

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Top info */}
      <Card className="dark:bg-kvotizza-dark-bg-20">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-xl">
            <Trophy className="h-5 w-5" />
            <span className="truncate">
              Rang Lista — period: {data ? `${data.period.start} → ${data.period.end}` : '...'}
            </span>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Top tipster ovog perioda na osnovu ukupnih poena
          </CardDescription>
        </CardHeader>

        {/* nagrade: sakrij na XS, prikaži od md naviše */}
        <CardContent className="hidden md:block">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">1. mesto</div>
              <div className="text-sm text-muted-foreground">nagrada (opciono)</div>
            </div>
            <div className="text-center p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-gray-500">2. mesto</div>
              <div className="text-sm text-muted-foreground">nagrada (opciono)</div>
            </div>
            <div className="text-center p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">3. mesto</div>
              <div className="text-sm text-muted-foreground">nagrada (opciono)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading / Error */}
      {loading && (
        <Card className="dark:bg-kvotizza-dark-bg-20">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg">Rang Lista</CardTitle>
            <CardDescription className="text-xs md:text-sm">Učitavanje…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-16 md:h-24 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="dark:bg-kvotizza-dark-bg-20">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg">Rang Lista</CardTitle>
            <CardDescription className="text-xs md:text-sm text-red-600">
              Greška: {error}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Leaderboard */}
      {!loading && !error && (
        <Card className="dark:bg-kvotizza-dark-bg-20">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg">Rang Lista</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Top tipster u izabranom periodu na osnovu ukupnih poena
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-1 md:pt-2">
            {rows.length === 0 ? (
              <div className="text-xs md:text-sm text-muted-foreground">
                Nema podataka za izabrani period.
              </div>
            ) : (
              <div className="space-y-2 md:space-y-4">
                {rows.map((r) => (
                  <div
                    key={`${r.user.id}-${r.rank}`}
                    className={`p-3 md:p-4 rounded-lg border transition-colors ${
                      r.rank <= 3 ? 'bg-muted/40' : 'bg-background'
                    }`}
                  >
                    {/* HEADER LINIJA (avatar, ime, poeni) */}
                    <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 shrink-0">
                          {getRankIcon(r.rank)}
                        </div>

                        <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                          <AvatarFallback className="text-[11px] md:text-sm">
                            {r.user.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm md:text-base truncate max-w-[140px] md:max-w-none">
                              {r.user.name}
                            </span>
                            {r.user.verified && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] md:text-xs shrink-0"
                              >
                                Verifikovan
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 md:gap-4 text-[11px] md:text-xs text-muted-foreground">
                            <span>{r.stats.tips} tipova</span>
                            <span>{r.stats.wins} pobeda</span>
                            {r.stats.streak_win > 0 && (
                              <Badge variant="outline" className="text-[10px] md:text-xs">
                                🔥 {r.stats.streak_win}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base md:text-xl font-bold leading-none">
                          {Math.round(r.points)}
                        </div>
                        <div className="text-[11px] md:text-xs text-muted-foreground">poena</div>
                      </div>
                    </div>

                    {/* STATS GRID — uvek 3 kolone, kompaktan na mobilu */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4 text-[11px] md:text-sm items-center">
                      {/* ROI */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Percent className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="font-medium">ROI</span>
                        </div>
                        <div
                          className={`font-bold text-[13px] md:text-lg ${
                            r.stats.roi_pct > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {r.stats.roi_pct > 0 ? '+' : ''}
                          {r.stats.roi_pct}%
                        </div>
                      </div>

                      {/* Uspešnost */}
                      <div className="flex flex-col items-center justify-center px-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="font-medium">Uspešnost</span>
                        </div>
                        <Progress
                          value={r.stats.success_pct}
                          className="h-1.5 md:h-2 w-full max-w-[220px]"
                        />
                        <div className="mt-1 font-semibold text-[13px] md:text-base">
                          {r.stats.success_pct}%
                        </div>
                      </div>

                      {/* Avg kvota */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="font-medium">Avg kvota</span>
                        </div>
                        <div className="font-bold text-[13px] md:text-lg">{r.stats.avg_odds}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
