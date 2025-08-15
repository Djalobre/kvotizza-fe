"use client"

import React from "react"
import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { CountryFlag } from "./components/country-flag"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableCellExpanded,TableHeadMini, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  Clock,
  TrendingUp,
  ExternalLink,
  Eye,
  Loader2,
  List,
  Settings,
  Plus,
  X,
  AlertCircle,
  Calendar,
  Trophy,
  Filter,
  Volleyball,
  ChevronLeft,
} from "lucide-react"
import type { BasicMatch, DetailedMatch, BetTypeSelection, Bookie } from "./types/bookies"
import { ClickableBetType } from "./components/clickable-bet-type"
import { BetSidebar } from "./components/bet-sidebar"
import { BetAnalysisModal } from "./components/bet-analysis-modal"
import { apiService } from "./lib/api-service"
import { sportsConfigService } from "./lib/sports-config"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle" // Import the new ThemeToggle component
import { logEvent } from "./lib/tracking"

type BookiesTableProps = {}

type ViewMode = "league" | "time"

// Helper function to get odds for a specific bookie, category, and type
const getOddsValue = (bookie: Bookie, category: string, type: string): number | null => {
  const cat = bookie.categories.find((c) => c.category === category)
  if (!cat) return null
  const odd = cat.odds.find((o) => o.type === type)
  return odd ? odd.value : null
}

