"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AnalyticsFilter,
  FilterState,
} from "@/components/analytics/analytics-filter";
import { MatchupAnalytics } from "@/components/analytics/matchup-analytics";
import GoalStatsView from "@/components/analytics/goals-stats-view";
import { apiService } from "@/lib/api-service";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnalysisMetric,
  MatchRecommendation,
  TeamFormStatistic,
  TeamStatistic,
} from "@/types/analytics";
import { LandingNavbar } from "@/components/landing-navbar";
import { TeamFormAnalysis } from "@/components/analytics/team-form-analysis";

// Helper function to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalysisMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState("over_2.5_ft");
  const [sortBy, setSortBy] = useState("combined");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState("mecevi");

  const [filters, setFilters] = useState<FilterState>({
    countries: [],
    leagues: [],
    dateRange: "today",
  });
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>(
    []
  );
  const [teamStats, setTeamStats] = useState<TeamStatistic[]>([]);

  // Separate pagination state for each tab
  const [matchesTotalCount, setMatchesTotalCount] = useState(0);
  const [matchesTotalPages, setMatchesTotalPages] = useState(0);
  const [goalsTotalCount, setGoalsTotalCount] = useState(0);
  const [goalsTotalPages, setGoalsTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingTeamStats, setLoadingTeamStats] = useState(false);

  const [teamForm, setTeamForm] = useState<TeamFormStatistic[]>([]);
  const [formTotalCount, setFormTotalCount] = useState(0);
  const [formTotalPages, setFormTotalPages] = useState(0);
  const [loadingTeamForm, setLoadingTeamForm] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState("over_2.5_ft");
  const [lastNMatches, setLastNMatches] = useState(5);
  // Calculate date range helper
  const getDateRange = useCallback(() => {
    const today = new Date();
    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    switch (filters.dateRange) {
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
  }, [filters.dateRange]);

  // In page.tsx, add this to your useEffect:
  useEffect(() => {
    if (activeTab !== "forma") return;

    console.log("Fetching team form data...");
    setLoadingTeamForm(true);
    const { dateFrom, dateTo } = getDateRange();

    console.log("Date range:", { dateFrom, dateTo });
    console.log("Filters:", filters);

    apiService
      .getTeamForm({
        criterion: selectedCriterion,
        lastNMatches: lastNMatches,
        countries: filters.countries.length > 0 ? filters.countries : undefined,
        leagues: filters.leagues.length > 0 ? filters.leagues : undefined,
        dateFrom,
        dateTo,
        page: currentPage,
        pageSize: pageSize,
      })
      .then((data) => {
        console.log("Team form data received:", data);
        setTeamForm(data.data);
        setFormTotalCount(data.total_teams);
        setFormTotalPages(data.total_pages);
      })
      .catch((error) => {
        console.error("Error fetching team form:", error);
      })
      .finally(() => setLoadingTeamForm(false));
  }, [
    activeTab,
    selectedCriterion,
    lastNMatches,
    filters,
    getDateRange,
    currentPage,
    pageSize,
  ]);
  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    apiService
      .getMetrics()
      .then((data) => {
        setMetrics(data);
        if (data.length > 0) {
          setSelectedMetric(data[0].value);
        }
      })
      .catch(console.error);
  }, []);

  // Load match recommendations - only when on mecevi tab
  useEffect(() => {
    if (activeTab !== "mecevi") return;

    setLoading(true);
    const { dateFrom, dateTo } = getDateRange();

    apiService
      .getRecommendations({
        analysisType: selectedMetric,
        countries: filters.countries.length > 0 ? filters.countries : undefined,
        leagues: filters.leagues.length > 0 ? filters.leagues : undefined,
        dateFrom,
        dateTo,
        minMatches: 5,
        sortBy: sortBy,
        page: currentPage,
        pageSize: pageSize,
      })
      .then((data) => {
        setRecommendations(data.data);
        setMatchesTotalCount(data.total_count);
        setMatchesTotalPages(data.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [
    activeTab,
    selectedMetric,
    filters,
    sortBy,
    currentPage,
    pageSize,
    getDateRange,
  ]);

  // Load team statistics - only when on golovi tab
  useEffect(() => {
    if (activeTab !== "golovi") return;

    setLoadingTeamStats(true);
    const { dateFrom, dateTo } = getDateRange();

    apiService
      .getTeamStatistics({
        countries: filters.countries.length > 0 ? filters.countries : undefined,
        leagues: filters.leagues.length > 0 ? filters.leagues : undefined,
        dateFrom,
        dateTo,
        minMatches: 5,
        sortBy: "over_2_5_ft",
        page: currentPage,
        pageSize: pageSize,
      })
      .then((data) => {
        setTeamStats(data.data);
        setGoalsTotalCount(data.total_count);
        setGoalsTotalPages(data.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoadingTeamStats(false));
  }, [activeTab, filters, getDateRange, currentPage, pageSize]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-kvotizza-dark-bg-10">
      <LandingNavbar isDark={isDark} onThemeToggle={handleThemeToggle} />

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Analitika</h1>
          <p className="text-muted-foreground">
            Detaljne statistike i analize za informisano klađenje
          </p>
        </div>

        <Tabs
          defaultValue="mecevi"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="mecevi">Mečevi</TabsTrigger>
            <TabsTrigger value="golovi">Golovi</TabsTrigger>
            <TabsTrigger value="forma">Forma</TabsTrigger>
            <TabsTrigger value="timovi" disabled>
              Timovi
            </TabsTrigger>
            <TabsTrigger value="lige" disabled>
              Lige
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mecevi" className="space-y-6 mt-6">
            <AnalyticsFilter onFilterChange={handleFilterChange} />

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <MatchupAnalytics
                data={recommendations}
                metrics={metrics}
                selectedMetric={selectedMetric}
                sortBy={sortBy}
                currentPage={currentPage}
                totalPages={matchesTotalPages}
                totalCount={matchesTotalCount}
                pageSize={pageSize}
                onMetricChange={setSelectedMetric}
                onSortChange={setSortBy}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </TabsContent>

          <TabsContent value="golovi" className="space-y-6 mt-6">
            <AnalyticsFilter onFilterChange={handleFilterChange} />

            {loadingTeamStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <GoalStatsView
                data={teamStats}
                currentPage={currentPage}
                totalPages={goalsTotalPages}
                totalCount={goalsTotalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </TabsContent>

          <TabsContent value="forma" className="space-y-6 mt-6">
            <AnalyticsFilter onFilterChange={handleFilterChange} />

            {loadingTeamForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <TeamFormAnalysis
                data={teamForm}
                currentPage={currentPage}
                totalPages={formTotalPages}
                totalCount={formTotalCount}
                pageSize={pageSize}
                selectedCriterion={selectedCriterion}
                lastNMatches={lastNMatches}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                onCriterionChange={setSelectedCriterion}
                onLastNMatchesChange={setLastNMatches}
              />
            )}
          </TabsContent>

          <TabsContent value="timovi">
            <div className="text-center py-12 text-muted-foreground">
              Uskoro dostupno
            </div>
          </TabsContent>

          <TabsContent value="lige">
            <div className="text-center py-12 text-muted-foreground">
              Uskoro dostupno
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
