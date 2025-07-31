"use client"

import React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { CountryFlag } from "./components/country-flag"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableCellExpanded,TableHeadMini, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  Search,
  Clock,
  TrendingUp,
  ExternalLink,
  Eye,
  Loader2,
  List,
  AlertCircle,
  Calendar,
  Trophy,
  Filter,
} from "lucide-react"
import type { BasicMatch, DetailedMatch, BetTypeSelection, Bookie } from "./types/bookies"
import { ClickableBetType } from "./components/clickable-bet-type"
import { BetSidebar } from "./components/bet-sidebar"
import { BetAnalysisModal } from "./components/bet-analysis-modal"
import { apiService } from "./lib/api-service"
import { sportsConfigService } from "./lib/sports-config"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle" // Import the new ThemeToggle component

type BookiesTableProps = {}

type ViewMode = "league" | "time"

// Helper function to get odds for a specific bookie, category, and type
const getOddsValue = (bookie: Bookie, category: string, type: string): number | null => {
  const cat = bookie.categories.find((c) => c.category === category)
  if (!cat) return null
  const odd = cat.odds.find((o) => o.type === type)
  return odd ? odd.value : null
}

// Helper function to get all unique bet types across all bookies for a match
const getAllBetTypesForMatch = (match: DetailedMatch): { category: string; type: string }[] => {
  const allTypes = new Map<string, { category: string; type: string }>()
  match.bookies.forEach((bookie: Bookie) => {
    bookie.categories.forEach((categoryObj) => {
      categoryObj.odds.forEach((odd) => {
        const key = `${categoryObj.category}|${odd.type}`
        if (!allTypes.has(key)) {
          allTypes.set(key, { category: categoryObj.category, type: odd.type })
        }
      })
    })
  })
  // Sort for consistent order in expanded view
  return Array.from(allTypes.values()).sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category)
    if (categoryCompare !== 0) return categoryCompare
    return a.type.localeCompare(b.type)
  })
}

// Helper to group bet types by category for the detailed table
const getTypesByCategory = (match: DetailedMatch): Record<string, { category: string; type: string }[]> => {
  const categories: Record<string, { category: string; type: string }[]> = {}
  console.log(categories)
  getAllBetTypesForMatch(match).forEach((betType) => {
    if (!categories[betType.category]) {
      categories[betType.category] = []
    }
    categories[betType.category].push(betType)
  })
  return categories
}

// Helper function to find the best odds for a given bet type across all bookies for a match
const getBestOdds = (match: DetailedMatch, category: string, type: string): number => {
  let bestOdds = 0
  match.bookies.forEach((bookie: Bookie) => {
    const odds = getOddsValue(bookie, category, type)
    if (odds !== null && odds > bestOdds) {
      bestOdds = odds
    }
  })
  return bestOdds
}

// 3-slovna srpska skraćenja (Sun..Sat; JS: 0=Sun)
const SR_WEEKDAY3 = ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"]

function getViewerTz(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Belgrade"
}

function ymdInTz(d: Date, timeZone: string): string {
  // YYYY-MM-DD u zadatoj TZ (stabilno preko Intl parts)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d)
  const y = parts.find((p) => p.type === "year")!.value
  const m = parts.find((p) => p.type === "month")!.value
  const day = parts.find((p) => p.type === "day")!.value
  return `${y}-${m}-${day}`
}

function diffDays(ymdA: string, ymdB: string): number {
  // Uporedimo dana po kalendaru — parsiramo kao UTC da izbegnemo offset
  const a = new Date(ymdA).getTime()
  const b = new Date(ymdB).getTime()
  return Math.round((a - b) / 86400000)
}

function formatTimeLocal(d: Date, timeZone: string, locale = "sr-Latn-RS"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d)
}

function weekday3(isoUtc: string, timeZone: string): string {
  const idx = new Date(
    // pretvori u lokalno samo za dobijanje dana u nedelji
    new Date(isoUtc).toLocaleString("en-US", { timeZone }),
  ).getDay() // 0..6
  return SR_WEEKDAY3[idx]
}

/**
 * Glavna funkcija:
 * - isoUtc: string iz backenda (UTC, npr "2025-07-31T15:00:00Z")
 * - options.locale: npr. "sr-Latn-RS" (default)
 * - options.tz: po želji forsiraj IANA TZ; ako izostaviš, koristi se viewer TZ
 */
