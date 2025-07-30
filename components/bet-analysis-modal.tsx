"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Trophy, Copy, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { BetTypeSelection, BookieSummary, BetAnalysisResult, BookieOddsComparison } from "../types/bookies"

interface BetAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  selections: BetTypeSelection[]
  stake: number
}

export function BetAnalysisModal({ isOpen, onClose, selections, stake = 10 }: BetAnalysisModalProps) {
  const [bookieSummaries, setBookieSummaries] = useState<BookieSummary[]>([])
  const [detailedAnalysis, setDetailedAnalysis] = useState<BetAnalysisResult[]>([])

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

        const bookieOdds: BookieOddsComparison[] = []
        let bestOdds = 0
        let bestBookie = ""

        Array.from(allBookies).forEach((bookieName) => {
          const bookie = matchData.bookies?.find((b: any) => b.name === bookieName)
          let odds: number | null = null
          let available = false

          if (bookie) {
            const category = bookie.categories?.find((c: any) => c.category === selection.category)
            if (category) {
              const odd = category.odds?.find((o: any) => o.type === selection.type)
              if (odd) {
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

      Array.from(allBookies).forEach((bookieName) => {
        let totalOdds = 1
        let availableSelections = 0
        const missingSelections: BetTypeSelection[] = []

        selections.forEach((selection) => {
          const matchData = matchDetailsMap.get(selection.matchId)
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
          if (!odd) {
            missingSelections.push(selection)
            return
          }

          totalOdds *= odd.value
          availableSelections++
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

      // Sort by potential win (highest first)
      summaries.sort((a, b) => b.potentialWin - a.potentialWin)
      setBookieSummaries(summaries)
    } catch (error) {
      console.error("Error analyzing bets across bookies:", error)
      // Set empty results on error
      setDetailedAnalysis([])
      setBookieSummaries([])
    }
  }

  const copyBestBet = () => {
    if (bookieSummaries.length > 0) {
      const bestBet = bookieSummaries[0]
      const betText = `Best combination: ${bestBet.bookie} - Total odds: ${bestBet.totalOdds.toFixed(2)} - Potential win: $${bestBet.potentialWin.toFixed(2)}`
      navigator.clipboard.writeText(betText)
    }
  }

  const getCompletionRate = (available: number, total: number) => {
    return (available / total) * 100
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-kvotizza-blue-500" />
            Bet Type Analysis Across All Bookmakers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Bet Types Selected</p>
                  <p className="text-2xl font-bold">{selections.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Bookmakers Analyzed</p>
                  <p className="text-2xl font-bold">{bookieSummaries.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Stake</p>
                  <p className="text-2xl font-bold">${stake}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Best Potential Win</p>
                  <p className="text-2xl font-bold text-kvotizza-green-600 dark:text-kvotizza-green-400">
                    {bookieSummaries.length > 0 ? `$${bookieSummaries[0].potentialWin.toFixed(2)}` : "$0.00"}
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
                Your Selected Bet Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {selections.map((selection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{selection.matchup}</span>
                      <p className="text-sm text-muted-foreground">{selection.league}</p>
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
                      <p className="text-sm text-muted-foreground">
                        Best: {detailedAnalysis[index]?.bestOdds.toFixed(2) || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">@ {detailedAnalysis[index]?.bestBookie || "N/A"}</p>
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
                <CardTitle className="text-lg">Bookmaker Summary (Accumulator)</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyBestBet}
                  className="text-kvotizza-blue-700 hover:bg-kvotizza-blue-50 bg-transparent"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Best Combination
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Bookmaker</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead className="text-right">Total Odds</TableHead>
                    <TableHead className="text-right">Potential Win</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookieSummaries.map((summary, index) => (
                    <TableRow
                      key={summary.bookie}
                      className={
                        index === 0 && summary.allAvailable ? "bg-kvotizza-green-50 dark:bg-kvotizza-green-950/20" : ""
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && summary.allAvailable && (
                            <Trophy className="h-4 w-4 text-kvotizza-yellow-500" />
                          )}
                          <span className="font-bold">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{summary.bookie}</TableCell>
                      <TableCell>
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
                      <TableCell className="text-right font-bold">
                        {summary.allAvailable ? summary.totalOdds.toFixed(2) : "Incomplete"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold ${index === 0 && summary.allAvailable ? "text-kvotizza-green-600 dark:text-kvotizza-green-400" : ""}`}
                        >
                          {summary.allAvailable ? `$${summary.potentialWin.toFixed(2)}` : "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {summary.allAvailable ? (
                          <Badge className="text-xs bg-kvotizza-green-600 hover:bg-kvotizza-green-700">Complete</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs bg-sport-red-500 hover:bg-sport-red-600">
                            Missing {summary.missingSelections.length}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detailed Odds Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Odds Breakdown by Match</CardTitle>
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
                        Best: {analysis.bestOdds.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">@ {analysis.bestBookie}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                        <p className="font-medium truncate">{bookieOdd.bookie}</p>
                        <p className="font-bold">{bookieOdd.available ? bookieOdd.odds?.toFixed(2) : "N/A"}</p>
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
  )
}
