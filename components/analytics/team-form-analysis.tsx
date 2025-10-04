"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUpIcon,
  FilterIcon,
} from "lucide-react";
import type { TeamFormStatistic } from "@/types/analytics";

interface TeamFormAnalysisProps {
  data: TeamFormStatistic[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  selectedCriterion: string;
  lastNMatches: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCriterionChange: (criterion: string) => void;
  onLastNMatchesChange: (matches: number) => void;
}

const formCriteriaOptions = [
  { value: "over_2.5_ft", label: "UG 3+", description: "3+ golova po meču" },
  { value: "over_1.5_ft", label: "UG 2+", description: "2+ golova po meču" },
  { value: "over_3.5_ft", label: "UG 4+", description: "4+ golova po meču" },
  { value: "btts_ft", label: "GG", description: "Oba tima daju gol" },
  {
    value: "over_1.5_fh",
    label: "PP 2+",
    description: "2+ gola u prvom poluvremenu",
  },
  {
    value: "over_2.5_fh",
    label: "PP 3+",
    description: "3+ gola u prvom poluvremenu",
  },
  { value: "btts_fh", label: "IGG", description: "GG u prvom poluvremenu" },
];

const matchRangeOptions = [
  { value: 3, label: "Poslednja 3" },
  { value: 5, label: "Poslednja 5" },
  { value: 6, label: "Poslednja 6" },
  { value: 10, label: "Poslednja 10" },
];

export function TeamFormAnalysis({
  data,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  selectedCriterion,
  lastNMatches,
  onPageChange,
  onPageSizeChange,
  onCriterionChange,
  onLastNMatchesChange,
}: TeamFormAnalysisProps) {
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-lime-600";
    if (percentage >= 40) return "text-yellow-600";
    if (percentage >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-lime-500";
    if (percentage >= 40) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const selectedCriteriaLabel =
    formCriteriaOptions.find((opt) => opt.value === selectedCriterion)?.label ||
    "Over 2.5";

  const avgPercentage =
    data.length > 0
      ? data.reduce((sum, t) => sum + t.percentage, 0) / data.length
      : 0;

  const highPerformers = data.filter((t) => t.percentage >= 70).length;
  const bestPercentage =
    data.length > 0 ? Math.max(...data.map((t) => t.percentage)) : 0;

  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Analiza forme timova</h2>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FilterIcon className="h-4 w-4" />
            Konfiguriši analizu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Match Range Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Broj utakmica</label>
              <Select
                value={lastNMatches.toString()}
                onValueChange={(v) => onLastNMatchesChange(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {matchRangeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Criteria Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kriterijum</label>
              <Select
                value={selectedCriterion}
                onValueChange={onCriterionChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formCriteriaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Prikazuju se statistike za{" "}
              <span className="font-semibold text-foreground">
                {selectedCriteriaLabel}
              </span>{" "}
              u poslednjih{" "}
              <span className="font-semibold text-foreground">
                {lastNMatches}
              </span>{" "}
              utakmica svakog tima.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold">{totalCount}</div>
            <div className="text-xs text-muted-foreground">Timova</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div
              className={`text-lg sm:text-2xl font-bold ${getPercentageColor(
                avgPercentage
              )}`}
            >
              {avgPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Prosek</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {highPerformers}
            </div>
            <div className="text-xs text-muted-foreground">≥70%</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {bestPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Najbolji</div>
          </div>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Tim</TableHead>
                  <TableHead className="hidden sm:table-cell">Liga</TableHead>
                  <TableHead className="text-center">Broj</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">
                    Progress
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nema timova koji odgovaraju filterima
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((team, index) => {
                    const isTop3 = team.rank <= 3 && team.percentage >= 60;

                    return (
                      <TableRow
                        key={`${team.team}-${team.league}`}
                        className={
                          isTop3
                            ? "bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-500"
                            : ""
                        }
                      >
                        <TableCell>
                          <Badge variant={isTop3 ? "default" : "outline"}>
                            {team.rank}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div className="space-y-1">
                            <div className="text-sm font-medium truncate">
                              {team.team}
                            </div>
                            <div className="sm:hidden">
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                {team.league.length > 15
                                  ? team.league.substring(0, 15) + "..."
                                  : team.league}
                              </Badge>
                            </div>
                            <div className="sm:hidden">
                              <Progress
                                value={team.percentage}
                                className="h-1"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {team.league}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm font-medium">
                            {team.matches_hit}/{team.matches_total}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              team.percentage >= 70 ? "default" : "secondary"
                            }
                            className="font-bold"
                          >
                            {team.percentage.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Progress
                            value={team.percentage}
                            className="w-24 h-2"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
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
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