export function formatMatchLabel(isoUtc: string, options?: { locale?: string; tz?: string }): string {
  const locale = options?.locale ?? "sr-Latn-RS"
  const tz = options?.tz ?? getViewerTz()

  const now = new Date()
  const target = new Date(isoUtc)

  const todayYmd = ymdInTz(now, tz)
  const targetYmd = ymdInTz(target, tz)
  const delta = diffDays(targetYmd, todayYmd) // 0=danas, 1=sutra, 2..6=ostali u 7 dana

  const time = formatTimeLocal(target, tz, locale)

  if (delta === 0) return `Danas ${time}`
  if (delta === 1) return `Sutra ${time}`
  if (delta >= 2 && delta <= 6) return `${weekday3(isoUtc, tz)} ${time}`

  // Van 7 dana: datum + vreme (dd.MM.yyyy HH:mm)
  const dateStr = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(target)
  return `${dateStr} ${time}`
}

export default function Component({}: BookiesTableProps) {
  const [allMatches, setAllMatches] = useState<BasicMatch[]>([]) // Store all matches from API
  const [detailedMatches, setDetailedMatches] = useState<{ [key: number]: DetailedMatch }>({})
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true)
  const [loadingDetails, setLoadingDetails] = useState<{ [key: number]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [leagueFilter, setLeagueFilter] = useState<string>("all")
  const [selectedSport, setSelectedSport] = useState<string>(sportsConfigService.getDefaultSport())
  const [selectedDateSpan, setSelectedDateSpan] = useState<string>(sportsConfigService.getDefaultDateSpan())

  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false)
  const [analysisSelections, setAnalysisSelections] = useState<BetTypeSelection[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("league")

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(15)

  // Get current sport configuration
  const currentSportConfig = sportsConfigService.getSportConfig(selectedSport)
  const quickMarkets = sportsConfigService.getQuickMarkets(selectedSport)
  const availableSports = sportsConfigService.getSportsList()

  const availableDateSpans = sportsConfigService.getDateSpansList()
  const currentDateSpanConfig = sportsConfigService.getDateSpanConfig(selectedDateSpan)
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const update = () => setIsMobileView(window.innerWidth < 640)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  // Fetch all matches data on component mount or sport change
  const fetchAllMatches = async () => {
    try {
      setLoadingMatches(true)
      setError(null)
      // Clear previous data when switching sports or date spans
      setAllMatches([])
      setDetailedMatches({})
      setExpandedRows([])
      setCurrentPage(1)

      const data = await apiService.getMatches(selectedSport, {
        dateSpan: selectedDateSpan, // Always pass the dateSpan, don't check if it's "all"
      })
      // Handle different API response formats
      let matches: BasicMatch[] = []
      if (Array.isArray(data)) {
        // API returns array directly: [{match1}, {match2}, ...]
        matches = data
      } else if (data && typeof data === "object") {
        // API returns object with matches array
        matches =
          (data as { matches?: BasicMatch[]; data?: BasicMatch[]; results?: BasicMatch[] }).matches ||
          (data as { matches?: BasicMatch[]; data?: BasicMatch[]; results?: BasicMatch[] }).data ||
          (data as { matches?: BasicMatch[]; data?: BasicMatch[]; results?: BasicMatch[] }).results ||
          []
      }

      setAllMatches(matches)
    } catch (error) {
      console.error("Error fetching matches:", error)
      setError(error instanceof Error ? error.message : "Failed to load matches")
    } finally {
      setLoadingMatches(false)
    }
  }

  useEffect(() => {
    fetchAllMatches()
  }, [selectedSport, selectedDateSpan])

  // Fetch detailed match data when row is expanded
  const fetchDetailedMatch = async (matchId: number) => {
    if (detailedMatches[matchId] || loadingDetails[matchId]) {
      return // Already loaded or loading
    }

    try {
      setLoadingDetails((prev) => ({ ...prev, [matchId]: true }))
      const data = await apiService.getMatchDetails(matchId, selectedSport)
      setDetailedMatches((prev) => ({ ...prev, [matchId]: data }))
    } catch (error) {
      console.error("Error fetching match details:", error)
      // You might want to show an error state in the expanded row
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [matchId]: false }))
    }
  }

  // Get unique leagues for filter
  const leagues: string[] = Array.from(new Set(allMatches.map((match: BasicMatch) => match.league)))

  // Filter data based on search and filters
  const filteredData: BasicMatch[] = allMatches.filter((match: BasicMatch) => {
    const matchesSearch: boolean = !searchTerm || match.matchup.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLeague: boolean = leagueFilter === "all" || match.league === leagueFilter
    return matchesSearch && matchesLeague
  })

  // Sort data based on view mode
  const sortedData: BasicMatch[] = [...filteredData].sort((a, b) => {
    if (viewMode === "time") {
      // Sort by start time for time-based view
      const timeA = a.start_time ? new Date(a.start_time).getTime() : 0
      const timeB = b.start_time ? new Date(b.start_time).getTime() : 0
      return timeA - timeB
    } else {
      // Sort by league then matchup for league-based view
      const leagueCompare = a.league.localeCompare(b.league)
      if (leagueCompare !== 0) return leagueCompare
      return a.matchup.localeCompare(b.matchup)
    }
  })
  // Calculate pagination
  const totalFilteredMatches = filteredData.length
  const totalPages = Math.ceil(totalFilteredMatches / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to page 1 if current page would be empty after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const toggleRowExpansion = async (matchId: number): Promise<void> => {
    const isCurrentlyExpanded = expandedRows.includes(matchId)

    if (isCurrentlyExpanded) {
      // Collapse the row
      setExpandedRows((prev: number[]) => prev.filter((id: number) => id !== matchId))
    } else {
      // Expand the row and fetch detailed data
      setExpandedRows((prev: number[]) => [...prev, matchId])
      await fetchDetailedMatch(matchId)
    }
  }

  const handleAnalyzeBet = (selections: BetTypeSelection[]) => {
    setAnalysisSelections(selections)
    setAnalysisModalOpen(true)
  }

  // Navigation helper function
  const navigateToMatch = (matchId: number) => {
    // For Next.js App Router
    if (typeof window !== "undefined") {
      window.location.href = `/match/${matchId}?sport=${selectedSport}&dateSpan=${selectedDateSpan}`
    }
  }

  // Retry function for failed API calls
  const retryFetch = () => {
    setError(null)
    fetchAllMatches()
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setExpandedRows([]) // Close expanded rows when changing pages
  }

  const handleItemsPerPageChange = (newLimit: string) => {
    setItemsPerPage(Number(newLimit))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleLeagueFilter = (league: string) => {
    setLeagueFilter(league)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode)
    setCurrentPage(1) // Reset to first page when changing view mode
    setExpandedRows([]) // Close expanded rows when changing view mode
  }
  if (loadingMatches) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading {currentSportConfig?.displayName || selectedSport} matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to Load Matches</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={retryFetch} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // For league-based view
  let lastRenderedLeague: string | null = null

  // For time-based view
  const lastRenderedDate: string | null = null

  return (
    <div className="min-h-screen min-w-[360px] bg-background">
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "mr-96" : "mr-0"} px-[5px] sm:px-4 md:px-8 relative`}
      >
        <div className="w-full sm:max-w-7xl sm:mx-auto space-y-4 shrink-0">
          {/* Compact Header */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="text-center space-y-2 py-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Image
                  src="/images/kvotizza-logo.png"
                  alt="Kvotizza Logo"
                  width={200}
                  height={200}
                  className="h-20 w-auto"
                />
                <h1 className="hidden sm:block text-3xl font-bold tracking-tight text-kvotizza-headline-700">
                  Uporedi kvote — izaberi najbolju ponudu
                </h1>
              </div>
            </div>
          </div>
          {/* Compact Controls Bar */}
          <div className="sticky top-[120px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <Card className="border-0 shadow-sm rounded-none">
              <CardContent className="p-3">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">View:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={viewMode === "league" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleViewModeChange("league")}
                        className={`
                        h-7 px-2 text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1
                        ${
                          viewMode === "league"
                            ? "bg-kvotizza-purple-500 hover:bg-kvotizza-purple-600 text-white"
                            : "bg-transparent text-kvotizza-purple-700 hover:bg-kvotizza-purple-50 border-kvotizza-purple-200"
                        }
                      `}
                      >
                        <List className="h-3 w-3" />
                        League
                      </Button>
                      <Button
                        variant={viewMode === "time" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleViewModeChange("time")}
                        className={`
                        h-7 px-2 text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1
                        ${
                          viewMode === "time"
                            ? "bg-kvotizza-purple-500 hover:bg-kvotizza-purple-600 text-white"
                            : "bg-transparent text-kvotizza-purple-700 hover:bg-kvotizza-purple-50 border-kvotizza-purple-200"
                        }
                      `}
                      >
                        <Clock className="h-3 w-3" />
                        Time
                      </Button>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="hidden lg:block h-8" />

                  {/* Sport Selection - Compact Pills */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sport:</span>
                    <div className="flex gap-1 overflow-x-auto">
                      {availableSports.map((sport) => (
                        <Button
                          key={sport.key}
                          variant={selectedSport === sport.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSport(sport.key)}
                          className={`
                          h-7 px-2 text-xs whitespace-nowrap transition-all duration-200
                          ${
                            selectedSport === sport.key
                              ? "bg-kvotizza-blue-500 hover:bg-kvotizza-blue-600 text-white"
                              : "bg-transparent text-kvotizza-blue-700 hover:bg-kvotizza-blue-50 border-kvotizza-blue-200"
                          }
                        `}
                        >
                          {sport.displayName}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block h-8" />

                  {/* Date Selection - Compact Pills */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Date:</span>

                      {/* Desktop view — horizontal buttons */}
                      <div className="hidden sm:flex gap-1 overflow-x-auto">
                        {availableDateSpans.map((dateSpan) => (
                          <Button
                            key={dateSpan.key}
                            variant={selectedDateSpan === dateSpan.key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDateSpan(dateSpan.key)}
                            className={`
                          h-7 px-2 text-xs whitespace-nowrap transition-all duration-200
                          ${
                            selectedDateSpan === dateSpan.key
                              ? "bg-kvotizza-green-500 hover:bg-kvotizza-green-600 text-white"
                              : "bg-transparent text-kvotizza-green-700 hover:bg-kvotizza-green-50 border-kvotizza-green-200"
                          }
                        `}
                            title={dateSpan.description}
                          >
                            {dateSpan.displayName}
                          </Button>
                        ))}
                      </div>

                      {/* Mobile view — dropdown */}
                      <div className="sm:hidden w-full">
                        <Select value={selectedDateSpan} onValueChange={setSelectedDateSpan}>
                          <SelectTrigger className="h-7 w-full text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDateSpans.map((dateSpan) => (
                              <SelectItem key={dateSpan.key} value={dateSpan.key} className="text-xs">
                                {dateSpan.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block h-8" />

                  {/* Search and Filters - Compact */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Search className="h-3 w-3 text-muted-foreground hidden sm:block" />
                    <Input
                      placeholder="Search matches..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="h-7 text-xs flex-1 min-w-0"
                    />
                    <Select value={leagueFilter} onValueChange={handleLeagueFilter}>
                      <SelectTrigger className="h-7 w-24 text-xs">
                        <Filter className="h-3 w-3 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {leagues.map((league: string) => (
                          <SelectItem key={league} value={league} className="text-xs">
                            {league}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Results count */}
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {filteredData.length} matches
                    </Badge>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Loading indicator */}
                {loadingMatches && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading matches...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || leagueFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : `No ${currentSportConfig?.displayName || selectedSport} matches available`}
              </p>
              {(searchTerm || leagueFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setLeagueFilter("all")
                    setSelectedDateSpan(sportsConfigService.getDefaultDateSpan())
                    setCurrentPage(1)
                  }}
                  className="bg-transparent text-kvotizza-blue-700 hover:bg-kvotizza-blue-50"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
                    <Table>
                      <TableHeader className="sticky top-0 z-20 bg-background border-b shadow-sm">
                        <TableRow className="bg-background">
                          <TableHeadMini className="w-[50px] bg-background"></TableHeadMini>
                          {viewMode === "time" ? (
                            <>
                              <TableHeadMini className="w-[120px] bg-background font-semibold"></TableHeadMini>
                            </>
                          ) : (
                            <TableHeadMini className="font-semibold bg-background"></TableHeadMini>
                          )}
                          {/* Dynamic Quick Market Columns */}
                          {quickMarkets.map((market) => (
                            <TableHeadMini key={market.key} className="font-semibold text-center bg-background text-xs sm:text-sm">
                              {market.displayName}
                            </TableHeadMini>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((match: BasicMatch) => {
                          let showGroupHeader = false
                          let groupHeaderText = ""

                          if (viewMode === "league") {
                            const isNewLeague = match.league !== lastRenderedLeague
                            lastRenderedLeague = match.league
                            showGroupHeader = isNewLeague
                            groupHeaderText = match.league
                          }

                          const colSpan = viewMode === "time" ? 2 + quickMarkets.length : 2 + quickMarkets.length

                          return (
                            <React.Fragment key={match.id}>
                              {showGroupHeader && (
                                <TableRow className="sticky top-[39px] z-10 bg-kvotizza-blue-500 dark:bg-kvotizza-blue-900 border-b shadow-sm bg-background">
                                  <TableCellExpanded colSpan={colSpan} className="font-bold text-lg bg-kvotizza-blue-500 dark:bg-kvotizza-blue-900 text-white" >
                                    <div className="flex items-center gap-2 text-sm">
                                      <Trophy className="h-4 w-4 text-white" />
                                      {groupHeaderText}
                                    </div>
                                  </TableCellExpanded>
                                </TableRow>
                              )}
                              <TableRow
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleRowExpansion(match.id)}
                              >
                                <TableCell>
                                  {loadingDetails[match.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : expandedRows.includes(match.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </TableCell>
                                {viewMode === "time" ? (
                                  <TableCell className="py-2">
                                    <div className="flex items-center gap-3">
                                      <CountryFlag countryCode={match.country} className="text-xs" />
                                      <div className="flex flex-col">
                                        <div className="text-xs font-bold text-kvotizza-green-600">
                                          {formatMatchLabel(match.start_time)}
                                        </div>
                                        <div className="text-xs font-medium leading-tight">{match.matchup}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                ) : (
                                  <TableCell className="py-2">
                                    <div className="flex flex-col">
                                      <div className="text-xs text-kvotizza-green-600 font-medium">
                                        {formatMatchLabel(match.start_time)}
                                      </div>
                                      <div className="font-medium">{match.matchup}</div>
                                    </div>
                                  </TableCell>
                                )}
                                {/* Display best odds from quick markets */}
                                {quickMarkets.map((market) => {
                                  const quickMarket = match.quickMarkets[market.key]
                                  return (
                                    <TableCell key={`${match.id}-${market.key}`} className="text-center">
                                      {quickMarket ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-xs text-muted-foreground">{quickMarket.bestBookie}</span>
                                          <ClickableBetType
                                            matchId={match.id}
                                            matchup={match.matchup}
                                            league={match.league}
                                            category={market.category}
                                            type={market.type}
                                            displayOdds={quickMarket.bestOdds}
                                            isBest={true}
                                          />
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                  )
                                })}
                              </TableRow>
                              {expandedRows.includes(match.id) && (
                                <TableRow key={`${match.id}-expanded`}>
                                  <TableCell colSpan={colSpan} className="bg-muted/30">
                                    <div className="p-4 space-y-4">
                                      {loadingDetails[match.id] ? (
                                        <div className="text-center py-8">
                                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                          <p className="text-muted-foreground">Loading detailed odds from API...</p>
                                        </div>
                                      ) : detailedMatches[match.id] ? (
                                        <>
                                          <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-semibold flex items-center gap-2 text-kvotizza-blue-600">
                                              <TrendingUp className="h-5 w-5" />
                                              Available Bet Types - Click to add to your selections
                                            </h4>
                                            <div className="flex gap-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2 bg-transparent text-kvotizza-blue-700 hover:bg-kvotizza-blue-50"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  window.open(
                                                    `/match/${match.id}?sport=${selectedSport}&dateSpan=${selectedDateSpan}`,
                                                    "_blank",
                                                  )
                                                }}
                                              >
                                                <Eye className="h-4 w-4" />
                                                View Full Details
                                              </Button>
                                              <Button
                                                size="sm"
                                                className="flex items-center gap-2 bg-kvotizza-blue-500 hover:bg-kvotizza-blue-600 text-white"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  navigateToMatch(match.id)
                                                }}
                                              >
                                                <ExternalLink className="h-4 w-4" />
                                                Open Match Page
                                              </Button>
                                            </div>
                                          </div>

                                          {/* Detailed Odds Table */}
                                          <Card className="border-0 shadow-sm">
                                            <CardContent className="p-0">
                                              <div className="overflow-x-auto max-h-[500px]">
                                                <Table>
                                                  <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                      <TableHead className="font-semibold sticky left-0 bg-muted/50 w-[120px] min-w-[120px] text-center">
                                                        Category
                                                      </TableHead>
                                                      <TableHead className="font-semibold sticky left-[120px] bg-muted/50 w-[120px] min-w-[120px] text-center">
                                                        Type
                                                      </TableHead>
                                                      {detailedMatches[match.id].bookies.map((bookie: Bookie) => (
                                                        <TableHead
                                                          key={bookie.name}
                                                          className="font-semibold text-center min-w-[100px]"
                                                        >
                                                          {bookie.name}
                                                        </TableHead>
                                                      ))}
                                                    </TableRow>
                                                  </TableHeader>
                                                  <TableBody>
                                                    {Object.entries(getTypesByCategory(detailedMatches[match.id])).map(
                                                      ([category, types]) =>
                                                        types.map((betType, index) => {
                                                          const bestOddsForType: number = getBestOdds(
                                                            detailedMatches[match.id],
                                                            betType.category,
                                                            betType.type,
                                                          )
                                                          const categoryColors: Record<string, string> = {
                                                            Goals: "bg-kvotizza-blue-50 dark:bg-kvotizza-blue-950/20",
                                                            Result: "bg-kvotizza-green-50 dark:bg-kvotizza-green-950/20",
                                                            Points:
                                                              "bg-kvotizza-purple-50 dark:bg-kvotizza-purple-950/20",
                                                            Sets: "bg-kvotizza-yellow-50 dark:bg-kvotizza-yellow-950/20",
                                                            Handicap: "bg-kvotizza-red-50 dark:bg-kvotizza-red-950/20",
                                                          }

                                                          return (
                                                            <TableRow key={`${category}-${betType.type}`}>
                                                              {index === 0 && (
                                                                <TableCell
                                                                  rowSpan={types.length}
                                                                  className={`font-medium border-r ${categoryColors[category] || "bg-gray-50 dark:bg-gray-950/20"}`}
                                                                >
                                                                  {category}
                                                                </TableCell>
                                                              )}
                                                              <TableCell className="text-muted-foreground bg-background border-r">
                                                                <div className="flex flex-col items-center">
                                                                <ClickableBetType
                                                                  matchId={match.id}
                                                                  matchup={match.matchup}
                                                                  league={match.league}
                                                                  category={betType.category}
                                                                  type={betType.type}
                                                                  className="font-medium bg-transparent hover:bg-muted w-12 h-7 text-xs sm:w-20 sm:h-8 text-xs"
                                                                >
                                                                  {betType.type}
                                                                </ClickableBetType>
                                                                </div>
                                                              </TableCell>
                                                              {detailedMatches[match.id].bookies.map((bookie: Bookie) => {
                                                                const odds: number | null = getOddsValue(
                                                                  bookie,
                                                                  betType.category,
                                                                  betType.type,
                                                                )
                                                                const isBest: boolean =
                                                                  odds === bestOddsForType && odds > 0
                                                                return (
                                                                  <TableCell key={bookie.name} className="text-center">
                                                                    {odds ? (
                                                                      <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-xs text-muted-foreground">
                                                                          {bookie.name}
                                                                        </span>
                                                                        <ClickableBetType
                                                                          matchId={match.id}
                                                                          matchup={match.matchup}
                                                                          league={match.league}
                                                                          category={betType.category}
                                                                          type={betType.type}
                                                                          displayOdds={odds}
                                                                          isBest={isBest}
                                                                        />
                                                                      </div>
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
                                        </>
                                      ) : (
                                        <div className="text-center py-8">
                                          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                                          <p className="text-muted-foreground">Failed to load detailed odds from API</p>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 bg-transparent"
                                            onClick={() => fetchDetailedMatch(match.id)}
                                          >
                                            Retry
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Pagination Controls */}
            {totalFilteredMatches > itemsPerPage && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Show:</span>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">per page</span>
                    </div>

                    {/* Page info */}
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} ({totalFilteredMatches}{" "}
                      {searchTerm || leagueFilter !== "all" ? "filtered" : "total"} matches)
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="bg-transparent"
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-transparent"
                      >
                        Previous
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, currentPage - 2) + i
                          if (pageNum > totalPages) return null

                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className={
                                pageNum === currentPage
                                  ? "bg-kvotizza-blue-500 hover:bg-kvotizza-blue-600 text-white"
                                  : "bg-transparent"
                              }
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="bg-transparent"
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="bg-transparent"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Summary */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {Math.min(startIndex + 1, totalFilteredMatches)} to {Math.min(endIndex, totalFilteredMatches)} of{" "}
              {totalFilteredMatches} {currentSportConfig?.displayName || selectedSport} matches
              {(searchTerm || leagueFilter !== "all") && (
                <span className="ml-2 text-kvotizza-blue-600">(filtered from {allMatches.length} total)</span>
              )}
            </div>
          </div>
        </div>

        {/* Bet Sidebar */}
        <BetSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onAnalyzeBet={handleAnalyzeBet} />

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
