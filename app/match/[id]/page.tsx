"use client"

import React from "react";
import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, TrendingUp, Trophy, Target, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DetailedMatch, Bookie } from "../../../types/bookies"
import { ClickableBetType } from "../../../components/clickable-bet-type"

interface MatchPageProps {
  params: {
    id: string
  }
}

export default function MatchPage({ params }: MatchPageProps) {
  const [match, setMatch] = useState<DetailedMatch | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const matchId = Number.parseInt(params.id)

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/matches/${matchId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Match not found")
          } else {
            throw new Error("Failed to fetch match")
          }
          return
        }
        const data: DetailedMatch = await response.json()
        setMatch(data)
      } catch (error) {
        console.error("Error fetching match:", error)
        setError("Failed to load match details")
      } finally {
        setLoading(false)
      }
    }

    fetchMatch()
  }, [matchId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    )
  }

  if (error || !match) {
    notFound()
  }

  // Helper function to get all unique bet types across all bookies for a match
  const getAllBetTypes = (match: DetailedMatch): string[] => {
    const allTypes = new Set<string>()
    match.bookies.forEach((bookie: Bookie) => {
      bookie.categories.forEach((category) => {
        category.odds.forEach((odd) => {
          allTypes.add(`${category.category}|${odd.type}`)
        })
      })
    })
    return Array.from(allTypes).sort()
  }

  // Helper function to get odds for a specific bookie, category, and type
  const getOddsValue = (bookie: Bookie, category: string, type: string): number | null => {
    const cat = bookie.categories.find((c) => c.category === category)
    if (!cat) return null
    const odd = cat.odds.find((o) => o.type === type)
    return odd ? odd.value : null
  }

  // Helper function to find the best odds for highlighting
  const getBestOdds = (match: DetailedMatch, category: string, type: string): number => {
    let bestOdds = 0
    match.bookies.forEach((bookie: Bookie) => {
      const odds: number | null = getOddsValue(bookie, category, type)
      if (odds && odds > bestOdds) {
        bestOdds = odds
      }
    })
    return bestOdds
  }

  // Group bet types by category
  const getTypesByCategory = (match: DetailedMatch): Record<string, string[]> => {
    const categories: Record<string, string[]> = {}
    getAllBetTypes(match).forEach((betType) => {
      const [category, type] = betType.split("|")
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(type)
    })
    return categories
  }

  const categorizedTypes = getTypesByCategory(match)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent text-kvotizza-blue-700 hover:bg-kvotizza-blue-50"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Matches
          </Button>
        </div>

        {/* Match Info Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3 text-kvotizza-blue-700">
                  <Trophy className="h-8 w-8 text-kvotizza-yellow-500" />
                  {match.matchup}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-sm">
                    {match.league}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {match.bookies.length} Bookmakers
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available Bet Types</p>
                <p className="text-2xl font-bold">{getAllBetTypes(match).length}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tips Section with Clickable Bet Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-kvotizza-blue-600">
              <Target className="h-5 w-5" />
              Recommended Tips - Click to add to bet selections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {match.tips.map((tip, index) => (
                <div key={index} className="text-center p-4 bg-kvotizza-blue-50/50 rounded-lg">
                  <p className="font-semibold text-lg mb-2">{tip.type}</p>
                  <ClickableBetType
                    matchId={match.id}
                    matchup={match.matchup}
                    league={match.league}
                    category="Tips"
                    type={tip.type}
                    displayOdds={tip.odd}
                    className="text-2xl font-bold px-4 py-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complete Odds Comparison Table with Clickable Bet Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-kvotizza-blue-600">
              <TrendingUp className="h-5 w-5" />
              Complete Bet Types Comparison
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              All available bet types across {match.bookies.length} bookmakers. Click any bet type to add to your
              selections. Best odds are highlighted in green.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold sticky left-0 bg-muted/50">Category</TableHead>
                    <TableHead className="font-semibold sticky left-[120px] bg-muted/50">Type</TableHead>
                    {match.bookies.map((bookie: Bookie) => (
                      <TableHead key={bookie.name} className="font-semibold text-center min-w-[100px]">
                        {bookie.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(categorizedTypes).map(([category, types]) =>
                    types.map((type, index) => {
                      const bestOdds: number = getBestOdds(match, category, type)
                      const categoryColors: Record<string, string> = {
                        Goals: "bg-kvotizza-blue-50 dark:bg-kvotizza-blue-950/20",
                        Result: "bg-kvotizza-green-50 dark:bg-kvotizza-green-950/20",
                        Handicap: "bg-kvotizza-yellow-50 dark:bg-kvotizza-yellow-950/20",
                        Totals: "bg-kvotizza-purple-50 dark:bg-kvotizza-purple-950/20",
                      }

                      return (
                        <TableRow key={`${category}-${type}`}>
                          {index === 0 && (
                            <TableCell
                              rowSpan={types.length}
                              className={`font-medium border-r sticky left-0 ${categoryColors[category] || "bg-gray-50 dark:bg-gray-950/20"}`}
                            >
                              {category}
                            </TableCell>
                          )}
                          <TableCell className="text-muted-foreground sticky left-[120px] bg-background border-r">
                            <ClickableBetType
                              matchId={match.id}
                              matchup={match.matchup}
                              league={match.league}
                              category={category}
                              type={type}
                              className="font-medium bg-transparent hover:bg-muted p-1 rounded"
                            >
                              {type}
                            </ClickableBetType>
                          </TableCell>
                          {match.bookies.map((bookie: Bookie) => {
                            const odds: number | null = getOddsValue(bookie, category, type)
                            const isBest: boolean = odds === bestOdds && odds > 0
                            return (
                              <TableCell key={bookie.name} className="text-center">
                                {odds ? (
                                  <ClickableBetType
                                    matchId={match.id}
                                    matchup={match.matchup}
                                    league={match.league}
                                    category={category}
                                    type={type}
                                    displayOdds={odds}
                                    isBest={isBest}
                                  />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    }),
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Bookmakers</p>
              <p className="text-2xl font-bold">{match.bookies.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Bet Types</p>
              <p className="text-2xl font-bold">{getAllBetTypes(match).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{Object.keys(categorizedTypes).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Recommended Tips</p>
              <p className="text-2xl font-bold">{match.tips.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
