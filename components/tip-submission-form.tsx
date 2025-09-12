'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calculator, Send, Star, Clock, Trophy, CheckCircle, Loader2 } from 'lucide-react'
import { apiService } from '@/lib/api-service'
// Optional: only used in success preview block if you keep it

interface TipSubmissionFormProps {
  onTipSubmitted?: (tip: any) => void
}

export type Match = {
  match_id: number
  matchup: string
  league: string
  country_name: string
  sport: string
  start_time: string // ISO string
  status?: 'live' | 'finished' | 'scheduled'
}

export type Offer = {
  odd: number
  bookie: string
}
export type MarketBets = {
  bet_name: string
  best_odd: number
  best_bookie: string
  avg_other: number
  market_diff_pct: number
  all_offers: Offer[]
}
export type Market = {
  bet_category: string
  bets: MarketBets[]
}

export function TipSubmissionForm({ onTipSubmitted }: TipSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [selectedLeague, setSelectedLeague] = useState('')
  const [allLeagues, setAllLeagues] = useState<string[]>([])
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [allMarkets, setAllMarkets] = useState<Market[]>([])

  const [selectedMatch, setSelectedMatch] = useState('')
  const [selectedSport, setSelectedSport] = useState('fudbal') // Default sport

  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date()
    const serbiaDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Belgrade',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(today)
    return serbiaDate
  })

  const [selectedBetType, setSelectedBetType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBookie, setSelectedBookie] = useState('')
  const [odds, setOdds] = useState('')
  const [stake, setStake] = useState('10')
  const [analysis, setAnalysis] = useState('')
  const [confidence, setConfidence] = useState('3')

  // Tri-state: null (unknown/loading), false (no tip yet), true (already has a tip)
  const [hasTipToday, setHasTipToday] = useState<boolean | null>(null)
  const [checkingTip, setCheckingTip] = useState(true)
  const [existingTip, setExistingTip] = useState<any | null>(null)

  // ====== Load "my pick status" first to avoid flicker ======
  useEffect(() => {
    let alive = true
    setCheckingTip(true)
    setHasTipToday(null)

    apiService
      .getMyPickStatus(selectedDay)
      .then((res: any) => {
        if (!alive) return
        setHasTipToday(!!res?.hasPick)
        setExistingTip(res?.pick ?? null)
      })
      .catch(() => {
        if (!alive) return
        setHasTipToday(false)
        setExistingTip(null)
      })
      .finally(() => alive && setCheckingTip(false))

    return () => {
      alive = false
    }
  }, [selectedDay])

  // ====== Data fetchers ======
  const fetchAllCategories = async () => {
    try {
      const data = await apiService.getBettingCompetitionFilters(selectedSport, selectedDay)
      setAllLeagues(Array.isArray(data) ? data : [])
    } catch {
      setAllLeagues([])
    }
  }

  const fetchAllMatches = async () => {
    if (!selectedLeague) {
      setAllMatches([])
      return
    }
    try {
      const data = await apiService.getBettingCompetitionMatchesForDay(
        selectedSport,
        selectedDay,
        selectedLeague
      )
      setAllMatches(Array.isArray(data) ? data : [])
    } catch {
      setAllMatches([])
    }
  }

  useEffect(() => {
    fetchAllCategories()
  }, [selectedSport, selectedDay])

  useEffect(() => {
    fetchAllMatches()
  }, [selectedSport, selectedDay, selectedLeague])

  const fetchAllMarkets = async (matchId: number) => {
    try {
      const data = await apiService.getBettingCompetitionMatchMarkets(matchId)
      setAllMarkets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching market details for match:', error)
      setAllMarkets([])
    }
  }

  const selectMatchForMarkets = async (matchId: number): Promise<void> => {
    await fetchAllMarkets(matchId)
  }

  // ====== Derived helpers ======
  const hasCompleteSelection = Boolean(selectedMatch && selectedBetType && selectedCategory)

  useEffect(() => {
    if (selectedMatch && selectedBetType && selectedCategory) {
      const matchOdds = allMarkets
        .flatMap((market) => market.bets)
        .find((bet) => String(bet.bet_name) === selectedBetType)

      if (matchOdds && matchOdds.best_odd > 0) {
        setOdds(matchOdds.best_odd.toString())
      }
    } else {
      setOdds('')
    }
  }, [selectedMatch, selectedBetType, selectedCategory, allMarkets])

  // Reset dependent selections when parent selection changes
  useEffect(() => {
    setSelectedMatch('')
    setSelectedBetType('')
    setSelectedCategory('')
    setOdds('')
    setValidationErrors([])
    setSubmitError('')
  }, [selectedLeague])

  useEffect(() => {
    setSelectedBetType('')
    setSelectedCategory('')
    setOdds('')
    setValidationErrors([])
    setSubmitError('')
  }, [selectedMatch])

  const validateForm = (): string[] => {
    const errors: string[] = []
    if (!selectedLeague) errors.push('Morate izabrati ligu')
    if (!selectedMatch) errors.push('Morate izabrati meč')
    if (!selectedBetType || !selectedCategory) errors.push('Morate izabrati tip klađenja')
    if (!odds || Number.parseFloat(odds) < 1.01) errors.push('Kvota mora biti veća od 1.01')
    if (!stake || Number.parseFloat(stake) < 1 || Number.parseFloat(stake) > 100) {
      errors.push('Ulog mora biti između 1 i 100 jedinica')
    }
    if (!analysis.trim() || analysis.trim().length < 20) {
      errors.push('Analiza mora imati najmanje 20 karaktera')
    }
    return errors
  }

  const resetForm = () => {
    setSelectedLeague('')
    setSelectedMatch('')
    setSelectedBetType('')
    setSelectedCategory('')
    setOdds('')
    setStake('10')
    setAnalysis('')
    setConfidence('3')
    setValidationErrors([])
    setSubmitError('')
    setSubmitSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setValidationErrors([])
    setSubmitError('')
    setSubmitSuccess(false)

    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }
    setIsSubmitting(true)

    try {
      const res = await apiService.submitTip({
        match_id: parseInt(selectedMatch, 10),
        bet_category: selectedCategory,
        bet_name: selectedBetType,
        bookie: selectedBookie,
        odd: parseFloat(odds),
        stake: parseInt(stake, 10),
        analysis,
        confidence: parseInt(confidence, 10),
      })

      // If your apiService throws on non-OK, this is enough.
      // If it returns a Response-like object, guard for .ok:
      if ((res as any)?.ok === false) {
        throw new Error('Greska na serveru, pokusajte ponovo.')
      }

      // Success
      setSubmitSuccess(true)
      setHasTipToday(true) // ensure state aligns after posting

      if (onTipSubmitted) onTipSubmitted(res)

      // Optional: reset after a delay
      setTimeout(() => {
        resetForm()
      }, 10000)
    } catch (err: any) {
      if (err?.status === 409) {
        // Already has tip today
        setHasTipToday(true)
      } else {
        console.error('Greška pri objavi tipa', err)
        setSubmitError(err?.message || 'Neuspelo objavljivanje.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ====== UI helpers ======
  const getMatchStatus = (match: Match) => {
    const now = new Date()
    const startTime = new Date(match.start_time)

    if (match.status === 'live') {
      return { text: 'UŽIVO', color: 'bg-red-500', icon: '🔴' }
    } else if (match.status === 'finished') {
      return { text: 'ZAVRŠEN', color: 'bg-gray-500', icon: '⚫' }
    } else if (startTime.getTime() - now.getTime() < 60 * 60 * 1000) {
      return { text: 'USKORO', color: 'bg-orange-500', icon: '🟠' }
    } else {
      return { text: 'ZAKAZAN', color: 'bg-green-500', icon: '🟢' }
    }
  }

  const formatTimeUntilMatch = (startTimeISO: string) => {
    const now = new Date()
    const matchTime = new Date(startTimeISO)
    const diffMs = matchTime.getTime() - now.getTime()
    if (diffMs < 0) return 'Počeo'

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return diffHours > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffMinutes}m`
  }

  const potentialWin =
    odds && stake ? (Number.parseFloat(odds) * Number.parseFloat(stake)).toFixed(2) : '0'
  const potentialProfit =
    odds && stake ? ((Number.parseFloat(odds) - 1) * Number.parseFloat(stake)).toFixed(2) : '0'

  // ====== Early returns to avoid flicker ======
  if (checkingTip || hasTipToday === null) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Proveravam da li već imaš tip za danas…
          </div>
        </CardContent>
      </Card>
    )
  }

  if (submitSuccess) {
    return (
      <Card>
        <CardContent className="pt-6 ">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Tip je uspešno objavljen!</h3>
              <p className="text-sm text-green-700 mt-2">
                Vaš tip je dodat u feed i učestvuje u mesečnoj konkurenciji.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2 text-left">
                <div>
                  <span className="font-medium">Meč:</span>
                  <p className="text-green-800">
                    {allMatches.find((m: Match) => m.match_id.toString() === selectedMatch)?.matchup ||
                      selectedMatch}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Tip:</span>
                  <p className="text-green-800">
                    {selectedCategory}: {selectedBetType}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Kvota:</span>
                  <p className="text-green-800">{odds}</p>
                </div>
                <div>
                  <span className="font-medium">Potencijalna dobit:</span>
                  <p className="text-green-800">+{potentialProfit} jedinica</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Forma će se resetovati za 10 sekundi...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasTipToday) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Send className="h-5 w-5" />
            Dodaj Novi Tip
          </CardTitle>
          <CardDescription className="text-sm">
            Podeli svoj tip sa zajednicom i takmiči se za mesečne nagrade
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Card className="border-yellow-400/40 bg-yellow-50/60 dark:bg-yellow-950/20">
            <CardContent className="py-4 text-sm">
              Već si objavio tip za <b>{selectedDay}</b>.
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  }

  // ====== Main form (only when hasTipToday === false) ======
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Send className="h-5 w-5" />
          Dodaj Novi Tip
        </CardTitle>
        <CardDescription className="text-sm">
          Podeli svoj tip sa zajednicom i takmiči se za mesečne nagrade
        </CardDescription>
      </CardHeader>

      <CardContent>
        {validationErrors.length > 0 && (
          <div className="mb-4 rounded-md border border-red-300/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
            <ul className="list-disc pl-4">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {submitError && (
          <div className="mb-4 rounded-md border border-red-300/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Step 1: League Selection */}
          <div className="space-y-2">
            <Label htmlFor="league" className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              1. Izaberi ligu
            </Label>
            <Select
              value={selectedLeague}
              onValueChange={setSelectedLeague}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-12 md:h-10">
                <SelectValue placeholder="Izaberi ligu..." />
              </SelectTrigger>
              <SelectContent>
                {allLeagues.map((league) => (
                  <SelectItem key={league} value={league}>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      {league}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Match Selection */}
          {selectedLeague && (
            <div className="space-y-2">
              <Label htmlFor="match" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                2. Izaberi meč
              </Label>
              <Select
                value={selectedMatch}
                onValueChange={(value) => {
                  setSelectedMatch(value)
                  selectMatchForMarkets(Number(value))
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 md:h-10">
                  <SelectValue placeholder="Izaberi meč za tipovanje..." />
                </SelectTrigger>
                <SelectContent>
                  {allMatches.map((m) => {
                    const status = getMatchStatus(m)
                    return (
                      <SelectItem key={m.match_id} value={m.match_id.toString()}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{status.icon}</span>
                            <span className="font-medium">{m.matchup}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {formatTimeUntilMatch(m.start_time)}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs text-white ${status.color}`}
                            >
                              {status.text}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Bet Type Selection */}
          {selectedMatch && allMarkets.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                3. Izaberi tip klađenja
              </Label>

              {allMarkets.map((market) => (
                <div key={market.bet_category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {market.bet_category}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {market.bets.map((bet) => (
                      <Button
                        key={`${market.bet_category}-${bet.bet_name}`}
                        type="button"
                        variant={
                          selectedBetType === bet.bet_name &&
                          selectedCategory === market.bet_category
                            ? 'default'
                            : 'outline'
                        }
                        className="h-12 md:h-10 text-sm"
                        onClick={() => {
                          setSelectedBetType(bet.bet_name)
                          setSelectedCategory(market.bet_category)
                          setSelectedBookie(bet.best_bookie)
                        }}
                      >
                        {bet.bet_name} - {bet.best_odd.toFixed(2)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stake Input */}
          {hasCompleteSelection && (
            <div className="space-y-2">
              <Label htmlFor="stake" className="text-sm font-medium">
                Ulog (jedinica)
              </Label>
              <Input
                id="stake"
                type="number"
                min="1"
                max="100"
                placeholder="10"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="h-12 md:h-10 text-base md:text-sm"
              />
            </div>
          )}

          {/* Calculation Display */}
          {hasCompleteSelection && odds && stake && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4" />
                  <span className="font-medium text-sm">Kalkulacija</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between md:block">
                    <p className="text-muted-foreground">Potencijalna dobit:</p>
                    <p className="font-bold text-green-600 md:mt-1">+{potentialProfit} jedinica</p>
                  </div>
                  <div className="flex justify-between md:block">
                    <p className="text-muted-foreground">Ukupan povraćaj:</p>
                    <p className="font-bold md:mt-1">{potentialWin} jedinica</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confidence Level */}
          {hasCompleteSelection && (
            <div className="space-y-2">
              <Label htmlFor="confidence" className="text-sm font-medium">
                Nivo pouzdanosti
              </Label>
              <Select value={confidence} onValueChange={setConfidence} disabled={isSubmitting}>
                <SelectTrigger className="h-12 md:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <SelectItem key={val} value={String(val)}>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < val ? 'fill-current' : ''}`} />
                        ))}
                        <span>
                          {val === 1
                            ? 'Nizak'
                            : val === 2
                            ? 'Umeren'
                            : val === 3
                            ? 'Visok'
                            : val === 4
                            ? 'Vrlo visok'
                            : 'Maksimalan'}{' '}
                          ({val}⭐)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Analysis */}
          {hasCompleteSelection && (
            <div className="space-y-2">
              <Label htmlFor="analysis" className="text-sm font-medium">
                Analiza i obrazloženje
              </Label>
              <Textarea
                id="analysis"
                placeholder="Objasni zašto veruješ u ovaj tip... (statistike, forma timova, povrede, motivacija, itd.)"
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                rows={4}
                className="resize-none text-base md:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Kvalitetna analiza povećava tvoj kredibilitet u zajednici
              </p>
            </div>
          )}

          {/* Submit Button */}
          {hasCompleteSelection && (
            <Button
              type="submit"
              className="w-full h-12 md:h-10 text-base md:text-sm"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Objavljujem tip...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Objavi Tip
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
