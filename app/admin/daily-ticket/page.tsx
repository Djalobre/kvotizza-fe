// app/admin/daily-ticket/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Leg, Market, MatchCand } from '@/types/bookies'
import { apiService } from '@/lib/api-service'

export default function DailyTicketAdmin() {
  const [sport, setSport] = useState<string>('Fudbal')
  const [day, setDay] = useState<string>('')
  const [leagues, setLeagues] = useState<string[]>([])
  const [allLeagues, setAllLeagues] = useState<string[]>([])
  const [allBetCategories, setAllBetCategories] = useState<string[]>([])
  const [betCategories, setBetCategories] = useState<string[]>([])

  const [cands, setCands] = useState<MatchCand[]>([])
  const [legs, setLegs] = useState<Leg[]>([])
  const [notes, setNotes] = useState<string>('')

  const totalOdds = useMemo(() => legs.reduce((acc, l) => acc * (Number(l.odd) || 1), 1), [legs])

  // load leagues for filters
  const fetchCandidates = async () => {
    const data = await apiService.getCandidates(sport, day, leagues, betCategories)
    // Handle different API response formats
    let matchCandidates: MatchCand[] = []
    if (Array.isArray(data)) {
      // API returns array directly: [{match1}, {match2}, ...]
      matchCandidates = data
    } else if (data && typeof data === 'object') {
      // API returns object with matches array
      matchCandidates =
        (data as { matches?: MatchCand[]; data?: MatchCand[]; results?: MatchCand[] }).matches ||
        (data as { matches?: MatchCand[]; data?: MatchCand[]; results?: MatchCand[] }).data ||
        (data as { matches?: MatchCand[]; data?: MatchCand[]; results?: MatchCand[] }).results ||
        []
    }

    setCands(matchCandidates)
  }

  const fetchFilters = async () => {
    const data = await apiService.loadFilters(sport, day)
    console.log(data, 'api filters')
    // Handle different API response formats
    if (data && typeof data === 'object') {
      setAllLeagues(data.leagues || [])
      setAllBetCategories(data.categories)
    }
    // API returns array directly: [{match1}, {match2}, ...]
  }

  useEffect(() => {
    if (sport && day) setCands([])
    setAllLeagues([])
    setLeagues([])
    setAllBetCategories([])
    setBetCategories([])
    if (sport && day) fetchFilters()
  }, [sport, day])

  const addLeg = (m: MatchCand, mk: Market) => {
    const leg: Leg = {
      odd: mk.odd,
      bookie: mk.bookie,
      bet_name: mk.bet_name,
      match_id: m.match_id,
      avg_other: mk.avg_other ?? null,
      away_team: m.away_team,
      home_team: m.home_team,
      sport_name: m.sport_name,
      start_time: m.start_time,
      bet_category: mk.bet_category,
      country_name: m.country_name,
      market_diff_pct: mk.market_diff_pct ?? null,
      competition_name: m.competition_name,
    }
    setLegs((prev) => [...prev, leg])
  }

  const removeLeg = (idx: number) => {
    setLegs((prev) => prev.filter((_, i) => i !== idx))
  }

  const saveTicket = async () => {
    console.log({ pick_date: day, legs, notes })

    if (!day || legs.length === 0) {
      alert('Pick a date and add at least one leg.')
      return
    }
    const res = await apiService.saveTicket({ pick_date: day, legs, notes })
    setLegs([])
    setNotes('')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Ticket — Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-end">
          <div className="w-48">
            <label className="text-xs text-muted-foreground">Sport</label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fudbal">Fudbal</SelectItem>
                <SelectItem value="Košarka">Košarka</SelectItem>
                {/* add more */}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <label className="text-xs text-muted-foreground">Date</label>
            <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div className="min-w-[300px]">
            <label className="text-xs text-muted-foreground">Leagues (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allLeagues.map((l) => {
                const active = leagues.includes(l)
                return (
                  <Badge
                    key={l}
                    variant={active ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      setLeagues((prev) => (active ? prev.filter((x) => x !== l) : [...prev, l]))
                    }
                  >
                    {l}
                  </Badge>
                )
              })}
            </div>
          </div>

          <div className="min-w-[300px]">
            <label className="text-xs text-muted-foreground">Bet Categories (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allBetCategories.map((l) => {
                const active = betCategories.includes(l)
                return (
                  <Badge
                    key={l}
                    variant={active ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      setBetCategories((prev) =>
                        active ? prev.filter((x) => x !== l) : [...prev, l]
                      )
                    }
                  >
                    {l}
                  </Badge>
                )
              })}
            </div>
          </div>
          <Button onClick={fetchCandidates}>Load Candidates</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matches & Markets (best odds)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cands.length === 0 && (
            <p className="text-sm text-muted-foreground">No candidates loaded.</p>
          )}
          {cands.map((m) => (
            <div key={m.match_id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {m.home_team} vs {m.away_team}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.competition_name} • {m.country_name} •{' '}
                    {new Date(m.start_time).toLocaleString()}
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {m.markets.map((mk, idx) => (
                  <div
                    key={idx}
                    className="border rounded-md p-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">{mk.bet_category}</div>
                      <div className="text-xs text-muted-foreground">{mk.bet_name}</div>
                      <div className="text-xs">
                        <span className="font-semibold">{mk.odd.toFixed(2)}</span> @{mk.bookie}
                      </div>
                      {mk.avg_other && (
                        <div className="text-[11px] text-muted-foreground">
                          avg: {mk.avg_other.toFixed(2)}{' '}
                          {mk.market_diff_pct != null && (
                            <>• Δ {Math.round(mk.market_diff_pct * 100)}%</>
                          )}
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => addLeg(m, mk)}>
                      Add leg
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            Total odds: <b>{totalOdds.toFixed(2)}</b>
          </div>
          <div className="space-y-2">
            {legs.map((l, i) => (
              <div key={i} className="flex items-center justify-between border rounded-md p-2">
                <div className="text-sm">
                  <b>
                    {l.home_team} vs {l.away_team}
                  </b>{' '}
                  — {l.bet_category} / {l.bet_name} •
                  <span className="ml-1">
                    {l.odd.toFixed(2)} @{l.bookie}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeLeg(i)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={saveTicket}>Save ticket</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