const getOddsTrend = (bookie: Bookie, category: string, type: string): string | null => {
  const cat = bookie.categories.find((c) => c.category === category)
  if (!cat) return null
  const odd = cat.odds.find((o) => o.type === type)
  return odd ? odd.trend : null
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
  getAllBetTypesForMatch(match).forEach((betType) => {
    if (!categories[betType.category]) {
      categories[betType.category] = []
    }
    categories[betType.category].push(betType)
  })
  return categories
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
export function addBetToBuilder(
       matchId: number,  matchup: string, league: string  ,category: string,type: string,displayOdds?: number,isBest?: boolean) {
  const betTypeSelection: BetTypeSelection = {
    matchId,
    matchup,
    league,
    category,
    type,
  }
// Retrieve existing selections from localStorage
const existingSelections: BetTypeSelection[] = JSON.parse(localStorage.getItem("betTypeSelections") || "[]")

// Filter out any existing bet for the same matchId
const updatedSelections = existingSelections.filter((selection) => selection.matchId !== matchId)

// Add the new betTypeSelection for the matchup
updatedSelections.push(betTypeSelection)

// Update localStorage with the new selections
localStorage.setItem("betTypeSelections", JSON.stringify(updatedSelections))

// Dispatch custom event to notify sidebar
window.dispatchEvent(new CustomEvent("betTypeSelectionsUpdated"))
}
export default function Component({}: BookiesTableProps) {
  const [allMatches, setAllMatches] = useState<BasicMatch[]>([]) // Store all matches from API
  const [categories, setCategories] = useState<string[]>([])
  const [detailedMatches, setDetailedMatches] = useState<{ [key: number]: DetailedMatch }>({})
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true)
  const [loadingDetails, setLoadingDetails] = useState<{ [key: number]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [leagueFilter, setLeagueFilter] = useState<string>("all")
  const [selectedSport, setSelectedSport] = useState<string>(sportsConfigService.getDefaultSport())
  const [selectedCategory, setSelectedCategory] = useState<string>(sportsConfigService.getDefaultCategory())

  const [selectedDateSpan, setSelectedDateSpan] = useState<string>(sportsConfigService.getDefaultDateSpan())
  const [analysisStake, setAnalysisStake] = useState<number>(10)

  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false)
  const [analysisSelections, setAnalysisSelections] = useState<BetTypeSelection[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("time")

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(15)


   // Mobile controls expansion state
   const [controlsExpanded, setControlsExpanded] = useState<boolean>(false)
   const [searchExpanded, setSearchExpanded] = useState<boolean>(false)

  // Get current sport configuration
  const currentSportConfig = sportsConfigService.getSportConfig(selectedSport)
  const quickMarkets = sportsConfigService.getFEQuickMarkets(selectedSport,selectedCategory)
  const availableSports = sportsConfigService.getSportsList()

  const availableDateSpans = sportsConfigService.getDateSpansList()
  const currentDateSpanConfig = sportsConfigService.getDateSpanConfig(selectedDateSpan)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isVeryNarrow, setIsVeryNarrow] = useState(false)

  useEffect(() => {
    const update = () => {
      setIsMobileView(window.innerWidth < 640)
      setIsVeryNarrow(window.innerWidth <= 360)
    }
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


  const fetchAllCategories = async() => {
    const data = await apiService.getCategories(selectedSport)
    setCategories(data)
  }

  useEffect(() =>{
    fetchAllCategories()
  }, [selectedSport])

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
  const leagues: string[] = Array.from(new Set(allMatches.map((match: BasicMatch) => match.league))).sort()

  // Filter data based on search and filters
  const filteredData: BasicMatch[] = allMatches.filter((match: BasicMatch) => {
    const matchesSearch: boolean = !searchTerm || match.matchup.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLeague: boolean = leagueFilter === "all" || match.league === leagueFilter
    const notStarted: boolean = !match.start_time || new Date(match.start_time) > new Date()
    return matchesSearch && matchesLeague && notStarted
  })

  // Sort data based on view mode
  const sortedData: BasicMatch[] = [...filteredData].sort((a, b) => {
      const timeA = a.start_time ? new Date(a.start_time).getTime() : 0
      const timeB = b.start_time ? new Date(b.start_time).getTime() : 0
      return timeA - timeB
  })
  let paginatedData: BasicMatch[] = []
  if (viewMode === "league") {
    // Group matches by league
    const leagueGroups: { [key: string]: BasicMatch[] } = {}
    sortedData.forEach((match) => {
      if (!leagueGroups[match.league]) {
        leagueGroups[match.league] = []
      }
      leagueGroups[match.league].push(match)
    })

    // Convert to flat array maintaining league grouping
    const groupedMatches: BasicMatch[] = []
    Object.keys(leagueGroups)
      .sort()
      .forEach((league) => {
        groupedMatches.push(...leagueGroups[league])
      })

    // Apply pagination to grouped data
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    paginatedData = groupedMatches.slice(startIndex, endIndex)
  } else {
    // For time view, use regular pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    paginatedData = sortedData.slice(startIndex, endIndex)
  }
  // Calculate pagination
  const totalFilteredMatches = filteredData.length
  const totalPages = Math.ceil(totalFilteredMatches / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const slicedPaginatedData = filteredData.slice(startIndex, endIndex)

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

  const handleAnalyzeBet = (selections: BetTypeSelection[], stake: number) => {
    setAnalysisSelections(selections)
    setAnalysisStake(stake)

    setAnalysisModalOpen(true)
  }

  // Navigation helper function
  const navigateToMatch = (matchId: number) => {
    // For Next.js App Router
    if (typeof window !== "undefined") {
      window.location.href = `/match/${matchId}`
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
    logEvent("filter_change", {source: "bookies-table", extra: { league: league || null } })
    setLeagueFilter(league)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode)
    setCurrentPage(1) // Reset to first page when changing view mode
    setExpandedRows([]) // Close expanded rows when changing view mode
  }


  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm("")
    setLeagueFilter("all")
    setSelectedDateSpan(sportsConfigService.getDefaultDateSpan())
    setCurrentPage(1)
  }
    // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || leagueFilter !== "all"

  if (loadingMatches) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Učitava mečeve...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Bezuspešno učitavanje mečeva</h2>
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
    <div className="min-h-screen min-w-[360px] bg-background dark:bg-kvotizza-dark-bg-10">
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "mr-96" : "mr-0"} px-[5px] sm:px-4 md:px-8 relative`}
      >
        <div className="w-full sm:max-w-7xl sm:mx-auto space-y-4 shrink-0">
          {/* Compact Header */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b dark:bg-kvotizza-dark-bg-10">
            <div className="text-center space-y-2 py-4 h-15">
              <div className="flex items-center justify-center gap-3 mb-2">
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
                <h1 className="hidden sm:block text-3xl font-bold tracking-tight text-kvotizza-headline-700 dark:text-white">
                  Uporedi kvote <span className="block text-kvotizza-green-500">Pronađi najbolju ponudu</span>
                </h1>
              </div>
            </div>
          </div>
          {/* Compact Controls Bar */}
          {/* Mobile Controls System */}
          <div className="sticky top-[60px] fold:top-[50px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60  rounded-lg ">
            <Card className="border-0 shadow-sm rounded-lg  ">
              <CardContent className="p-2 fold:p-1 rounded-lg  dark:bg-kvotizza-dark-bg-20 ">
                {/* Desktop Controls - Always visible on larger screens */}
                <div className="hidden lg:flex flex-col gap-3">
                  {/* First Row: View, Sport, and Date Controls */}
                  <div className="flex items-center gap-4 min-w-0 divide-x divide-border">
                    {/* View Mode */}
                    <div className="flex items-center gap-2 min-w-0 pr-4">
                      {/* <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">View:</span> */}
                      <div className="pl-4 flex gap-1">
                      <Button
                          variant={viewMode === "time" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleViewModeChange("time")}
                          className={`
                          h-7 px-2 text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1
                          ${
                            viewMode === "time"
                              ? "dark:bg-kvotizza-dark-theme-purple-20 bg-kvotizza-purple-500 hover:bg-kvotizza-purple-600 text-white"
                              : "bg-transparent dark:text-kvotizza-dark-theme-purple-10  text-kvotizza-purple-700 hover:bg-kvotizza-purple-50 dark:hover:bg-kvotizza-purple-700 dark:border-kvotizza-dark-theme-purple-10 border-kvotizza-purple-200"
                          }
                        `}
                        >
                          <Clock className="h-3 w-3" />
                          Vreme
                        </Button>
                        <Button
                          variant={viewMode === "league" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleViewModeChange("league")}
                          className={`
                          h-7 px-2 text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1 
                          ${
                            viewMode === "league"
                              ? "dark:bg-kvotizza-dark-theme-purple-20 bg-kvotizza-purple-500 hover:bg-kvotizza-purple-600 text-white"
                              : "bg-transparent dark:text-kvotizza-dark-theme-purple-10 dark:hover:bg-kvotizza-purple-700 text-kvotizza-purple-700 hover:bg-kvotizza-purple-50 dark:border-kvotizza-dark-theme-purple-10 border-kvotizza-purple-200"
                          }
                        `}
                        >
                          <List className="h-3 w-3" />
                          Takmičenja  
                        </Button>

                      </div>
                    </div>

                    {/* Sport Selection */}
                    <div className="flex items-center gap-2 min-w-0 px-4">
                    <Volleyball className="h-4 w-4 text-muted-foreground hidden md:block" />
                      {/* <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sport:</span> */}
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

                    {/* Date Selection */}
                    <div className="flex items-center gap-2 min-w-0 pl-4">
                      <Calendar className="h-4 w-4 text-muted-foreground hidden md:block" />
                      {/* <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Date:</span> */}
                      <div className="flex gap-1 overflow-x-auto">
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
                                : "bg-transparent text-kvotizza-green-700 dark:text-kvotizza-dark-theme-green-10 hover:bg-kvotizza-green-50 border-kvotizza-green-200 dark:border-kvotizza-dark-theme-green-10 dark:hover:bg-kvotizza-green-700"
                            }
                          `}
                            title={dateSpan.description}
                          >
                            {dateSpan.displayName}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Search and Filters */}
                  <div className="flex pl-4 items-center gap-2 flex-1 min-w-0 dark:text-white">
                    {/* <Search className="h-3 w-3 text-muted-foreground" /> */}
                    <Input
                      placeholder="Pretraga mečeva..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="h-7 dark:placeholder:text-white text-xs flex-1 min-w-0 dark:bg-kvotizza-dark-bg-20"
                    />
                    <Select value={leagueFilter} onValueChange={handleLeagueFilter}>
                      <SelectTrigger className="h-7 w-24 text-xs dark:bg-kvotizza-dark-bg-20">
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

                    <ThemeToggle/>
                  </div>
                </div>

                {/* Mobile Controls - Expandable System */}
                <div className="lg:hidden">
                  {/* Primary Controls Row - Always Visible */}
                  <div className="flex items-center justify-between gap-2 fold:gap-1">
                    {/* View Mode Toggle */}
                    <div className="flex gap-1">

                      <Button
                        variant={viewMode === "time" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleViewModeChange("time")}
                        className={`
                        h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] transition-all duration-200 flex items-center gap-1 active:dark:bg-kvotizza-purple-600
                        ${
                          viewMode === "time"
                            ? " dark:bg-dark-theme-purple-20 bg-kvotizza-purple-500 hover:bg-kvotizza-purple-600 text-white"
                            : "bg-transparent dark:text-kvotizza-dark-theme-purple-10 text-kvotizza-purple-700 hover:bg-kvotizza-purple-50 dark:border-kvotizza-dark-theme-purple-10 border-kvotizza-purple-200"
                        }
                      `}
                      >
                        <Clock className="h-3 fold:h-2 w-3 fold:w-2" />
                        {!isVeryNarrow && "Vreme"}
                      </Button>
                      <Button
                        variant={viewMode === "league" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleViewModeChange("league")}
                        className={`
                        h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] transition-all duration-200 flex items-center gap-1 active:dark:bg-kvotizza-purple-600
                        ${
                          viewMode === "league"
                            ? "dark:bg-dark-theme-purple-20 bg-kvotizza-purple-500 hover:bg-kvotizza-purple-600 text-white"
                            : "bg-transparent dark:text-kvotizza-dark-theme-purple-10 text-kvotizza-purple-700 hover:bg-kvotizza-purple-50 dark:border-kvotizza-dark-theme-purple-10 border-kvotizza-purple-200"
                        }
                      `}
                      >
                        <List className="h-3 fold:h-2 w-3 fold:w-2" />
                        {!isVeryNarrow && "Takmičenje"}
                      </Button>
                    </div>

                    {/* Quick Search Toggle */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchExpanded(!searchExpanded)}
                        className={`
                        h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] transition-all duration-200 flex items-center gap-1
                        ${
                          searchExpanded || hasActiveFilters
                            ? "bg-kvotizza-blue-50 border-kvotizza-blue-200 text-kvotizza-blue-700"
                            : "bg-transparent"
                        }
                      `}
                      >
                        <Search className="h-3 fold:h-2 w-3 fold:w-2" />
                        {hasActiveFilters && <Badge variant="secondary" className="h-3 w-3 p-0 text-[0.5rem]" />}
                      </Button>

                      {/* Controls Toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setControlsExpanded(!controlsExpanded)}
                        className={`
                        h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] transition-all duration-200 flex items-center gap-1
                        ${
                          controlsExpanded
                            ? "bg-kvotizza-green-50 border-kvotizza-green-200 text-kvotizza-green-700"
                            : "bg-transparent"
                        }
                      `}
                      >
                        <Settings className="h-3 fold:h-2 w-3 fold:w-2" />
                        {controlsExpanded ? (
                          <ChevronUp className="h-3 fold:h-2 w-3 fold:w-2" />
                        ) : (
                          <ChevronDown className="h-3 fold:h-2 w-3 fold:w-2" />
                        )}
                      </Button>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Expandable Search Section */}
                  <div
                    className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${searchExpanded ? "max-h-20 opacity-100 mt-2 fold:mt-1" : "max-h-0 opacity-0"}
                  `}
                  >
                    <div className="space-y-2 fold:space-y-1 p-2 fold:p-1 bg-muted/20 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs fold:text-[0.6rem] font-medium text-muted-foreground flex items-center gap-1">
                          <Search className="h-3 fold:h-2 w-3 fold:w-2" />
                          Search & Filter
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchExpanded(false)}
                          className="h-5 fold:h-4 w-5 fold:w-4 p-0"
                        >
                          <X className="h-3 fold:h-2 w-3 fold:w-2" />
                        </Button>
                      </div>

                      <div className="flex gap-2 fold:gap-1">
                        <Input
                          placeholder="Search matches..."
                          value={searchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                          className="h-6 fold:h-5 text-xs fold:text-[0.6rem] flex-1"
                        />
                        <Select value={leagueFilter} onValueChange={handleLeagueFilter}>
                          <SelectTrigger className="h-6 fold:h-5 w-20 fold:w-16 text-xs fold:text-[0.6rem]">
                            <Filter className="h-3 fold:h-2 w-3 fold:w-2" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {leagues.map((league: string) => (
                              <SelectItem key={league} value={league} className="text-xs fold:text-[0.6rem]">
                                {league}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] text-destructive border-destructive/20 hover:bg-destructive/10 bg-transparent"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Controls Section */}
                  <div
                    className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${controlsExpanded ? "max-h-40 opacity-100 mt-2 fold:mt-1" : "max-h-0 opacity-0"}
                  `}
                  >
                    <div className="space-y-2 fold:space-y-1 p-2 fold:p-1 bg-muted/20 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs fold:text-[0.6rem] font-medium text-muted-foreground flex items-center gap-1">
                          <Settings className="h-3 fold:h-2 w-3 fold:w-2" />
                          Settings
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setControlsExpanded(false)}
                          className="h-5 fold:h-4 w-5 fold:w-4 p-0"
                        >
                          <X className="h-3 fold:h-2 w-3 fold:w-2" />
                        </Button>
                      </div>

                      {/* Sport Selection */}
                      <div className="space-y-1">
                        <Volleyball className="h-4 w-4 text-muted-foreground hidden md:block" />
                        {/* <span className="text-xs fold:text-[0.6rem] font-medium text-muted-foreground">Sport:</span> */}
                        <div className="flex gap-1 overflow-x-auto">
                          {availableSports.map((sport) => (
                            <Button
                              key={sport.key}
                              variant={selectedSport === sport.key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSport(sport.key)}
                              className={`
                              h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] whitespace-nowrap transition-all duration-200
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

                      {/* Date Selection */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          
                          <Calendar className="h-4 w-4 fold:h-2 w-3 fold:w-2 text-muted-foreground hidden md:block" />
                          {/* <span className="text-xs fold:text-[0.6rem] font-medium text-muted-foreground">Date:</span> */}
                        </div>
                        {isVeryNarrow ? (
                          <Select value={selectedDateSpan} onValueChange={setSelectedDateSpan}>
                            <SelectTrigger className="h-6 fold:h-5 w-full text-xs fold:text-[0.6rem]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDateSpans.map((dateSpan) => (
                                <SelectItem
                                  key={dateSpan.key}
                                  value={dateSpan.key}
                                  className="text-xs fold:text-[0.6rem]"
                                >
                                  {dateSpan.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex gap-1 overflow-x-auto">
                            {availableDateSpans.map((dateSpan) => (
                              <Button
                                key={dateSpan.key}
                                variant={selectedDateSpan === dateSpan.key ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedDateSpan(dateSpan.key)}
                                className={`
                                h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] whitespace-nowrap transition-all duration-200
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {loadingMatches && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-xs fold:text-[0.6rem] text-muted-foreground">
                    <Loader2 className="h-3 fold:h-2 w-3 fold:w-2 animate-spin" />
                    <span>Loading...</span>
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
                  <div className="overflow-x-auto max-h-[calc(100vh-300px)] rounded-lg">
                    <Table className="table-fixed w-full">
                      <TableHeader className="sticky top-0 z-20 bg-white border-b shadow-sm dark:bg-kvotizza-dark-bg-20">
                        <TableRow className="bg-white dark:bg-kvotizza-dark-bg-20">
                          {isMobileView ? (
                            <TableHeadMini className="w-[80px] bg-white dark:bg-kvotizza-dark-bg-20"> <div className="flex items-center justify-end"> {/* makes content right-aligned */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                              <Button variant="ghostNoRing" size="icon" className="-mr-1" onMouseDown={(e) => e.preventDefault()}>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                        
                              {/* align menu to the right edge of the trigger */}
                              <DropdownMenuContent
                                align="end"
                                sideOffset={4}
                                className="w-44 p-0 bg-popover text-popover-foreground border border-border/40 shadow-lg"
                                onCloseAutoFocus={(e) => e.preventDefault()}

                              >                                
                              {categories.map((category) => (
                                  <DropdownMenuItem
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`rounded-none px-4 py-2  text-xs font-small transition-all border-b-2
                                  ${selectedCategory === category
                                    ? "bg-gray-50 dark:bg-kvotizza-dark-bg-20  dark:hover:bg-kvotizza-dark-bg-20 dark:text-white "
                                    : "bg-gray-50  dark:bg-kvotizza-dark-bg-20 dark:hover:bg-kvotizza-dark-bg-20 hover:bg-muted border-transparent"}`}
                              >
                                    {category}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div></TableHeadMini>
                          )
                          :
                        (<TableHeadMini className="w-[50px] bg-white dark:bg-kvotizza-dark-bg-20"></TableHeadMini>)
                          }
                          {viewMode === "time" ? (
                            <>
                  <TableHeadMini className="font-semibold bg-white dark:bg-kvotizza-dark-bg-20 hidden md:block">
                    <div className="flex items-center justify-end"> {/* makes content right-aligned */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghostNoRing" size="icon" className="-mr-1" onMouseDown={(e) => e.preventDefault()}> {/* snug to the right edge */}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        {/* align menu to the right edge of the trigger */}
                        <DropdownMenuContent
                                align="end"
                                sideOffset={4}
                                className="w-44 p-0 bg-popover text-popover-foreground border border-border/40 shadow-lg"
                                onCloseAutoFocus={(e) => e.preventDefault()}

                              >   
                              {categories.map((category) => (
                            <DropdownMenuItem
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`rounded-none px-4 py-2 text-xs font-small transition-all border-b-2
                                ${selectedCategory === category
                                  ? "dark:bg-kvotizza-dark-bg-20 bg-gray-50 dark:hover:bg-kvotizza-dark-bg-20 text-black dark:text-white "
                                  : "text-black/50 hover:bg-gray-50 dark:bg-kvotizza-dark-bg-20 bg-gray-50  dark:text-white/50  dark:hover:bg-kvotizza-dark-bg-20 "}`}
                            >
                              {category}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHeadMini>

                            </>
                          ) : (
                      <TableHeadMini className="font-semibold bg-white dark:bg-kvotizza-dark-bg-20 hidden md:block">
                        <div className="flex items-center justify-end"> {/* makes content right-aligned */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghostNoRing" size="icon" className="-mr-1" onMouseDown={(e) => e.preventDefault()}
                              > {/* snug to the right edge */}
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                              {/* align menu to the right edge of the trigger */}
                              <DropdownMenuContent
                                align="end"
                                sideOffset={4}
                                className="w-44 p-0 bg-popover text-popover-foreground border border-border/40 shadow-lg"
                                onCloseAutoFocus={(e) => e.preventDefault()}

                              >   
                              {categories.map((category) => (
                                  <DropdownMenuItem
                                  key={category}
                                  onClick={() => setSelectedCategory(category)}
                                  className={`rounded-none px-4 py-2 text-xs font-small transition-all border-b-2
                                    ${selectedCategory === category
                                      ? "dark:bg-kvotizza-dark-bg-20 bg-gray-50 dark:hover:bg-kvotizza-dark-bg-20 text-black dark:text-white "
                                      : "text-black/50 hover:bg-gray-50 dark:bg-kvotizza-dark-bg-20 bg-gray-50  dark:text-white/50  dark:hover:bg-kvotizza-dark-bg-20 "}`}
                                >
                                  {category}
                                </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableHeadMini>

                          )
                          }
                          {/* Dynamic Quick Market Columns */}
                          {quickMarkets.map((market) => (
                            <TableHeadMini key={market.key} className="font-semibold text-left sm:pl-8 bg-white dark:bg-kvotizza-dark-bg-20 text-xs sm:text-sm dark:text-white">
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

                          const leadingCols = isMobileView ? 1 : 2; // time/league cell + (optional) expand caret
                          const colSpan = leadingCols + quickMarkets.length;

                          return (
                            <React.Fragment key={match.id}>
                              {showGroupHeader && (
                                <TableRow className="sticky top-[39px] z-10 bg-kvotizza-blue-500 dark:bg-dark-theme-kvotizza-blue-20 border-b shadow-sm bg-background ">
                                  <TableCellExpanded colSpan={colSpan} className="font-bold text-lg bg-kvotizza-blue-500 dark:bg-dark-theme-kvotizza-blue-20 text-white" >
                                    <div className="flex items-center gap-2 text-sm">
                                      <Trophy className="h-4 w-4 text-white" />
                                      {groupHeaderText}
                                    </div>
                                  </TableCellExpanded>
                                </TableRow>
                              )}
                              <TableRow
                                className="cursor-pointer hover:bg-muted/50 transition-colors dark:bg-kvotizza-dark-bg-20"
                                onClick={() => toggleRowExpansion(match.id)}
                              >
                                <TableCell className="hidden md:inline">
                                  {loadingDetails[match.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : expandedRows.includes(match.id) ? (
                                    
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </TableCell>
                                {viewMode === "time" ? (
                                  <TableCell className="py-2 ">
                                    <div className="flex items-center gap-3">
                                    <Image
                                            src={`/flags/${match.country_name.toLowerCase()}.png`}
                                            alt="Bookie"
                                            width={15}
                                            height={15}
                                            className="block hidden sm:block"
                                          />
                                      <div className="flex flex-col">
                                        <div className="text-xs font-bold text-kvotizza-green-600 dark:text-kvotizza-dark-theme-green-">
                                          {formatMatchLabel(match.start_time)}
                                        </div>
                                        <div className="font-medium text-xs">{match.matchup}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                ) : (
                                  <TableCell className="py-2">
                                    <div className="flex flex-col">
                                      <div className="text-xs text-kvotizza-green-600 font-medium dark:text-kvotizza-dark-theme-green-10">
                                        {formatMatchLabel(match.start_time)}
                                      </div>
                                      <div className="font-medium text-xs">{match.matchup}</div>
                                    </div>
                                  </TableCell>
                                )}
                                {/* Display best odds from quick markets */}
                                {quickMarkets.map((market) => {
                                  const quickMarket = match.quickMarkets[market.key]
                                  return (
                                    <TableCell key={`${match.id}-${market.key}`} className="text-center">
                                      {quickMarket ? (
                                        <div className="flex flex-col gap-1 px-1 sm:pl-6 items-left">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Image
                                            src={`/images/${quickMarket.bestBookie.toLowerCase()}.png`}
                                            alt="Bookie"
                                            width={20}
                                            height={20}
                                            className="block hidden sm:block"
                                          />
                                          {quickMarket.bestBookie}

                                        </span>
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
                                        <div className="flex flex-col gap-1 px-1 sm:pl-12 items-left">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">-</span>
                                        </div>
                                      )}
                                    </TableCell>
                                  )
                                })}
                              </TableRow>
                              {expandedRows.includes(match.id) && (
                              <TableRow key={`${match.id}-expanded`}>
                                <TableCell colSpan={colSpan} className="bg-muted/30 p-2 fold:p-1 dark:bg-kvotizza-dark-bg-20">
                                  <div className="space-y-3 fold:space-y-2">
                                    {loadingDetails[match.id] ? (
                                      <div className="text-center py-4 fold:py-2">
                                        <Loader2 className="h-6 fold:h-4 w-6 fold:w-4 animate-spin mx-auto mb-2 fold:mb-1" />
                                        <p className="text-muted-foreground text-sm fold:text-xs">
                                          Učitava kvote...
                                        </p>
                                      </div>
                                    ) : detailedMatches[match.id] ? (
                                      <>
                                        <div className="flex items-center justify-between ">
                                          <h4 className="text-base fold:text-sm font-semibold flex items-center gap-2 fold:gap-1 text-kvotizza-blue-600 dark:text-white">
                                            <TrendingUp className="h-4 fold:h-3 w-4 fold:w-3" />
                                            Dostupni tipovi
                                          </h4>
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              className="flex items-center gap-1 bg-kvotizza-blue-500 hover:bg-kvotizza-blue-600 text-white h-6 fold:h-5 text-xs fold:text-[0.6rem] px-2 fold:px-1"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigateToMatch(match.id)
                                              }}
                                            >
                                              <ExternalLink className="h-3 fold:h-2 w-3 fold:w-2" />
                                              {isVeryNarrow ? "Otvori" : "Otvori meč"}
                                            </Button>
                                          </div>
                                        </div>

                                        <div className="space-y-3 fold:space-y-2 max-h-[500px] fold:max-h-[400px] overflow-y-auto">
                                          {Object.entries(getTypesByCategory(detailedMatches[match.id])).map(
                                            ([category, types]) => (
                                              <div key={category} className="space-y-2 fold:space-y-1 ">
                                                {/* Category Header - Matches Screenshot Style */}
                                                <div className="flex items-center justify-center py-2 fold:py-1 bg-kvotizza-blue-500/10 rounded-lg border">
                                                  <h6 className="text-sm fold:text-xs font-bold text-black/70 text-center dark:text-white">
                                                    {category.toUpperCase()}
                                                  </h6>
                                                </div>

                                                {/* Bet Types for this Category */}
                                                {types.map((betType) => (
                                                  <div
                                                    key={`${betType.category}-${betType.type}`}
                                                    className="bg-background border rounded-lg p-2 fold:p-1 dark:bg-kvotizza-dark-bg-20"
                                                  >
                                                    {/* Bet Type Header with Plus Button */}
                                                    <div className="flex items-center justify-between mb-2 fold:mb-1">
                                                      <div className="flex items-center gap-2 fold:gap-1">
                                                        <span className="text-sm fold:text-xs font-semibold text-kvotizza-blue-600 dark:text-kvotizza-green-600">
                                                          {betType.type}
                                                        </span>
                                                      </div>
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 w-6 p-0 bg-kvotizza-green-50 hover:bg-kvotizza-green-100 border-kvotizza-green-200 dark:bg-kvotizza-dark-bg-20"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          addBetToBuilder(
                                                            match.id,
                                                            match.matchup,
                                                            match.league,
                                                            betType.category,
                                                            betType.type,
                                                          )
                                                        }}
                                                      >
                                                        <Plus className="h-3 fold:h-2 w-3 fold:w-2 text-kvotizza-green-600" />
                                                      </Button>
                                                    </div>

                                                    {/* Bookies Grid - Similar to Screenshot */}
                                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-2 fold:gap-1">
                                                      {detailedMatches[match.id].bookies.map((bookie: Bookie) => {
                                                        const odds = getOddsValue(
                                                          bookie,
                                                          betType.category,
                                                          betType.type,
                                                        )
                                                        const trend = getOddsTrend(
                                                          bookie,betType.category, betType.type
                                                        )


                                                        return (
                                                          <div
                                                            key={bookie.name}
                                                            className="flex flex-col items-center p-1 fold:p-1 bg-muted/30 rounded border"
                                                          >
                                                            {/* Bookie Name */}
                                                            <span className="text-[10px] md:text-xs fold:text-[0.6rem] font-medium text-muted-foreground text-center mb-1 truncate w-full">
                                                              {isVeryNarrow
                                                                ? bookie.name.substring(0, 6)
                                                                : bookie.name.length > 10
                                                                  ? bookie.name.substring(0, 10) + "..."
                                                                  : bookie.name}
                                                            </span>

                                                            {/* Odds with Trend */}
                                                            {odds ? (
                                                              <div className="flex items-center gap-1">
                                                                <span className="text-xs md:text-sm fold:text-xs font-bold text-center">
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
                                                              <span className="text-xs fold:text-[0.6rem] text-muted-foreground">
                                                                -
                                                              </span>
                                                            )}
                                                          </div>
                                                        )
                                                      })}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-center py-4 fold:py-2">
                                        <AlertCircle className="h-6 fold:h-4 w-6 fold:w-4 text-destructive mx-auto mb-2 fold:mb-1" />
                                        <p className="text-muted-foreground text-sm fold:text-xs">
                                          Failed to load detailed odds
                                        </p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="mt-2 fold:mt-1 bg-transparent h-6 fold:h-5 text-xs fold:text-[0.6rem]"
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
          {/* Simplified Pagination for narrow screens */}
          {totalFilteredMatches > itemsPerPage && (
            <Card>
              <CardContent className="p-2 fold:p-1  dark:bg-kvotizza-dark-bg-20">
                <div className="flex flex-col gap-2 fold:gap-1">
                  {/* Items per page selector - simplified */}
                  <div className="flex items-center justify-center gap-2 fold:gap-1">
                    <span className="text-xs fold:text-[0.6rem] text-muted-foreground  dark:bg-kvotizza-dark-bg-20">Prikaži:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-16 fold:w-12 h-6 fold:h-5 text-xs fold:text-[0.6rem]  dark:bg-kvotizza-dark-bg-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent  className="dark:bg-kvotizza-dark-bg-20">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Page info */}
                  <div className="text-xs fold:text-[0.6rem] text-muted-foreground text-center">
                    Strana {currentPage} od {totalPages}
                  </div>

                  {/* Simplified pagination buttons */}
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-transparent h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem]"
                    >
                      <ChevronLeft></ChevronLeft>
                    </Button>

                    <span className="text-xs fold:text-[0.6rem] px-2 fold:px-1">{currentPage}</span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="bg-transparent h-6 fold:h-5 px-2 fold:px-1 text-xs fold:text-[0.6rem] "
                    >
                      <ChevronRight></ChevronRight>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

            {/* Results Summary */}
            <div className="text-center text-sm text-muted-foreground">
              Prikazuje {Math.min(startIndex + 1, totalFilteredMatches)} do {Math.min(endIndex, totalFilteredMatches)} od {" "}
              {totalFilteredMatches} mečeva
              {(searchTerm || leagueFilter !== "all") && (
                <span className="ml-2 text-kvotizza-blue-600">(filtered from {allMatches.length} total)</span>
              )}
            </div>
          </div>
        </div>

        {/* Bet Sidebar */}
        <BetSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onAnalyzeBet={handleAnalyzeBet} page= 'main'/>

        {/* Bet Analysis Modal */}
        <BetAnalysisModal
          isOpen={analysisModalOpen}
          onClose={() => setAnalysisModalOpen(false)}
          selections={analysisSelections}
          stake={analysisStake}
        />
      </div>
    )
  }
