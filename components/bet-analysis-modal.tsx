"use client"
import { outUrl } from "@/lib/tracking";
import { useState, useEffect } from "react"
import { TrendingUp, Trophy, Copy,AlertTriangle, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader,TableHeadMini, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import type { BetTypeSelection, BetSelection,BookieSummary, BetAnalysisResult, BookieOddsComparison } from "../types/bookies"
import { bonusCalculatorService } from "@/lib/bonus-config"

interface BetAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  selections: BetTypeSelection[]
  stake: number
}

export function BetAnalysisModal({ isOpen, onClose, selections, stake }: BetAnalysisModalProps) {
  const [bookieSummaries, setBookieSummaries] = useState<BookieSummary[]>([])
  const [detailedAnalysis, setDetailedAnalysis] = useState<BetAnalysisResult[]>([])
  const [bonusAnalysis, setBonusAnalysis] = useState<{ [bookie: string]: any }>({})
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<
  Array<{
    bookie: string
    suggestion: string
    potentialBonus: number
    currentBonus: number
  }>
>([])


  useEffect(() => {
    if (isOpen && selections.length > 0) {
      analyzeAcrossBookies()
    }
  }, [isOpen, selections, stake])

  const analyzeAcrossBookies = async () => {
    // Get all unique bookies from the selections by fetching their detailed match data
    const allBookies = new Set<string>()
    const matchDetailsMap = new Map<number, any>()
    // Fetch detailed data for all matches in selections
    try {
      const matchIds = [...new Set(selections.map((s) => s.matchId))]

      for (const matchId of matchIds) {
        try {
          const response = await fetch(`/api/matches/${matchId}`)
          if (response.ok) {
            const matchData = await response.json()
            matchDetailsMap.set(matchId, matchData)

            // Collect all bookie names
            matchData.bookies?.forEach((bookie: any) => {
              allBookies.add(bookie.name)
            })
          }
        } catch (error) {
          console.error(`Failed to fetch match ${matchId}:`, error)
        }
      }

      // Analyze each selection across all bookies
      const analysisResults: BetAnalysisResult[] = []

      selections.forEach((selection) => {
        const matchData = matchDetailsMap.get(selection.matchId)
        if (!matchData) return

        // console.log(matchData, "match data")
        const bookieOdds: BookieOddsComparison[] = []
        let bestOdds = 0
        let bestBookie = ""

        Array.from(allBookies).forEach((bookieName) => {
          const bookie = matchData.bookies.find((b: any) => b.name === bookieName)
          // console.log(bookie, "bookie data")
          let odds: number | null = null
          let available = false
          if (bookie) {
            const category = bookie.categories?.find((c: any) => c.category === selection.category)
            if (category) {
              const odd = category.odds?.find((o: any) => o.type === selection.type)
              if (odd && odd.value !== null && odd.value > 0) {
                odds = odd.value
                available = true
                if (odds !== null && odds > bestOdds) {
                  bestOdds = odds
                  bestBookie = bookieName
                }
              }
            }
          }

          bookieOdds.push({
            bookie: bookieName,
            odds,
            available,
          })
        })

        analysisResults.push({
          selection,
          bookieOdds,
          bestOdds,
          bestBookie,
        })
      })

      setDetailedAnalysis(analysisResults)

      // Create bookie summaries
      const summaries: BookieSummary[] = []
      const betSelections: BetSelection[] = []


      Array.from(allBookies).forEach((bookieName) => {
        let totalOdds = 1
        let availableSelections = 0
        const missingSelections: BetTypeSelection[] = []

        selections.forEach((selection) => {
          const matchData = matchDetailsMap.get(selection.matchId)
          // console.log(matchData, "match data for selection")
          if (!matchData) {
            missingSelections.push(selection)
            return
          }

          const bookie = matchData.bookies?.find((b: any) => b.name === bookieName)
          if (!bookie) {
            missingSelections.push(selection)
            return
          }

          const category = bookie.categories?.find((c: any) => c.category === selection.category)
          if (!category) {
            missingSelections.push(selection)
            return
          }

          const odd = category.odds?.find((o: any) => o.type === selection.type)
          if (!odd || odd.value === null || odd.value <= 0) {
            missingSelections.push(selection)
            return
          }

          totalOdds *= odd.value
          availableSelections++

          betSelections.push({
            id: `${selection.matchId}-${selection.category}-${selection.type}-${bookieName}`,
            matchId: selection.matchId,
            matchup: selection.matchup,
            league: selection.league,
            category: selection.category,
            type: selection.type,
            odds: odd.value,
            bookie: bookieName,
          })
        })

        // Only include bookies that have at least some of the selections
        if (availableSelections > 0) {
          summaries.push({
            bookie: bookieName,
            totalOdds,
            potentialWin: stake * totalOdds,
            availableSelections,
            missingSelections,
            allAvailable: missingSelections.length === 0,
          })
        }
      })

         // Calculate bonus analysis
      const bonusResults = bonusCalculatorService.calculateAllBonuses(betSelections, stake)
      setBonusAnalysis(bonusResults)

      // Get optimization suggestions
      const suggestions = bonusCalculatorService.getBonusOptimizationSuggestions(betSelections, stake)
      setOptimizationSuggestions(suggestions)

      // Update summaries with bonus information
      summaries.forEach((summary) => {
        const bonus = bonusResults[summary.bookie]
        if (bonus && bonus.bonusAmount > 0) {
          summary.potentialWin += bonus.bonusAmount
        }
      })
      // Sort by potential win (highest first)
      summaries.sort((a, b) => b.potentialWin - a.potentialWin)
      setBookieSummaries(summaries)
    } catch (error) {
      console.error("Error analyzing bets across bookies:", error)
      // Set empty results on error
      setDetailedAnalysis([])
      setBookieSummaries([])
      setBonusAnalysis({})
      setOptimizationSuggestions([])
    }
  }

  const copyBestBet = () => {
    if (bookieSummaries.length > 0) {
      const bestBet = bookieSummaries[0]
      const bonus = bonusAnalysis[bestBet.bookie]
      const bonusText = bonus ? ` (uključujući ${bonus.bonusPercentage}% bonus: ${bonus.bonusAmount.toFixed(2)} rsd)` : ""
      const betText = `Najbolja kvota: ${bestBet.bookie} - Ukupna kvota: ${bestBet.totalOdds.toFixed(2)} - Potencijaln dobitak: ${bestBet.potentialWin.toFixed(2)} rsd${bonusText}`
      navigator.clipboard.writeText(betText)
    }
  }

  function formatNumberEuropean(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  const getCompletionRate = (available: number, total: number) => {
    return (available / total) * 100
  }

  return (
    <TooltipProvider>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col p-0" aria-describedby={undefined}>
        <DialogHeader className="p-4 pb-2 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-kvotizza-blue-500" />
            Analize kvota kroz sve dostupne kladionice
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analiza tipova</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-foreground">Broj tipova</p>
                  <p className="text-lg md:text-2xl font-bold">{selections.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-foreground">Broj kladionica</p>
                  <p className="text-lg md:text-2xl font-bold">{bookieSummaries.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-foreground">Ulog</p>
                  <p className="text-lg md:text-2xl font-bold">{stake} rsd</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-foreground">Najveci dobitak</p>
                  <p className="text-lg md:text-2xl font-bold text-kvotizza-green-600 dark:text-kvotizza-green-400">
                    {bookieSummaries.length > 0 ? `${formatNumberEuropean(bookieSummaries[0].potentialWin)} rsd` : "0.00 rsd"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Selected Bet Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-kvotizza-blue-500" />
                Izabrani tipovi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {selections.map((selection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="text-xs md:text-sm font-bold">{selection.matchup}</span>
                      <p className="text-xs md:text-sm text-muted-foreground">{selection.league}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {selection.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {selection.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-muted-foreground">
                        {detailedAnalysis[index]?.bestOdds.toFixed(2) || "N/A"}
                      </p>
                      <p className="text-xs text-kvotizza-green-700 dark:text-kvotizza-green-300 font-bold">@ {detailedAnalysis[index]?.bestBookie || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bookmaker Summary Comparison */}
          <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Zbirne kvote</CardTitle>

              </div>
            </CardHeader>


            <CardContent className="p-2 sm:p-6">
            {/* Mobile View */}
              <div className="block sm:hidden space-y-3">
                {bookieSummaries.map((summary, index) => {
                const bonus = bonusAnalysis[summary.bookie]
                const baseWin = stake * summary.totalOdds
                const bonusAmount = bonus?.bonusAmount || 0
                  return (
                  <div
                    key={summary.bookie}
                    className={`p-3 rounded-lg border ${
                      index === 0 && summary.allAvailable
                        ? "bg-kvotizza-green-50 dark:bg-kvotizza-green-950/20 border-kvotizza-green-200"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {index === 0 && summary.allAvailable && <Trophy className="h-4 w-4 text-kvotizza-yellow-500" />}
                        <span className="font-bold text-sm">#{index + 1}</span>
                        <span className="font-semibold text-sm">{summary.bookie}</span>
                      </div>
                      <div className="text-right">
                        {summary.allAvailable ? (
                          <Badge className="text-xs bg-kvotizza-green-600 hover:bg-kvotizza-green-700">Kompletno</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Nedostaju {summary.missingSelections.length}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${summary.allAvailable ? "bg-kvotizza-green-500" : "bg-kvotizza-blue-500"}`}
                            style={{
                              width: `${getCompletionRate(summary.availableSelections, selections.length)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {summary.availableSelections}/{selections.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Ukupna kvota</p>
                        <p className="font-bold text-sm">
                          {summary.allAvailable ? summary.totalOdds.toFixed(2) : "Incomplete"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Potencijalni dobitak</p>
                        <p
                          className={`font-bold text-sm ${
                            index === 0 && summary.allAvailable
                              ? "text-kvotizza-green-600 dark:text-kvotizza-green-400"
                              : ""
                          }`}
                        >
                          {`${formatNumberEuropean(summary.potentialWin)} rsd`}
                        </p>
                        <p className="text-xs text-muted-foreground">Bonus: {formatNumberEuropean(bonusAmount)} rsd</p>
                      </div>
                    </div>
                  </div>
                    )})}

              </div>


              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">

                <Table>
                  <TableHeader>
                    <TableRow>
                    <TableHead className="min-w-[60px]">Rank</TableHead>
                      <TableHead className="min-w-[120px]">Kladionica</TableHead>
                      <TableHead className="min-w-[100px]">Kompletnost</TableHead>
                      <TableHead className="min-w-[100px]">Ukupna kvota</TableHead>
                      <TableHead className="min-w-[120px]">Dobitak</TableHead>
                      <TableHead className="min-w-[120px]">Bonus</TableHead>
                      <TableHead className="min-w-[120px]">Ukupni dobitak</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookieSummaries.map((summary, index) => {
                      const bonus = bonusAnalysis[summary.bookie]
                      const baseWin = stake * summary.totalOdds
                      const bonusAmount = bonus?.bonusAmount || 0

                      return (
                        <TableRow
                          key={summary.bookie}
                          className={
                            index === 0 && summary.allAvailable
                              ? "bg-kvotizza-green-50 dark:bg-kvotizza-green-950/20"
                              : ""
                          }
                        >
                          <TableCell className="min-w-[60px]">
                            <div className="flex items-center gap-2 px-4">
                              <span className="font-bold">#{index + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium min-w-[120px] px-4">
  <div className="flex items-center gap-2">
    <a
      href={outUrl(summary.bookie, {
        source: "summary",
        stake,
        total_odds: Number(summary.totalOdds.toFixed(2)),
        potential_win: Number(summary.potentialWin.toFixed(2)),
        available: summary.availableSelections,
        total: selections.length,
        all_available: summary.allAvailable,
      })}
      className="hover:underline underline-offset-2"
      
    >
      {summary.bookie}
    </a>

    {bonus?.conditionDescription && (
      <Tooltip>
        <TooltipTrigger><AlertTriangle className="h-3 w-3 text-amber-500" /></TooltipTrigger>
        <TooltipContent><p className="max-w-xs">{bonus.conditionDescription}</p></TooltipContent>
      </Tooltip>
    )}
  </div>
</TableCell>
                          <TableCell className="min-w-[100px] px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${summary.allAvailable ? "bg-kvotizza-green-500" : "bg-kvotizza-blue-500"}`}
                                  style={{
                                    width: `${getCompletionRate(summary.availableSelections, selections.length)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm">
                                {summary.availableSelections}/{selections.length}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[100px] px-4">
                            {summary.totalOdds.toFixed(2)}
                          </TableCell>
                          <TableCell className="min-w-[100px] px-4">
                            {`${baseWin.toFixed(2)} rsd`}
                          </TableCell>
                          <TableCell className="min-w-[100px] px-4">
                            {bonusAmount > 0 ? (
                              <span className="text-kvotizza-green-600 dark:text-kvotizza-green-400 font-medium">
                                +{formatNumberEuropean(bonusAmount)} rsd
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0.00</span>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[100px] px-4">
                            <span
                              className={`font-bold ${index === 0 && summary.allAvailable ? "text-kvotizza-green-600 dark:text-kvotizza-green-400" : ""}`}
                            >
                              { `${formatNumberEuropean(summary.potentialWin)} rsd`}
                            </span>
                          </TableCell>
                          <TableCell className="min-w-[100px] px-4">
                          {summary.allAvailable ? (
                          <Badge className="text-xs bg-kvotizza-green-600 hover:bg-kvotizza-green-700">Kompletno</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Nekompletno
                          </Badge>
                        )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>

          {/* Detailed Odds Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detaljan pregled kvota po meču</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailedAnalysis.map((analysis, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{analysis.selection.matchup}</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysis.selection.category} - {analysis.selection.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-kvotizza-green-600 dark:text-kvotizza-green-400">
                        Najbolja: {analysis.bestOdds.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">@ {analysis.bestBookie}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {analysis.bookieOdds.map((bookieOdd) => (
                      <div
                        key={bookieOdd.bookie}
                        className={`p-2 rounded text-center text-sm ${
                          bookieOdd.available
                            ? bookieOdd.odds === analysis.bestOdds
                              ? "bg-kvotizza-green-100 dark:bg-kvotizza-green-900/30 text-kvotizza-green-700 dark:text-kvotizza-green-300 font-bold"
                              : "bg-kvotizza-blue-50 dark:bg-kvotizza-blue-900/20 text-kvotizza-blue-700 dark:text-kvotizza-blue-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        }`}
                                                >
                                                                      <a
                            href={outUrl(bookieOdd.bookie, {
                              source: "analysis-grid",
                              event_id: analysis.selection.matchId,
                              market: analysis.selection.category,
                              selection: analysis.selection.type,
                              odds: bookieOdd.available ? Number(bookieOdd.odds?.toFixed(2)) : undefined,
                            })}
                            className="block"
                            aria-label={`Otvori ${bookieOdd.bookie}`}
                          >
                            <p className="font-medium truncate text-xs">{bookieOdd.bookie}</p>
                            <p className="font-bold">{bookieOdd.available ? bookieOdd.odds?.toFixed(2) : "N/A"}</p>
                          </a>
                      </div>
                    ))}
                  </div>

                  {index < detailedAnalysis.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  )
}
