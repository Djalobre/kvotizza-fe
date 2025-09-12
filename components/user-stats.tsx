'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  TrendingUp,
  Target,
  Trophy,
  Calendar,
  Percent,
  BarChart3,
  Award,
  Flame,
} from 'lucide-react'
import { apiService } from '@/lib/api-service'
import { MyStatsPayload } from '@/types/bookies'

export function UserStats() {
  const [stats, setStats] = useState<MyStatsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [period] = useState<'month' | 'week' | 'all'>('month') // optionally let user switch

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await apiService.getMyStats(period)
        if (!cancelled) setStats(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [period])

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Učitavanje…</CardContent>
      </Card>
    )
  }

  const u = stats.user
  const s = stats.monthlyStats

  const initials =
    u.avatar ||
    u.name
      .split(' ')
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join('') ||
    'U'

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-0">
              <Avatar className="h-12 w-12 md:h-16 md:w-16">
                <AvatarFallback className="text-base md:text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg md:text-2xl font-bold">{u.name}</h2>
                  {u.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verifikovan
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                    {stats.currentRank ? `#${stats.currentRank}` : '#—'}
                    {stats.totalPlayers ? ` od ${stats.totalPlayers}` : ''}
                  </span>
                  <span>{stats.points} poena</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">ROI</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">+{s.roi}%</p>
              </div>
              <Percent className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Uspešnost</p>
                <p className="text-lg md:text-2xl font-bold">{s.winRate}%</p>
              </div>
              <Target className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            </div>
            <Progress value={s.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Serija</p>
                <p className="text-lg md:text-2xl font-bold flex items-center gap-1">
                  <Flame className="h-4 w-4 md:h-6 md:w-6 text-orange-500" />
                  {s.currentStreak}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Profit</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">+{s.profit}</p>
              </div>
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              Mesečni pregled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Ukupno tipova:</span>
                <span className="font-medium md:mt-1 md:block">{s.totalTips}</span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Pobednički:</span>
                <span className="font-medium text-green-600 md:mt-1 md:block">{s.wonTips}</span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Izgubljeni:</span>
                <span className="font-medium text-red-600 md:mt-1 md:block">{s.lostTips}</span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Prosečna kvota:</span>
                <span className="font-medium md:mt-1 md:block">
                  {s.avgOdds?.toFixed?.(2) ?? s.avgOdds}
                </span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Ukupan ulog:</span>
                <span className="font-medium md:mt-1 md:block">{s.totalStake} jedinica</span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Ukupan povraćaj:</span>
                <span className="font-medium md:mt-1 md:block">{s.totalReturn} jedinica</span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Najbolja serija:</span>
                <span className="font-medium md:mt-1 md:block">{s.bestStreak} uzastopno</span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-muted-foreground">Neto profit:</span>
                <span className="font-medium text-green-600 md:mt-1 md:block">
                  +{s.profit} jedinica
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent tips */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Poslednji tipovi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {stats.recentTips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs md:text-sm truncate">{tip.match}</p>
                    <p className="text-xs text-muted-foreground">Kvota: {tip.odds}</p>
                  </div>
                  <div className="text-right ml-2">
                    <Badge
                      variant={
                        tip.result === 'won'
                          ? 'default'
                          : tip.result === 'lost'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="text-xs mb-1"
                    >
                      {tip.result === 'won'
                        ? 'Pobeda'
                        : tip.result === 'lost'
                        ? 'Poraz'
                        : 'Neobrađen'}
                    </Badge>
                    <p
                      className={`text-xs md:text-sm font-medium ${
                        tip.profit > 0 ? 'text-green-600' : tip.profit < 0 ? 'text-red-600' : ''
                      }`}
                    >
                      {tip.profit > 0 ? '+' : ''}
                      {tip.profit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Award className="h-4 w-4 md:h-5 md:w-5" />
            Dostignuća
          </CardTitle>
          <CardDescription className="text-sm">
            Otključaj nova dostignuća kroz uspešno tipovanje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {stats.achievements.map((a, i) => (
              <div
                key={i}
                className={`text-center p-2 md:p-4 rounded-lg border ${
                  a.unlocked
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-muted/50 border-muted opacity-50'
                }`}
              >
                <div className="text-lg md:text-2xl mb-1 md:mb-2">{a.icon}</div>
                <p className="text-xs font-medium">{a.name}</p>
                {a.unlocked && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Otključano
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
