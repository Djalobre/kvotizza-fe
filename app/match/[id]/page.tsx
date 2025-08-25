"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Loader2, ArrowLeft, AlertCircle, Star, X, Plus } from "lucide-react"
import { CountryFlag } from "@/components/country-flag"
import { BetSidebar } from "@/components/bet-sidebar"
import { BetAnalysisModal } from "@/components/bet-analysis-modal"
import { apiService } from "@/lib/api-service"
import { sportsConfigService } from "@/lib/sports-config"
import { formatMatchLabel } from "@/bookies-table"
import type { DetailedMatch, Bookie, BetSelection, BetTypeSelection } from "@/types/bookies"
import {addBetToBuilder} from "../../../bookies-table"
// Helper function to get odds for a specific bookie, category, and type
const getOddsValue = (bookie: Bookie, category: string, type: string): number | null => {
  const cat = bookie.categories.find((c) => c.category === category)
  if (!cat) return null
  const odd = cat.odds.find((o) => o.type === type)
  return odd ? odd.value : null
}

  const navigateToKvote = () => {
    // For Next.js App Router
    if (typeof window !== 'undefined') {
      window.location.href = `/kvote`
    }
  }
const getTrendsValue = (bookie: Bookie, category: string, type: string): string | null => {
  const cat = bookie.categories.find((c) => c.category === category)
  if (!cat) return null
  const odd = cat.odds.find((o) => o.type === type)
  return odd ? odd.trend : null
}

const CATEGORY_PRIORITY = ["Konačan ishod", "Ukupno golova", "Oba tima daju gol","Prvo poluvreme","Drugo poluvreme"];
const catPriority = (cat: string) => {
  const i = CATEGORY_PRIORITY.indexOf(cat);
  return i === -1 ? CATEGORY_PRIORITY.length : i; // non-priority after the first three
};
// Helper function to get all unique categories from match data
const getAllCategories = (match: DetailedMatch): string[] => {
  const set = new Set<string>();
  match.bookies.forEach((bookie: Bookie) => {
    bookie.categories.forEach((category) => set.add(category.category));
  });

  // Priority first, then alphabetical (Serbian collation)
  return Array.from(set).sort((a, b) => {
    const pa = catPriority(a);
    const pb = catPriority(b);
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b, "sr");
  });
};

// Helper function to get all bet types for a specific category
const getBetTypesForCategory = (match: DetailedMatch, categoryName: string): string[] => {
  const types = new Set<string>()
  match.bookies.forEach((bookie: Bookie) => {
    const category = bookie.categories.find((c) => c.category === categoryName)
    if (category) {
      category.odds.forEach((odd) => {
        types.add(odd.type)
      })
    }
  })
  return Array.from(types).sort()
}


// Helper function to get best odds for a bet type across all bookies
const getBestOdds = (match: DetailedMatch, category: string, type: string): { odds: number; bookie: string } | null => {
  let bestOdds = 0
  let bestBookie = ""

  match.bookies.forEach((bookie: Bookie) => {
    const odds = getOddsValue(bookie, category, type)
    if (odds !== null && odds > bestOdds) {
      bestOdds = odds
      bestBookie = bookie.name
    }
  })

  return bestOdds > 0 ? { odds: bestOdds, bookie: bestBookie } : null
}

