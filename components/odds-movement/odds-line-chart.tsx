"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { OddsHistory, OddsMovementFilter } from "@/types/odds-movement";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface OddsLineChartProps {
  matches: any[];
  selectedMatchId: string;
  onMatchSelect: (matchId: string) => void;
  data: OddsHistory[];
  filters: OddsMovementFilter;
}

const bookieColors: Record<string, string> = {
  Mozzartbet: "#e6194B", // red-pink
  Superbet: "#3cb44b", // green
  Maxbet: "#4363d8", // blue
  Soccer: "#f58231", // orange
  MerkurXTip: "#911eb4", // purple
  Pinnbet: "#46f0f0", // cyan
  Betole: "#f032e6", // magenta
  Balkanbet: "#bcf60c", // lime
  Admiralbet: "#fabebe", // light pink
  Volcano: "#008080", // teal
};
export function OddsLineChart({
  matches,
  selectedMatchId,
  onMatchSelect,
  data,
  filters,
}: OddsLineChartProps) {
  const [selectedBetType, setSelectedBetType] = useState<string>("");

  // Check if required filters are selected
  const showMatchSelector = useMemo(() => {
    return (
      filters.dateRange &&
      filters.countries.length > 0 &&
      filters.leagues.length > 0
    );
  }, [filters.dateRange, filters.countries, filters.leagues]);

  // Reset bet type when match changes
  useEffect(() => {
    setSelectedBetType("");
  }, [selectedMatchId]);

  // Get unique bet types from data, filtered by selected bet types
  const betTypes = useMemo(() => {
    if (!selectedMatchId || data.length === 0) return [];

    const allBetTypes = Array.from(
      new Set(data.map((d) => `${d.bet_category} - ${d.bet_name}`))
    );

    // If bet types filter is applied, only show those categories
    if (filters.betCategories && filters.betCategories.length > 0) {
      return allBetTypes.filter((betType) => {
        const [category] = betType.split(" - ");
        return filters.betCategories.includes(category);
      });
    }

    return allBetTypes;
  }, [data, selectedMatchId, filters.betCategories]);

  // Auto-select first bet type when available
  useEffect(() => {
    if (betTypes.length > 0 && !selectedBetType) {
      setSelectedBetType(betTypes[0]);
    }
  }, [betTypes, selectedBetType]);

  // Helper: human-friendly tick formatter
  const tickFormatter = (ms: number) => {
    const d = new Date(ms);
    // Short format: "13 Oct 14:30" — adjust to your locale if needed
    return d.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Prepare chart data: single row per timestamp (time in ms) and optional timeLabel
  const chartData = useMemo(() => {
    if (!selectedMatchId || !selectedBetType || data.length === 0) return [];

    const [category, name] = selectedBetType.split(" - ");

    const matchHistory = data.find(
      (d) => d.bet_category === category && d.bet_name === name
    );

    if (!matchHistory || !matchHistory.history) return [];

    // First pass: collect all bookies present in history
    const allBookies = new Set<string>();
    matchHistory.history.forEach((entry: any) => {
      if (entry.bookie) allBookies.add(entry.bookie);
    });
    const allBookiesArr = Array.from(allBookies);

    // Use Map keyed by numeric timestamp (ms) to merge bookies
    const timeMap = new Map<number, Record<string, any>>();

    matchHistory.history.forEach((entry: any) => {
      // Normalize to ms
      const ts =
        typeof entry.timestamp === "number"
          ? entry.timestamp
          : +new Date(entry.timestamp);

      if (!timeMap.has(ts)) {
        const date = new Date(ts);
        const timeLabel = `${date.getDate()}/${date.getMonth() + 1} ${String(
          date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

        // initialize row with explicit nulls for every known bookie
        const baseRow: Record<string, any> = { time: ts, timeLabel };
        allBookiesArr.forEach((b) => {
          baseRow[b] = null;
        });

        timeMap.set(ts, baseRow);
      }

      const row = timeMap.get(ts)!;
      // set explicit null or value (avoid leaving undefined)
      row[entry.bookie] = entry.odd != null ? entry.odd : null;
    });

    // Sort by timestamp ascending and return array
    return Array.from(timeMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, row]) => row);
  }, [data, selectedMatchId, selectedBetType]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const bookieStats: {
      [bookie: string]: {
        min: number;
        max: number;
        current: number;
        change: number;
        trend: "up" | "down" | "stable";
      };
    } = {};

    // Get all unique bookies from data
    const allBookies = new Set<string>();
    chartData.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== "time" && key !== "timeLabel") allBookies.add(key);
      });
    });

    const selectedBookies =
      filters.bookies.length > 0
        ? Array.from(allBookies).filter((b) => filters.bookies.includes(b))
        : Array.from(allBookies);

    selectedBookies.forEach((bookie) => {
      // Ensure values are taken in time order (chartData is sorted by time)
      const values = chartData
        .map((point) => point[bookie])
        .filter((v) => v !== undefined && v !== null);

      if (values.length > 0) {
        const first = values[0];
        const last = values[values.length - 1];
        const change = last - first;

        bookieStats[bookie] = {
          min: Math.min(...values),
          max: Math.max(...values),
          current: last,
          change,
          trend: change > 0.01 ? "up" : change < -0.01 ? "down" : "stable",
        };
      }
    });

    return bookieStats;
  }, [chartData, filters.bookies]);

  // Get available bookies for chart
  const availableBookies = useMemo(() => {
    if (chartData.length === 0) return [];

    const allBookies = new Set<string>();
    chartData.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== "time" && key !== "timeLabel") allBookies.add(key);
      });
    });

    // Filter by selected bookies if any
    if (filters.bookies.length > 0) {
      return Array.from(allBookies).filter((b) => filters.bookies.includes(b));
    }

    return Array.from(allBookies);
  }, [chartData, filters.bookies]);

  // If filters are not selected, show instruction
  if (!showMatchSelector) {
    const missingFilters = [];
    if (!filters.dateRange) missingFilters.push("Datum");
    if (filters.countries.length === 0) missingFilters.push("Države");
    if (filters.leagues.length === 0) missingFilters.push("Lige");

    return (
      <Card>
        <CardContent className="p-4 sm:p-6 dark:bg-kvotizza-dark-bg-10">
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-medium">
                Izaberite filtere da vidite kretanje kvota
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Potrebni filteri:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {missingFilters.map((filter) => (
                  <Badge key={filter} variant="outline" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selection controls */}
      <Card>
        <CardHeader className="pb-3 px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Kretanje kvota</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Pratite promene kvota tokom vremena
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
          <Select value={selectedMatchId} onValueChange={onMatchSelect}>
            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Izaberite meč" />
            </SelectTrigger>
            <SelectContent>
              {matches.length === 0 ? (
                <SelectItem value="no-matches" disabled>
                  Nema dostupnih mečeva sa promenama kvota veće od 1%
                </SelectItem>
              ) : (
                matches.map((match) => (
                  <SelectItem
                    key={match.match_id}
                    value={match.match_id}
                    className="text-xs sm:text-sm"
                  >
                    <span className="block sm:hidden">
                      {match.home_team} vs {match.away_team}
                    </span>
                    <span className="hidden sm:block">
                      {match.home_team} vs {match.away_team} (
                      {match.competition_name})
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select
            value={selectedBetType}
            onValueChange={setSelectedBetType}
            disabled={!selectedMatchId || betTypes.length === 0}
          >
            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Izaberite tip" />
            </SelectTrigger>
            <SelectContent>
              {betTypes.length === 0 ? (
                <SelectItem value="no-types" disabled>
                  {selectedMatchId ? "Učitavanje..." : "Prvo izaberite meč"}
                </SelectItem>
              ) : (
                betTypes.map((bet) => (
                  <SelectItem
                    key={bet}
                    value={bet}
                    className="text-xs sm:text-sm"
                  >
                    {bet}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {chartData.length > 0 && stats && (
        <>
          {/* Statistics cards - Mobile optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(stats)
              .slice(0, 10)
              .map(([bookie, stat]) => (
                <Card key={bookie}>
                  <CardContent className="p-2.5 sm:p-3">
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {bookie}
                      </div>
                      <div className="text-base sm:text-lg font-bold">
                        {stat.current.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                        {stat.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                        {stat.trend === "down" && (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={
                            stat.trend === "up"
                              ? "text-green-600"
                              : stat.trend === "down"
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }
                        >
                          {stat.change > 0 ? "+" : ""}
                          {stat.change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-3 px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">
                Grafikon kretanja
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2 pb-4 sm:px-6 sm:pb-6">
              <div className="h-[250px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      type="number"
                      scale="time"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={tickFormatter}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10 }}
                      className="text-[10px] sm:text-xs"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10 }}
                      className="text-[10px] sm:text-xs"
                    />
                    <Tooltip
                      labelFormatter={(ms: number) =>
                        new Date(ms).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }
                      contentStyle={{ fontSize: "12px" }}
                      labelStyle={{ fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
                    {availableBookies.map((bookie) => (
                      <Line
                        key={bookie}
                        type="monotone"
                        dataKey={bookie}
                        stroke={bookieColors[bookie] || "#6366f1"}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                        connectNulls={true} // <- connect across nulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showMatchSelector &&
        chartData.length === 0 &&
        selectedMatchId &&
        selectedBetType && (
          <Card>
            <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
              <p className="text-xs sm:text-sm">
                Nema dostupnih podataka za ovaj izbor
              </p>
            </CardContent>
          </Card>
        )}

      {showMatchSelector && !selectedMatchId && matches.length > 0 && (
        <Card>
          <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
            <p className="text-xs sm:text-sm">
              Izaberite meč da vidite kretanje kvota
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
