"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { AnalysisMetric, MatchRecommendation } from "@/types/analytics";

interface MatchupAnalyticsProps {
  data: MatchRecommendation[];
  metrics: AnalysisMetric[];
  selectedMetric: string;
  sortBy: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onMetricChange: (metric: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function MatchupAnalytics({
  data,
  metrics,
  selectedMetric,
  sortBy,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onMetricChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: MatchupAnalyticsProps) {
  const avgCombined =
    data.length > 0
      ? Math.round(
          data.reduce((sum, m) => sum + m.combined_pct, 0) / data.length
        )
      : 0;
  const bestCombined =
    data.length > 0
      ? Math.round(Math.max(...data.map((m) => m.combined_pct)))
      : 0;
  const highConfidence = data.filter((m) => m.combined_pct >= 70).length;

  const getRowColor = (rank: number) => {
    if (rank <= 3)
      return "bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30";
    return "";
  };

  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          Analiza mečeva
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedMetric} onValueChange={onMetricChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map((metric) => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="combined">Kombinovano</SelectItem>
              <SelectItem value="home">Domaćin</SelectItem>
              <SelectItem value="away">Gost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-normal text-muted-foreground">
              Ukupno mečeva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-normal text-muted-foreground">
              Prosek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{avgCombined}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-normal text-muted-foreground">
              Najbolji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {bestCombined}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-normal text-muted-foreground">
              ≥70%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              {highConfidence}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Meč</TableHead>
              <TableHead>Liga</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="text-right">D</TableHead>
              <TableHead className="text-right">G</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nema mečeva koji odgovaraju filterima
                </TableCell>
              </TableRow>
            ) : (
              data.map((match) => (
                <TableRow key={match.rank} className={getRowColor(match.rank)}>
                  <TableCell className="font-medium">
                    <Badge variant={match.rank <= 3 ? "default" : "outline"}>
                      {match.rank}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{match.match}</TableCell>
                  <TableCell>{match.league}</TableCell>
                  <TableCell>{match.date}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {match.home_pct}%
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {match.away_pct}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        match.combined_pct >= 70 ? "default" : "secondary"
                      }
                      className="font-bold"
                    >
                      {match.combined_pct}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nema mečeva koji odgovaraju filterima
            </CardContent>
          </Card>
        ) : (
          data.map((match) => (
            <Card key={match.rank} className={getRowColor(match.rank)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={match.rank <= 3 ? "default" : "outline"}
                        className="text-xs"
                      >
                        #{match.rank}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {match.date}
                      </span>
                    </div>
                    <div className="font-semibold text-sm mb-1">
                      {match.match}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {match.league}
                    </div>
                  </div>
                  <Badge
                    variant={match.combined_pct >= 70 ? "default" : "secondary"}
                    className="font-bold text-base"
                  >
                    {match.combined_pct}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-center flex-1">
                    <div className="text-xs text-muted-foreground">Domaćin</div>
                    <div className="font-semibold">{match.home_pct}%</div>
                  </div>
                  <div className="text-center flex-1 border-x px-2">
                    <div className="text-xs text-muted-foreground">Komb</div>
                    <div className="font-semibold">{match.combined_pct}%</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-xs text-muted-foreground">Gost</div>
                    <div className="font-semibold">{match.away_pct}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Prikaži:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page info and controls */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {startItem}-{endItem} od {totalCount}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium">{currentPage}</span>
                <span className="text-sm text-muted-foreground">od</span>
                <span className="text-sm font-medium">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