export default function MatchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = Number(params.id)
  const sport = searchParams.get("sport") || sportsConfigService.getDefaultSport()
  const dateSpan = searchParams.get("dateSpan") || sportsConfigService.getDefaultDateSpan()

  const [match, setMatch] = useState<DetailedMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [betSelections, setBetSelections] = useState<BetSelection[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Kompletna ponuda")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false)
  const [analysisSelections, setAnalysisSelections] = useState<BetTypeSelection[]>([])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getMatchDetails(matchId, sport)
        setMatch(data)
      } catch (err) {
        console.error("Error fetching match:", err)
        setError(err instanceof Error ? err.message : "Failed to load match")
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      fetchMatch()
    }
  }, [matchId, sport])

  const handleAnalyzeBet = (selections: BetTypeSelection[]) => {
    setAnalysisSelections(selections)
    setAnalysisModalOpen(true)
  }


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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to Load Match</h2>
          <p className="text-muted-foreground">{error || "Match not found"}</p>
          <Button onClick={navigateToKvote()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const categories = getAllCategories(match)
  const filteredCategories =
    selectedCategory === "Kompletna ponuda" ? categories : categories.filter((cat) => cat === selectedCategory)
  return (
    <div className="min-h-screen bg-background">
      <div
        className={`transition-all duration-300 ${
          betSelections.length > 0 && !isMobile ? "mr-80" : "mr-0"
        } px-[5px] sm:px-4 md:px-8 relative dark:bg-kvotizza-dark-bg-10`}
      >
        {/* Header - gray gradient matching screenshot */}
        <div className="sticky top-0 z-30 dark:bg-kvotizza-dark-bg-10 bg-kvotizza-green-10 text-white shadow-lg -mx-3 sm:-mx-4 md:-mx-8">


          {/* Match Title */}
          <div className="px-4 pb-4 pt-4">
            
            <div className="grid grid-cols-3 gap-1">
          
          
          <div className="grid grid-cols-3 gap-4 col-span-3 md:col-span-1">
              
            <Button
                variant="ghost"
                size="sm"
                className="col-span-1 text-green-100 hover:text-white hover:bg-white/20 border border-white/30 whitespace-normal md:whitespace-nowrap"
                onClick={navigateToKvote()}
              >
                <ArrowLeft className="h-4 w-4" />
                {formatMatchLabel(match.start_time)}
              </Button>
              <span className="col-span-1 text-sm dark:bg-transparent dark:border dark:border-white/30 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium flex items-center justify-center h-10 w-full">
                {/* <CountryFlag countryCode={match.country} className="w-3 h-3 mr-1" /> */}
                {match.league}
              </span>

              <h1 className="col-span-3 text-xl font-bold">{match.matchup}</h1>
            </div>
              
              <Image
                  src="/images/kvotizza-logo-white.png"
                  alt="Kvotizza Logo"
                  width={200}
                  height={200}
                  className="h-20 w-auto items-center justify-center mx-auto hidden md:block"
                />
            </div>
          </div>
        </div>

        {/* Category Tabs - Horizontal scrollable */}
        <div className="sticky top-[112px] z-20 dark:bg-kvotizza-dark-bg-20 bg-background border-b shadow-sm -mx-3 sm:-mx-4 md:-mx-8">
          <ScrollArea className="w-full">
            <div className="flex gap-0 p-0 min-w-max">
              {/* Kompletna ponuda - Always first */}
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory("Kompletna ponuda")}
                className={`
                  flex-shrink-0 rounded-none px-6 py-3 text-sm font-medium transition-all border-b-2
                  ${
                    selectedCategory === "Kompletna ponuda"
                      ? "dark:bg-kvotizza-dark-bg-20 bg-gray-50 dark:text-white border-kvotizza-green-500"
                      : "dark:bg-kvotizza-dark-bg-20 bg-background text-foreground hover:bg-muted border-transparent"
                  }
                `}
              >
                Kompletna ponuda
              </Button>

              {/* Other categories */}
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    flex-shrink-0 rounded-none px-6 py-3 text-sm font-medium transition-all border-b-2
                    ${
                      selectedCategory === category
                        ? "dark:bg-kvotizza-dark-bg-20 bg-gray-50 dark:text-white border-kvotizza-green-500"
                        : "dark:bg-kvotizza-dark-bg-20 bg-background text-foreground hover:bg-muted border-transparent"
                    }
                  `}
                >
                  {category}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
          </ScrollArea>
        </div>

        {/* Content - Grid Layout similar to expanded view */}
        <div className="w-full max-w-7xl mx-auto space-y-4 py-4 dark:bg-kvotizza-dark-bg-10">
          {filteredCategories.map((categoryName) => {
            const betTypes = getBetTypesForCategory(match, categoryName)

            return (
              <div key={categoryName} className="space-y-3 text-black/70 dark:bg-kvotizza-dark-bg-10">
                {/* Category Header - Only show if not filtering by single category */}
                {selectedCategory === "Kompletna ponuda" && (
                  <div className="dark:bg-kvotizza-dark-bg-20 flex items-center justify-center py-2 bg-kvotizza-green-500/10 rounded-lg border dark:border-white/30" >
                    <h5 className="text-sm font-bold text-kvotizza-dark-theme-green-20 text-center dark:text-white">
                      {categoryName.toUpperCase()}
                    </h5>
                  </div>
                )}

                {/* Bet Types for this Category */}
                {betTypes.map((betType) => (
                  <div key={`${categoryName}-${betType}`} className="bg-white dark:bg-kvotizza-dark-bg-20 border dark:border-white/30 rounded-lg p-2 space-y-2">
                    {/* Bet Type Header with Plus Button */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-kvotizza-green-600">{betType}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 bg-kvotizza-green-50 hover:bg-kvotizza-green-100 border-kvotizza-green-200 dark:bg-kvotizza-dark-bg-20"
                        onClick={() => {
                          const bestOdds = getBestOdds(match, categoryName, betType)
                          if (bestOdds) {
                            addBetToBuilder(
                              match.id,
                              match.matchup,
                              match.league,
                              categoryName,
                              betType,
                            )
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 text-kvotizza-green-600" />
                      </Button>
                    </div>

                    {/* Desktop: 10-Column Grid */}
                    <div className="hidden md:block">
                      <div className="grid grid-cols-10 gap-1">
                        {match.bookies.map((bookie: Bookie) => {
                          const odds = getOddsValue(bookie, categoryName, betType)
                          const trend = getTrendsValue(bookie, categoryName, betType)
                          return (
                            <div
                              key={bookie.name}
                              className="flex flex-col items-center p-1 bg-white rounded border hover:bg-muted/50 transition-colors dark:bg-muted/30"
                            >
                              {/* Bookie Name */}
                              <span className="text-xs font-medium text-muted-foreground text-center mb-1 truncate w-full">
                                { 
                                bookie.name}
                              </span>

                              {/* Odds Display (Non-clickable) */}
                              {odds ? (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-sm font-bold text-center text-muted-foreground rounded px-2 py-1 dark:text-white">
                                        {odds.toFixed(2)}
                                        </span>
                                  {(trend === "up" || trend === "down") && (
                                    <span
                                      className={`text-xs fold:text-[0.6rem] ${
                                        trend === "up" ? "text-green-500" : "text-red-500"
                                      }`}
                                    >
                                      {trend === "up" ? "↗" : "↘"}
                                    </span>
                                  )}
                                  
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground mb-1">-</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Mobile: 5-Column Grid */}
                    <div className="md:hidden">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-2 fold:gap-1">
                        {match.bookies.slice(0, 10).map((bookie: Bookie) => {
                          const odds = getOddsValue(bookie, categoryName, betType)
                          const trend = getTrendsValue(bookie, categoryName, betType)
                          return (
                            <div
                              key={bookie.name}
                              className="flex flex-col items-center p-1 bg-muted/30 rounded border"
                            >
                              <span className="text-[0.6rem] font-small text-muted-foreground text-center mb-1 truncate w-full">
                                {bookie.name}
                              </span>
                              {odds ? (
                                <>
                                <div className="flex items-center gap-1">
                                <span className="text-xs md:text-sm fold:text-xs font-bold text-center dark:text-white">
                                  {odds.toFixed(2)}
                                  </span>
                            {(trend === "up" || trend === "down") && (
                              <span
                                className={`text-xs fold:text-[0.6rem] ${
                                  trend === "up" ? "text-green-500" : "text-red-500"
                                }`}
                              >
                                {trend === "up" ? "↗" : "↘"}
                              </span>
                            )}
                            </div>
                                </>
                              ) : (
                                <span className="text-[0.6rem] text-muted-foreground">-</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* No data message */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No betting markets available</h3>
            <p className="text-muted-foreground">No betting data is available for this match at the moment.</p>
          </div>
        )}
      </div>

      {/* Bet Sidebar */}
      <BetSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen) } onAnalyzeBet={handleAnalyzeBet} page=''/>

        {/* Bet Analysis Modal */}
        <BetAnalysisModal
          isOpen={analysisModalOpen}
          onClose={() => setAnalysisModalOpen(false)}
          selections={analysisSelections}
          stake={10}
        />
    </div>
  )
}
