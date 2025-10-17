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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { OddsHistory, OddsMovementFilter } from "@/types/odds-movement";
import { Trophy, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface BookieComparisonProps {
  matches: any[]; // Lista mečeva sa promenama
  selectedMatchId: string;
  onMatchSelect: (matchId: string) => void;
  data: OddsHistory[]; // Istorija samo za izabrani meč
  filters: OddsMovementFilter;
}

export function BookieComparison({
  matches,
  selectedMatchId,
  onMatchSelect,
  data,
  filters,
}: BookieComparisonProps) {
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

  // Calculate bookie comparison
  const comparisonData = useMemo(() => {
    if (!selectedMatchId || !selectedBetType || data.length === 0) return [];

    const [category, name] = selectedBetType.split(" - ");

    const matchHistory = data.find(
      (d) => d.bet_category === category && d.bet_name === name
    );

    if (!matchHistory || !matchHistory.history) return [];

    const bookieData: {
      [key: string]: {
        bookie: string;
        currentOdd: number;
        openingOdd: number;
        minOdd: number;
        maxOdd: number;
        avgOdd: number;
        change: number;
        changePercent: number;
        trend: "up" | "down" | "stable";
      };
    } = {};
    const groupedByBookie = matchHistory.history.reduce((acc, entry) => {
      if (!acc[entry.bookie]) {
        acc[entry.bookie] = [];
      }
      acc[entry.bookie].push(entry);
      return acc;
    }, {} as Record<string, typeof matchHistory.history>);

    Object.entries(groupedByBookie).forEach(([bookie, entries]) => {
      const odds = entries.map((e) => e.odd).sort((a, b) => a - b);

      // Sort by timestamp to get correct opening and current
      const sortedEntries = [...entries].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const opening = sortedEntries[0].odd;
      const current = sortedEntries[sortedEntries.length - 1].odd;
      const change = current - opening;
      const changePercent = opening !== 0 ? (change / opening) * 100 : 0;

      bookieData[bookie] = {
        bookie,
        currentOdd: current,
        openingOdd: opening,
        minOdd: Math.min(...odds),
        maxOdd: Math.max(...odds),
        avgOdd: odds.reduce((sum, odd) => sum + odd, 0) / odds.length,
        change,
        changePercent,
        trend: change > 0.01 ? "up" : change < -0.01 ? "down" : "stable",
      };
    });

    return Object.values(bookieData).sort(
      (a, b) => b.currentOdd - a.currentOdd
    );
  }, [data, selectedMatchId, selectedBetType]);

  const bestOdd = comparisonData.length > 0 ? comparisonData[0] : null;
  const worstOdd =
    comparisonData.length > 0
      ? comparisonData[comparisonData.length - 1]
      : null;
  const avgOdd =
    comparisonData.length > 0
      ? (
          comparisonData.reduce((sum, d) => sum + d.currentOdd, 0) /
          comparisonData.length
        ).toFixed(2)
      : "0.00";

  const oddsDifference =
    bestOdd && worstOdd
      ? (
          ((bestOdd.currentOdd - worstOdd.currentOdd) / worstOdd.currentOdd) *
          100
        ).toFixed(1)
      : "0";

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
                Izaberite filtere da uporedite kladionice
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
          <CardTitle className="text-base sm:text-lg">
            Uporedi kladionice
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Uporedite kvote različitih kladionica
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
                  Nema dostupnih mečeva
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

      {comparisonData.length > 0 && (
        <>
          {/* Summary cards - Mobile optimized */}
          <div className="grid grid-cols-3 gap-2">
            <Card>
              <CardContent className="p-2.5 sm:p-3">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    <span className="truncate">Najbolja</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold">
                    {bestOdd?.currentOdd.toFixed(2)}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                    {bestOdd?.bookie}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2.5 sm:p-3">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Prosek
                  </div>
                  <div className="text-base sm:text-lg font-bold">{avgOdd}</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                    {comparisonData.length} klad.
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2.5 sm:p-3">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Razlika
                  </div>
                  <div className="text-base sm:text-lg font-bold">
                    {oddsDifference}%
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                    max vs min
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader className="pb-3 px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">
                Detaljna uporedba
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kladionica</TableHead>
                      <TableHead className="text-right">Trenutna</TableHead>
                      <TableHead className="text-right">Početna</TableHead>
                      <TableHead className="text-right">Min/Max</TableHead>
                      <TableHead className="text-right">Prosek</TableHead>
                      <TableHead className="text-right">Promena</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonData.map((bookie, idx) => (
                      <TableRow
                        key={bookie.bookie}
                        className={
                          idx === 0 ? "bg-yellow-50 dark:bg-yellow-950/20" : ""
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                            {bookie.bookie}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {bookie.currentOdd.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {bookie.openingOdd.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {bookie.minOdd.toFixed(2)}/{bookie.maxOdd.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {bookie.avgOdd.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              bookie.trend === "up"
                                ? "default"
                                : bookie.trend === "down"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {bookie.change > 0 ? "+" : ""}
                            {bookie.changePercent.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {bookie.trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {bookie.trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {bookie.trend === "stable" && (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards - Simplified */}
              <div className="sm:hidden space-y-2">
                {comparisonData.map((bookie, idx) => (
                  <Card
                    key={bookie.bookie}
                    className={idx === 0 ? "border-yellow-500 border-2" : ""}
                  >
                    <CardContent className="p-2.5 space-y-1.5">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && (
                            <Trophy className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                          )}
                          <span className="font-bold text-xs truncate">
                            {bookie.bookie}
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {bookie.currentOdd.toFixed(2)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Početna:
                          </span>
                          <span className="font-medium">
                            {bookie.openingOdd.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prosek:</span>
                          <span className="font-medium">
                            {bookie.avgOdd.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min:</span>
                          <span className="font-medium">
                            {bookie.minOdd.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max:</span>
                          <span className="font-medium">
                            {bookie.maxOdd.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Change badge */}
                      <div className="flex items-center justify-between pt-1">
                        <Badge
                          variant={
                            bookie.trend === "up"
                              ? "default"
                              : bookie.trend === "down"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px] h-5 px-1.5"
                        >
                          {bookie.change > 0 ? "+" : ""}
                          {bookie.changePercent.toFixed(1)}%
                        </Badge>
                        {bookie.trend === "up" && (
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        )}
                        {bookie.trend === "down" && (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {comparisonData.length === 0 && selectedMatchId && selectedBetType && (
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
              Izaberite meč da uporedite kladionice
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
