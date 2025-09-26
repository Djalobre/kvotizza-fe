"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AnalyticsFilter,
  FilterState,
} from "@/components/analytics/analytics-filter";
import { MatchupAnalytics } from "@/components/analytics/matchup-analytics";
import { apiService } from "@/lib/api-service";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisMetric, MatchRecommendation } from "@/types/analytics";
import { LandingNavbar } from "@/components/landing-navbar";

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

  const [filters, setFilters] = useState<FilterState>({
    countries: [],
    leagues: [],
    dateRange: "today",
  });
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setLoading(true);

    // Get current date in LOCAL timezone
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

    console.log("Date filter:", {
      dateFrom,
      dateTo,
      currentTime: new Date().toString(),
    });

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
        setTotalCount(data.total_count);
        setTotalPages(data.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMetric, filters, sortBy, currentPage, pageSize]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-kvotizza-dark-bg-10">
      <LandingNavbar isDark={isDark} onThemeToggle={handleThemeToggle} />

      <div className="container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="mecevi" className="w-full">
          <TabsList>
            <TabsTrigger value="mecevi">Mečevi</TabsTrigger>
            <TabsTrigger value="golovi" disabled>
              Golovi
            </TabsTrigger>
            <TabsTrigger value="forma" disabled>
              Forma
            </TabsTrigger>
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
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onMetricChange={setSelectedMetric}
                onSortChange={setSortBy}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </TabsContent>

          <TabsContent value="golovi">
            <div className="text-center py-12 text-muted-foreground">
              Uskoro dostupno
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
