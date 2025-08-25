'use client'

import type React from 'react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { apiService } from '../../lib/api-service'
import {
  Trophy,
  TrendingUp,
  Percent,
  ArrowRight,
  Ticket,
  Newspaper,
  Send,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type {
  BookiesData,
  Match,
  BestOddResult,
  DailyTicketResult,
  DailyTicketLeg,
  BetTypeSelection,
  TopMatches,
} from '../../types/bookies'
import { sportsConfigService } from '@/lib/sports-config'
import type { MarketDeviation } from '../../types/bookies'
import { BetAnalysisModal } from '@/components/bet-analysis-modal'
import { DailyTicket } from '@/components/daily-ticket'
import { MatchCarousel } from '@/components/match-carousel'
import { get } from 'http'
import { BetOfTheDay } from '@/components/bet-of-the-day'

const blogPosts = [
  {
    id: '1',
    title: 'Najbolje kvote za večiti derbi',
    excerpt: 'Uporedili smo sve kladionice i pronašli najbolje kvote za derbi...',
    date: '2025-08-01',
  },
  {
    id: '2',
    title: 'Kladionice sa najvećim bonusima u Srbiji',
    excerpt: 'Pregled licenciranih operatera sa najvećim bonusima dobrodošlice.',
    date: '2025-07-28',
  },
  {
    id: '3',
    title: 'Šta je value bet i kako ga pronaći',
    excerpt: 'Objašnjenje koncepta value beta i praktični primeri...',
    date: '2025-07-20',
  },
]

const navigateToQuickHub = (param: string) => {
  // For Next.js App Router
  if (typeof window !== 'undefined') {
    window.location.href = `/kvote?${param}&datespan=svi`
  }
}
function findBestOddOfDay(data: BookiesData): BestOddResult | null {
  let best: BestOddResult | null = null

  data.forEach((match) => {
    match.bookies.forEach((bookie) => {
      bookie.categories.forEach((cat) => {
        cat.odds.forEach((o) => {
          const values: number[] = match.bookies
            .map((b) => b.categories.find((c) => c.category === cat.category))
            .map((c) => c?.odds.find((x) => x.type === o.type)?.value)
            .filter((v): v is number => typeof v === 'number')
          if (values.length === 0) return
          const avg = values.reduce((a, b) => a + b, 0) / values.length
          const improvementPct = avg > 0 ? ((o.value - avg) / avg) * 100 : 0
          if (!best || o.value > best.odd) {
            best = {
              matchId: match.id,
              matchup: match.matchup,
              league: match.league,
              category: cat.category,
              type: o.type,
              bookie: bookie.name,
              odd: o.value,
              marketAvg: avg,
              improvementPct,
            }
          }
        })
      })
    })
  })
  return best
}

function best1X2ForMatch(match: Match) {
  const outcomes = ['1', 'X', '2'] as const
  return outcomes.map((t) => {
    let best = 0,
      bestBookie: string | null = null
    match.bookies.forEach((b) => {
      const cat = b.categories.find((c) => c.category === 'Result')
      const val = cat?.odds.find((o) => o.type === t)?.value
      if (val && val > best) {
        best = val
        bestBookie = b.name
      }
    })
    return { type: t, odd: best || null, bookie: bestBookie }
  })
}

export default function Landing() {
  const [selectedSport, setSelectedSport] = useState<string>(sportsConfigService.getDefaultSport())
  const [allMarketDeviations, setMarketDeviations] = useState<MarketDeviation[]>([]) // Store all matches from API
  const [allTopMatches, setTopMatches] = useState<TopMatches[]>([]) // Store all matches from API

  const [dailyTicket, setDailyTicket] = useState<DailyTicketLeg[]>([]) // Store all matches from API
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false)
  const [analysisSelections, setAnalysisSelections] = useState<BetTypeSelection[]>([])
  const [analysisStake, setAnalysisStake] = useState<number>(200)
  const getTodayDate = (): string => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // Returns date in YYYY-MM-DD format
  }
  const fetchMarketDeviations = async () => {
    const data = await apiService.getMarketDeviations(selectedSport)

    let market_deviations: MarketDeviation[] = []
    if (Array.isArray(data)) {
      // API returns array directly: [{match1}, {match2}, ...]
      market_deviations = data
    } else if (data && typeof data === 'object') {
      // API returns object with matches array
      market_deviations =
        (
          data as {
            matches?: MarketDeviation[]
            data?: MarketDeviation[]
            results?: MarketDeviation[]
          }
        ).matches ||
        (
          data as {
            matches?: MarketDeviation[]
            data?: MarketDeviation[]
            results?: MarketDeviation[]
          }
        ).data ||
        (
          data as {
            matches?: MarketDeviation[]
            data?: MarketDeviation[]
            results?: MarketDeviation[]
          }
        ).results ||
        []
    }
    setMarketDeviations(market_deviations)
  }

  useEffect(() => {
    fetchMarketDeviations()
  }, [selectedSport])

  const fetchTopMatches = async () => {
    const data = await apiService.getTopMatches(getTodayDate())

    let top_matches: TopMatches[] = []
    if (Array.isArray(data)) {
      // API returns array directly: [{match1}, {match2}, ...]
      top_matches = data
    } else if (data && typeof data === 'object') {
      // API returns object with matches array
      top_matches =
        (data as { matches?: TopMatches[]; data?: TopMatches[]; results?: TopMatches[] }).matches ||
        (data as { matches?: TopMatches[]; data?: TopMatches[]; results?: TopMatches[] }).data ||
        (data as { matches?: TopMatches[]; data?: TopMatches[]; results?: TopMatches[] }).results ||
        []
    }
    setTopMatches(top_matches)
  }

  useEffect(() => {
    fetchTopMatches()
  }, [getTodayDate()])

  const fetchDailyTicket = async () => {
    const data = await apiService.getDailyPicks(getTodayDate())
    console.log(data, 'This is daily ticket data')
    let daily_ticket: DailyTicketLeg[] = []
    if (Array.isArray(data)) {
      // API returns array directly: [{match1}, {match2}, ...]
      daily_ticket = data
    } else if (data && typeof data === 'object') {
      // API returns object with matches array
      daily_ticket =
        (
          data as {
            matches?: DailyTicketLeg[]
            data?: DailyTicketLeg[]
            results?: DailyTicketLeg[]
          }
        ).matches ||
        (
          data as {
            matches?: DailyTicketLeg[]
            data?: DailyTicketLeg[]
            results?: DailyTicketLeg[]
          }
        ).data ||
        (
          data as {
            matches?: DailyTicketLeg[]
            data?: DailyTicketLeg[]
            results?: DailyTicketLeg[]
          }
        ).results ||
        []
    }
    setDailyTicket(daily_ticket)
  }
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchDailyTicket()
  })

  const dailyBets = dailyTicket
  const marketDeviation = allMarketDeviations[0]
  const topMatches = allTopMatches

  const onCTA = useCallback(() => {
    window.location.href = '/kvote?sport=fudbal&datespan=danas'
  }, [])

  const onOpenTickets = useCallback(() => {
    alert('Preview: otvorili bismo affiliate linkove za svaku nogu.')
  }, [])

  const onNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('Hvala! (Preview) Upisali bismo vaš email.')
    e.currentTarget.reset()
  }

  /** Mapira jedan red u BetTypeSelection */
  function toBetTypeSelection(row: DailyTicketLeg): BetTypeSelection {
    const matchIdNum = Number(row.match_id)
    const oddNum =
      row.odd === undefined || row.odd === null || row.odd === '' ? undefined : Number(row.odd)

    const out: BetTypeSelection = {
      matchId: Number.isFinite(matchIdNum) ? matchIdNum : 0,
      matchup: `${row.home_team} vs ${row.away_team}`,
      league: row.competition_name,
      category: row.bet_category,
      type: row.bet_name,
    }

    if (oddNum !== undefined && Number.isFinite(oddNum)) {
      out.odd = oddNum
    }
    if (row.bookie && row.bookie.trim()) {
      out.bookie = row.bookie.trim()
    }

    return out
  }

  const handleAnalyzeBet = (selections: DailyTicketLeg[], stake: number) => {
    const selections_data = selections.map((s) => toBetTypeSelection(s))
    setAnalysisSelections(selections_data)
    setAnalysisStake(stake)
    setAnalysisModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-kvotizza-dark-bg-10">
      <section className="border-b dark:border-white/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
          {/* Hero Content */}
          <div className="space-y-6 mb-8 md:mb-12">
            {/* Kvotizza Branding */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src="/images/kvotizza-logo.png"
                  alt="Kvotizza Logo"
                  width={200}
                  height={200}
                  className="block dark:hidden h-20 w-auto"
                />
                <Image
                  src="/images/kvotizza-logo-white.png"
                  alt="Kvotizza Logo"
                  width={200}
                  height={200}
                  className="h-20 w-auto hidden dark:block"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-kvotizza-green-500">Kvotizza</h2>
                <p className="text-sm text-muted-foreground">Pametno poređenje kvota</p>
              </div>
            </div>

            <Badge className="w-fit bg-sport-blue-500 hover:bg-sport-blue-500 dark:text-white">
              Kvote u realnom vremenu • Mnogi licencirani operateri
            </Badge>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Uporedi kvote svih kladionica u Srbiji u
              <span className="text-sport-green-600"> realnom vremenu</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              <span className="font-semibold text-sport-blue-500">Kvotizza</span> ti pomaže da
              pronađeš najbolju kvotu, izgradiš optimalan tiket i povećaš eventualni dobitak.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-sport-green-600 hover:bg-kvotizza-green-500 text-white font-semibold"
                onClick={onCTA}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Pogledaj sve kvote za fudbal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 border-t border-muted">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4 text-kvotizza-green-400" />
                <span>Licencirane kladionice</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-kvotizza-blue-400" />
                <span>Live kvote</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-kvotizza-yellow-500" />
                <span>Najbolje kvote</span>
              </div>
            </div>
          </div>
          <div className="max-w-2xl mx-auto">
            <BetOfTheDay marketDeviation={marketDeviation} />
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12 border-y dark:border-white/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-semibold mb-4">Brzi linkovi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* {['Fudbal', 'Engleska 1', 'Italija 1', 'Španija 1', 'Srbija 1', 'Nemačka 1'].map( */}
            <button key={'Fudbal'} onClick={(e) => {
                e.stopPropagation()
                navigateToQuickHub('sport=fudbal')
              }}>
              <Card className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 dark:border-white/30 dark:hover:bg-kvotizza-dark-bg-10">
                <CardContent className="p-4 text-center font-medium">Fudbal</CardContent>
              </Card>
            </button>
            <button
              key={'Engleska 1'}
              onClick={(e) => {
                e.stopPropagation()
                navigateToQuickHub('sport=fudbal&league=Engleska 1')
              }}
            >
              <Card className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 dark:border-white/30 dark:hover:bg-kvotizza-dark-bg-10">
                <CardContent className="p-4 text-center font-medium">Engleska 1</CardContent>
              </Card>
            </button>
            <button
              key={'Srbija 1'}
              onClick={(e) => {
                e.stopPropagation()
                navigateToQuickHub('fudbal')
              }}
            >
              <Card className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 dark:border-white/30 dark:hover:bg-kvotizza-dark-bg-10">
                <CardContent className="p-4 text-center font-medium">Srbija 1</CardContent>
              </Card>
            </button>
            <button
              key={'Italija 1'}
              onClick={(e) => {
                e.stopPropagation()
                navigateToQuickHub('fudbal')
              }}
            >
              <Card className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 dark:border-white/30 dark:hover:bg-kvotizza-dark-bg-10">
                <CardContent className="p-4 text-center font-medium">Italija 1</CardContent>
              </Card>
            </button>
            <button
              key={'Nemačka 1'}
              onClick={(e) => {
                e.stopPropagation()
                navigateToQuickHub('fudbal')
              }}
            >
              <Card className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 dark:border-white/30 dark:hover:bg-kvotizza-dark-bg-10">
                <CardContent className="p-4 text-center font-medium">Nemačka 1</CardContent>
              </Card>
            </button>
            <button
              key={'Španija 1'}
              onClick={(e) => {
                e.stopPropagation()
                navigateToQuickHub('fudbal')
              }}
            >
              <Card className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 dark:border-white/30 dark:hover:bg-kvotizza-dark-bg-10">
                <CardContent className="p-4 text-center font-medium">Španija 1</CardContent>
              </Card>
            </button>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Top mečevi danas
          </h2>
          <MatchCarousel matches={allTopMatches} />
        </div>
      </section>

      <section className="py-10 md:py-14 ">
        <div className="max-w-7xl mx-auto px-4 md:px-8 ">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">Tiket dana</h2>
          </div>
          <Card>
            <CardContent className="p-4 md:p-6 dark:bg-kvotizza-dark-bg-20 rounded border border-md bg-muted/30">
              <DailyTicket bets={dailyBets} onAnalyze={handleAnalyzeBet} initialStake={100} />

              <BetAnalysisModal
                isOpen={analysisModalOpen}
                onClose={() => setAnalysisModalOpen(false)}
                selections={analysisSelections}
                stake={analysisStake}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 
      <section className="py-10 md:py-12 border-y dark:border-white/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-sport-blue-600" />
              Blog / vodiči
            </h3>
            <Button variant="ghost" onClick={() => alert('Preview: arhiva bloga')}>
              Vidi sve
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('sr-RS')}
                  </p>
                  <h4 className="font-semibold mt-1">{post.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                  <Button
                    variant="link"
                    className="px-0"
                    onClick={() => alert('Preview: blog post')}
                  >
                    Pročitaj više
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-sport-blue-600" />
                Svako jutro pošaljemo najbolju kvotu dana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onNewsletterSubmit} className="grid gap-3 md:grid-cols-3">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email adresa"
                  required
                  className="md:col-span-2"
                />
                <Button
                  type="submit"
                  className="bg-sport-green-500 hover:bg-sport-green-600 text-black"
                >
                  Prijavi se
                </Button>
                <Input
                  name="telegram"
                  type="text"
                  placeholder="Telegram @username (opciono)"
                  className="md:col-span-3"
                />
              </form>
              <div className="mt-3">
                <button
                  onClick={() => alert('Preview: otvaranje Telegram kanala')}
                  className="text-sport-blue-700 hover:underline inline-flex items-center gap-2"
                >
                  Pridruži se Telegram kanalu <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section> */}

      <footer className="border-t dark:border-white/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-sport-red-500" />
              <span className="font-medium">Igraj odgovorno • 18+</span>
            </div>
            {/* <div className="text-muted-foreground">
              Svi operateri su licencirani.{' '}
              <button
                className="underline hover:no-underline"
                onClick={() => alert('Preview: Licencirane kladionice & affiliate disclosure')}
              >
                Lista licenciranih kladionica i affiliate disclosure
              </button>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  )
}
