'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, Gift, Users } from 'lucide-react'
import { apiService } from '@/lib/api-service'
import { CompetitionSummary } from '@/types/bookies'

export function CompetitionInfo() {
  const [data, setData] = useState<CompetitionSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const d = await apiService.getCompetitionSummary()
        if (!cancelled) setData(d)
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Greška')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const daysLeft = data?.days.left ?? 0
  const totalDays = data?.days.total ?? 1
  const progress = Math.min(100, Math.max(0, data?.days.progress_pct ?? 0))

  const formatInt = (n: number | undefined | null) => (n ?? 0).toLocaleString('sr-RS')

  const totalPrizeRsd = useMemo(() => {
    // your field says *_eur but you suffix "rsd"; keep output consistent
    const val = data?.total_prize_eur ?? 0
    return `${formatInt(val)} RSD`
  }, [data?.total_prize_eur])

  const prizes = (
    data?.prizes ?? [
      { place: 1, label: '—' },
      { place: 2, label: '—' },
      { place: 3, label: '—' },
    ]
  ).slice(0, 3)

  return (
    <Card className="dark:bg-gradient-to-r dark:from-kvotizza-dark-bg-20 dark:to-kvotizza-dark-bg-20 bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg md:text-xl leading-tight">
          <Gift className="h-5 w-5 shrink-0" />
          <span className="truncate">{data?.title ?? 'Takmičenje'}</span>
        </CardTitle>
        <CardDescription className="text-blue-100 text-xs sm:text-sm mt-1">
          {err
            ? 'Greška pri učitavanju'
            : 'Takmiči se sa najboljim tipsterima i osvoji vredne nagrade!'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6 ">
          <Metric
            icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
            label="Preostalo"
            value={loading ? '—' : daysLeft}
            sub="dana"
          />
          <Metric
            icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
            label="Učesnici"
            value={loading ? '—' : formatInt(data?.participants ?? 0)}
            sub="tipster"
          />
          <Metric
            icon={<Gift className="h-4 w-4 sm:h-5 sm:w-5" />}
            label="Ukupno nagrada"
            value={loading ? '—' : totalPrizeRsd}
            sub="freebets"
          />
          <Metric
            icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
            label="Aktivni tipovi"
            value={loading ? '—' : formatInt(data?.active_tips ?? 0)}
            sub="ovaj mesec"
          />
        </div>

        {/* Progress */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="opacity-90">Napredak takmičenja</span>
            <span>{loading ? '—' : `${Math.round(progress)}% završeno`}</span>
          </div>
          <Progress value={progress} className="bg-white/20 h-2 sm:h-3" />
          <div className="text-[11px] sm:text-xs opacity-80">
            {totalDays > 0 && !loading
              ? `Dan ${Math.max(0, totalDays - daysLeft)} / ${totalDays}`
              : '\u00A0'}
          </div>
        </div>

        {/* Prizes */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {prizes.map((p) => (
            <div
              key={p.place}
              className="dark:border dark:border-white/30  bg-white/10 rounded-xl p-3 sm:p-4 text-center ring-1 ring-white/10"
            >
              <div className="text-sm sm:text-base md:text-lg font-bold">
                {p.place === 1 ? '🥇' : p.place === 2 ? '🥈' : '🥉'} {p.place}. mesto
              </div>
              <div className="text-xs sm:text-sm opacity-90 line-clamp-2">{p.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/** Small, mobile-first metric card */
function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: string
}) {
  return (
    <div className="dark:border dark:border-white/30 text-center px-2 py-2 rounded-lg bg-white/5 ring-1 ring-white/10">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon}
        <span className="text-[11px] sm:text-xs opacity-90">{label}</span>
      </div>
      <div className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">{value}</div>
      {sub ? <div className="text-[11px] sm:text-xs opacity-75">{sub}</div> : null}
    </div>
  )
}
