"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OddsMovementFilters } from "@/components/odds-movement/odds-movement-filters";
import { OddsLineChart } from "@/components/odds-movement/odds-line-chart";
import { BiggestMoversTable } from "@/components/odds-movement/biggest-movers-table";
import { BookieComparison } from "@/components/odds-movement/bookie-comparison";
import { apiService } from "@/lib/api-service";
import type {
  OddsMovementFilter,
  OddsHistory,
  OddsChange,
} from "@/types/odds-movement";
import { Skeleton } from "@/components/ui/skeleton";
import { LandingNavbar } from "@/components/landing-navbar";

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function OddsMovementPage() {
  const [activeTab, setActiveTab] = useState("chart");
  const [filters, setFilters] = useState<OddsMovementFilter>({
    countries: [],
    leagues: [],
    betCategories: [],
    bookies: [],
    dateFrom: "",
    dateTo: "",
    dateRange: "today",
    minChange: 5,
    maxCurrentOdd: undefined, // ADD THIS LINE
    showOnlyActive: true,
  });

  const [matchesWithChanges, setMatchesWithChanges] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [matchOddsHistory, setMatchOddsHistory] = useState<OddsHistory[]>([]);
  const [oddsChanges, setOddsChanges] = useState<OddsChange[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingChanges, setLoadingChanges] = useState(true);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch odds changes with pagination
  useEffect(() => {
    const fetchChanges = async () => {
      setLoadingChanges(true);
      try {
        const { dateFrom, dateTo } = getDateParams(filters.dateRange);
        const response = await apiService.getOddsChanges({
          countries:
            filters.countries.length > 0 ? filters.countries : undefined,
          leagues: filters.leagues.length > 0 ? filters.leagues : undefined,
          betCategories:
            filters.betCategories.length > 0
              ? filters.betCategories
              : undefined,
          bookies: filters.bookies.length > 0 ? filters.bookies : undefined,
          dateFrom,
          dateTo,
          minChangePercent: filters.minChange,
          maxCurrentOdd: filters.maxCurrentOdd, // ADD THIS LINE
          hoursBack: 150,
          page: currentPage,
          pageSize: pageSize,
        });

        setOddsChanges(response.data || []);
        setTotalPages(response.total_pages || 0);
        setTotalCount(response.total_count || 0);
      } catch (error) {
        console.error("Error fetching odds changes:", error);
        setOddsChanges([]);
        setTotalPages(0);
        setTotalCount(0);
      } finally {
        setLoadingChanges(false);
      }
    };

    fetchChanges();
  }, [filters, currentPage]);

  const getDateParams = (dateRange: string) => {
    const today = new Date();
    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    switch (dateRange) {
      case "today":
        dateFrom = getLocalDateString(today);
        dateTo = getLocalDateString(today);
        break;
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateFrom = getLocalDateString(tomorrow);
        dateTo = getLocalDateString(tomorrow);
        break;
      case "next_3_days":
        dateFrom = getLocalDateString(today);
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(threeDaysLater.getDate() + 2);
        dateTo = getLocalDateString(threeDaysLater);
        break;
      case "all":
        dateFrom = undefined;
        dateTo = undefined;
        break;
    }

    return { dateFrom, dateTo };
  };

  useEffect(() => {
    const resetFilters = {
      countries: [],
      leagues: [],
      betCategories: [],
      bookies: [],
      dateFrom: "",
      dateTo: "",
      dateRange: "today" as const,
      minChange: 5,
      maxCurrentOdd: undefined, // ADD THIS LINE
      showOnlyActive: true,
    };

    setFilters(resetFilters);
    setSelectedMatchId("");
    setMatchesWithChanges([]);
    setMatchOddsHistory([]);
    setOddsChanges([]);
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch matches with changes
  useEffect(() => {
    const fetchMatches = async () => {
      setLoadingMatches(true);
      try {
        const { dateFrom, dateTo } = getDateParams(filters.dateRange);
        const response = await apiService.getMatchesWithChanges({
          countries:
            filters.countries.length > 0 ? filters.countries : undefined,
          leagues: filters.leagues.length > 0 ? filters.leagues : undefined,
          betCategories:
            filters.betCategories.length > 0
              ? filters.betCategories
              : undefined,
          dateFrom,
          dateTo,
          minChangePercent: filters.minChange,
          daysBack: 6,
        });
        setMatchesWithChanges(response.data || []);

        setSelectedMatchId("");
        setMatchOddsHistory([]);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setMatchesWithChanges([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [
    filters.countries,
    filters.leagues,
    filters.betCategories,
    filters.dateRange,
    filters.minChange,
  ]);

  // Fetch history for selected match
  useEffect(() => {
    if (!selectedMatchId) {
      setMatchOddsHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const response = await apiService.getMatchOddsHistory({
          matchId: selectedMatchId,
          bookies: filters.bookies.length > 0 ? filters.bookies : undefined,
        });
        setMatchOddsHistory(response.data || []);
      } catch (error) {
        console.error("Error fetching match history:", error);
        setMatchOddsHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedMatchId, filters.bookies]);

  // NOTE: You have duplicate fetchChanges useEffect - I removed the second one since it's redundant

  return (
    <div className="min-h-screen bg-background dark:bg-kvotizza-dark-bg-10">
      <LandingNavbar></LandingNavbar>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Trendovi kvota
          </h1>
          <p className="text-muted-foreground">
            Detaljno praćenje kretanja kvota i njihova analiza.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-3 h-9 dark:bg-kvotizza-dark-bg-10">
            <TabsTrigger
              value="chart"
              className="text-xs sm:text-sm data-[state=active]:dark:bg-kvotizza-dark-bg-20"
            >
              Grafikon
            </TabsTrigger>
            <TabsTrigger
              value="movers"
              className="text-xs sm:text-sm data-[state=active]:dark:bg-kvotizza-dark-bg-20"
            >
              Promene
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="text-xs sm:text-sm data-[state=active]:dark:bg-kvotizza-dark-bg-20"
            >
              Poređenje
            </TabsTrigger>
          </TabsList>

          <OddsMovementFilters
            key={activeTab}
            filters={filters}
            onFiltersChange={setFilters}
            activeTab={activeTab}
          />
          <TabsContent value="chart" className="mt-0">
            {loadingMatches ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full dark:bg-kvotizza-dark-bg-20" />
                <Skeleton className="h-96 w-full dark:bg-kvotizza-dark-bg-20" />
              </div>
            ) : (
              <OddsLineChart
                matches={matchesWithChanges}
                selectedMatchId={selectedMatchId}
                onMatchSelect={setSelectedMatchId}
                data={matchOddsHistory}
                filters={filters}
              />
            )}
          </TabsContent>

          <TabsContent value="movers" className="mt-0">
            {loadingChanges ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-20 dark:bg-kvotizza-dark-bg-20"
                    />
                  ))}
                </div>
                <Skeleton className="h-96 w-full dark:bg-kvotizza-dark-bg-20" />
              </div>
            ) : (
              <BiggestMoversTable
                data={oddsChanges}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-0">
            {loadingMatches ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full dark:bg-kvotizza-dark-bg-20" />
                <Skeleton className="h-96 w-full dark:bg-kvotizza-dark-bg-20" />
              </div>
            ) : (
              <BookieComparison
                matches={matchesWithChanges}
                selectedMatchId={selectedMatchId}
                onMatchSelect={setSelectedMatchId}
                data={matchOddsHistory}
                filters={filters}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
