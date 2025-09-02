'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { apiService } from '@/lib/api-service'
import type { BasicMatch } from '@/types/bookies'
import { Badge } from '@/components/ui/badge'

/* ---------- Quick markets mapping (1 / X / 2) ---------- */
const BET_KEYS = ['konacanIshod1', 'konacanIshodX', 'konacanIshod2'] as const
type BetKey = (typeof BET_KEYS)[number]

const BET_LABELS: Record<BetKey, string> = {
  konacanIshod1: 'Konačan ishod 1',
  konacanIshodX: 'Konačan ishod X',
  konacanIshod2: 'Konačan ishod 2',
}

type QuickMarket = { bestOdds: number; bestBookie: string }
type QuickMarkets = Record<string, QuickMarket>

/* ---------- Component ---------- */
export default function TopMatchesSelection() {
  const [sport, setSport] = useState('fudbal')
  const [leagues, setLeagues] = useState<string[]>([])
  const [allLeagues, setAllLeagues] = useState<string[]>([])

  const [date, setDate] = useState('')
  const [matches, setMatches] = useState<BasicMatch[]>([])
  const [pickDate, setPickDate] = useState('')

  /** Persistent selection across filters */
  type SelectedItem = { match: BasicMatch; betKeys: BetKey[] }
  const [selectedMap, setSelectedMap] = useState<Record<number, SelectedItem>>({})
  const selectedIds = Object.keys(selectedMap).map(Number)

  /* --------- UI handlers --------- */
  const toggleSelect = (m: BasicMatch) => {
    setSelectedMap((prev) => {
      if (prev[m.id]) {
        const { [m.id]: _, ...rest } = prev
        return rest // unselect
      }
      // default: include available 1/X/2 bet keys for this match
      const present = BET_KEYS.filter((k) => m.quickMarkets?.[k])
      return { ...prev, [m.id]: { match: m, betKeys: present } }
    })
  }

  const toggleBet = (matchId: number, key: BetKey, checked: boolean) => {
    setSelectedMap((prev) => {
      const item = prev[matchId]
      if (!item) return prev // not selected
      const s = new Set(item.betKeys)
      checked ? s.add(key) : s.delete(key)
      return { ...prev, [matchId]: { ...item, betKeys: Array.from(s) as BetKey[] } }
    })
  }

  const fetchFilters = async () => {
    const data = await apiService.loadFilters(sport, date)
    console.log(data, 'api filters')
    // Handle different API response formats
    if (data && typeof data === 'object') {
      setAllLeagues(data.leagues || [])
    }
    // API returns array directly: [{match1}, {match2}, ...]
  }

  useEffect(() => {
    setAllLeagues([])
    setLeagues([])
    if (sport && date) fetchFilters()
  }, [sport, date])

  /* --------- Fetch + merge (do NOT clear selections) --------- */
  const fetchMatches = async () => {
    try {
      const data = await apiService.getMatchupEvents(sport, date, leagues)
      let rows: BasicMatch[] = Array.isArray(data)
        ? data
        : (data as { data?: BasicMatch[]; results?: BasicMatch[] })?.data || []
      setMatches(rows)

      // refresh stored match info for already selected items if they reappear in the current page
      setSelectedMap((prev) => {
        const next = { ...prev }
        for (const m of rows) {
          if (next[m.id]) next[m.id] = { ...next[m.id], match: m }
        }
        return next
      })
    } catch (error) {
      console.error('Error fetching matches:', error)
    }
  }

  /* --------- Build payload from persistent selections --------- */
  const saveTopMatches = async () => {
    if (!pickDate || selectedIds.length === 0) {
      alert('Pick date & at least one match required!')
      return
    }

    const payloadMatches = Object.values(selectedMap).map(({ match: m, betKeys }) => {
      const bets = Object.fromEntries(
        betKeys
          .filter((k) => m.quickMarkets?.[k])
          .map((k) => [
            BET_LABELS[k],
            {
              bestOdds: m.quickMarkets?.[k] ? Number(m.quickMarkets[k].bestOdds) : 0,
              bestBookie: m.quickMarkets?.[k]?.bestBookie || 'Unknown',
              key: k,
            },
          ])
      )

      return {
        id: m.id,
        matchup: m.matchup,
        league: m.league,
        country: m.country_name,
        start_time: m.start_time, // ISO string
        sport, // current sport filter; change if you store per-match sport
        bets,
      }
    })

    const body = {
      pick_date: pickDate,
      sport,
      created_by: 'admin',
      matches: payloadMatches,
    }

    const resp = await fetch(`/api/top-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      console.error(err)
      alert(`Save failed: ${resp.status}`)
      return
    }

    alert('Top matches saved!')
    // optional: keep selections after save → comment next line if you want to persist
    setSelectedMap({})
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Matches</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select onValueChange={setSport} defaultValue={sport}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fudbal">Fudbal</SelectItem>
              <SelectItem value="kosarka">Košarka</SelectItem>
              {/* extend sports if needed */}
            </SelectContent>
          </Select>

          <div className="min-w-[300px]">
            <label className="text-xs text-muted-foreground">Leagues (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allLeagues.map((l) => {
                const active = leagues.includes(l)
                return (
                  <Badge
                    key={l}
                    className="cursor-pointer"
                    variant={active ? 'default' : 'outline'}
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

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[200px]"
          />

          <Button onClick={fetchMatches}>Fetch Matches</Button>
        </CardContent>
      </Card>

      {/* Matches list */}
      <Card>
        <CardHeader>
          <CardTitle>Available Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {matches.length === 0 && <p>No matches found.</p>}

          {matches.map((m) => {
            const isSelected = !!selectedMap[m.id]
            const chosen = selectedMap[m.id]?.betKeys ?? BET_KEYS.filter((k) => m.quickMarkets?.[k])
            return (
              <div key={m.id} className="flex items-center gap-2 border-b py-2">
                <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(m)} />
                <span className="font-medium">{m.matchup}</span>
                <span className="text-muted-foreground text-sm">{m.league}</span>
                <span className="text-muted-foreground text-sm">
                  {new Date(m.start_time).toLocaleString()}
                </span>

                {/* Bet dropdown per match */}
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Betovi (1X2)
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {BET_KEYS.map((k) => {
                        const available = !!m.quickMarkets?.[k]
                        const checked = chosen.includes(k)
                        const mk = m.quickMarkets?.[k]
                        return (
                          <DropdownMenuCheckboxItem
                            key={k}
                            disabled={!available || !isSelected}
                            checked={checked}
                            onCheckedChange={(v) => toggleBet(m.id, k, Boolean(v))}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <span>{BET_LABELS[k]}</span>
                              <span className="text-xs text-muted-foreground">
                                {available
                                  ? `${mk!.bestOdds.toFixed(2)} @ ${mk!.bestBookie}`
                                  : 'n/a'}
                              </span>
                            </div>
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Save block */}
      <Card>
        <CardHeader>
          <CardTitle>Save as Top Matches</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="text-sm text-muted-foreground">
            Selected: <b>{selectedIds.length}</b>
          </div>
          <Input
            type="date"
            value={pickDate}
            onChange={(e) => setPickDate(e.target.value)}
            className="w-[200px]"
          />
          <Button onClick={saveTopMatches} disabled={!pickDate || selectedIds.length === 0}>
            Save Top Matches
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
