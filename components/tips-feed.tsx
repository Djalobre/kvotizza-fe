'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react'
import { apiService } from '@/lib/api-service'
import { PickRow } from '@/types/bookies'

// ---------- Row shape from /picks/feed (v_picks_feed) ----------

function formatPotentialWin(stake?: number | null, odd?: number | null) {
  const s = stake ?? 1
  const o = odd ?? 0
  if (!s || !o) return '0'
  const profit = s * o - s
  return `+${profit.toFixed(1)} jedinica`
}

function getStatusIcon(status: PickRow['status']) {
  if (status === 'won') return <CheckCircle className="h-4 w-4 text-green-500" />
  if (status === 'lost') return <XCircle className="h-4 w-4 text-red-500" />
  return <Clock className="h-4 w-4 text-yellow-500" />
}

function getStatusBadge(status: PickRow['status']) {
  if (status === 'won') {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
        Pobedio
      </Badge>
    )
  }
  if (status === 'lost') {
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
        Izgubio
      </Badge>
    )
  }
  if (status === 'void') {
    return (
      <Badge variant="outline" className="text-xs">
        Void
      </Badge>
    )
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
      U toku
    </Badge>
  )
}

export function TipsFeed() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost' | 'high-confidence'>(
    'all'
  )
  const [sortBy, setSortBy] = useState<
    'newest' | 'popular' | 'highest-odds' | 'highest-confidence'
  >('newest')

  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<PickRow[]>([])

  // 1) Fetch feed once (adjust params as you like)
  useEffect(() => {
    let canceled = false
    async function run() {
      setLoading(true)
      try {
        // if your apiService.getTipsFeed expects an object:
        const data = await apiService.getTipsFeed({
          period: 'month',
          limit: 50,
          // statuses: ['pending','won','lost'],
          // leagues: ['engleska 1'], categories: ['Konačan ishod'],
        })
        const _rows: PickRow[] = Array.isArray(data) ? data : data?.rows ?? []
        if (!canceled) setRows(_rows)
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [])

  // 2) Client-side filtering/sorting (can move to server later)
  const filtered = useMemo(() => {
    let arr = [...rows]
    if (filter === 'pending') arr = arr.filter((r) => r.status === 'pending')
    if (filter === 'won') arr = arr.filter((r) => r.status === 'won')
    if (filter === 'lost') arr = arr.filter((r) => r.status === 'lost')
    if (filter === 'high-confidence') arr = arr.filter((r) => (r.confidence ?? 0) >= 4)

    if (sortBy === 'newest') {
      arr.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    } else if (sortBy === 'highest-odds') {
      arr.sort((a, b) => b.odd - a.odd)
    } else if (sortBy === 'highest-confidence') {
      arr.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    } else if (sortBy === 'popular') {
      // placeholder – once you add likes/comments counts to BE
      arr.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    }
    return arr
  }, [rows, filter, sortBy])

  return (
    <div className="space-y-4 md:space-y-6 ">
      {/* Filters */}
      <Card className="dark:bg-kvotizza-dark-bg-20">
        <CardContent className="pt-4 md:pt-6">
          {/* Mobile */}
          <div className="flex flex-col md:hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filteri:</span>
              <Button variant="ghost" size="sm" className="p-2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="h-10 ">
                <SelectValue placeholder="Svi tipovi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                <SelectItem value="pending">U toku</SelectItem>
                <SelectItem value="won">Pobednički</SelectItem>
                <SelectItem value="lost">Izgubljeni</SelectItem>
                <SelectItem value="high-confidence">Visoka pouzdanost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Najnoviji" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Najnoviji</SelectItem>
                <SelectItem value="popular">Najpopularniji</SelectItem>
                <SelectItem value="highest-odds">Najveće kvote</SelectItem>
                <SelectItem value="highest-confidence">Najveća pouzdanost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex md:flex-wrap gap-4 ">
            <div className="flex-1 min-w-[200px] ">
              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi tipovi" />
                </SelectTrigger>
                <SelectContent className="dark:bg-kvotizza-dark-bg-10">
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  <SelectItem value="pending">U toku</SelectItem>
                  <SelectItem value="won">Pobednički</SelectItem>
                  <SelectItem value="lost">Izgubljeni</SelectItem>
                  <SelectItem value="high-confidence">Visoka pouzdanost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Najnoviji" />
                </SelectTrigger>
                <SelectContent className="dark:bg-kvotizza-dark-bg-10">
                  <SelectItem value="newest">Najnoviji</SelectItem>
                  <SelectItem value="popular">Najpopularniji</SelectItem>
                  <SelectItem value="highest-odds">Najveće kvote</SelectItem>
                  <SelectItem value="highest-confidence">Najveća pouzdanost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading / empty states */}
      {loading && (
        <Card>
          <CardContent className="dark:bg-kvotizza-dark-bg-20 p-6 text-sm text-muted-foreground">
            Učitavanje…
          </CardContent>
        </Card>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="dark:bg-kvotizza-dark-bg-20 p-6 text-sm text-muted-foreground">
            Nema tipova za odabrane filtere.
          </CardContent>
        </Card>
      )}

      {/* Tips list */}
      <div className="space-y-3 md:space-y-4">
        {filtered.map((tip) => {
          const matchup = `${tip.home_team} vs ${tip.away_team}`
          const league = tip.competition_name
          const initials =
            (tip.user_name ?? 'User')
              .split(' ')
              .map((s) => s[0]?.toUpperCase())
              .slice(0, 2)
              .join('') || 'U'

          return (
            <Card
              key={tip.id}
              className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 dark:border dark:border-white/30 "
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarFallback className="text-xs md:text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm md:text-base">
                          {tip.user_name ?? `Korisnik #${tip.user_id}`}
                        </span>
                        {!!tip.user_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verifikovan
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(tip.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="md:hidden">{getStatusIcon(tip.status)}</div>
                    <div className="hidden md:flex md:items-center md:gap-2">
                      {getStatusIcon(tip.status)}
                      {getStatusBadge(tip.status)}
                    </div>
                    <div className="md:hidden">{getStatusBadge(tip.status)}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4 ">
                {/* Match info */}
                <div className="bg-muted/50 rounded-lg p-3 md:p-4 dark:bg-kvotizza-dark-bg-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm md:text-base">{matchup}</h3>
                    {league && (
                      <Badge variant="outline" className="text-xs">
                        {league}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-muted-foreground">Tip:</p>
                      <p className="font-medium">
                        {tip.bet_category}: {tip.bet_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kvota:</p>
                      <p className="font-bold text-blue-600">{tip.odd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ulog:</p>
                      <p className="font-medium">{tip.stake ?? 1} jedinica</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pouzdanost:</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < (tip.confidence ?? 0)
                                ? 'fill-current text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis */}
                {tip.analysis && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm md:text-base">Analiza:</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {tip.analysis}
                    </p>
                  </div>
                )}

                {/* Potential win */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium">Potencijalna dobit:</span>
                    <span className="font-bold text-green-600 text-sm md:text-base">
                      {formatPotentialWin(tip.stake, tip.odd)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
