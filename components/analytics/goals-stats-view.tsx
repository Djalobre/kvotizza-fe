// src/components/analytics/goals-stats-view.tsx
"use client";

import React, { useMemo, useState } from "react";
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
  ArrowUpDownIcon,
  TargetIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { TeamStatistic } from "@/types/analytics";

// Select components (adjust import path if your UI lib differs)
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface GoalStatsViewProps {
  data: TeamStatistic[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

type SortField =
  | "team"
  | "over_2_5_ft"
  | "btts_ft"
  | "over_1_5_fh"
  | "clean_sheets";

export default function GoalStatsView({
  data,
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: GoalStatsViewProps) {
  const [sortField, setSortField] = useState<SortField>("over_2_5_ft");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortField === "team") {
        aValue = a.team;
        bValue = b.team;
      } else {
        aValue = a[sortField].percentage;
        bValue = b[sortField].percentage;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "desc"
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      return sortOrder === "desc"
        ? (bValue as number) - (aValue as number)
        : (aValue as number) - (bValue as number);
    });
  }, [data, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const avgPercentage = (
    field: keyof Pick<
      TeamStatistic,
      "over_2_5_ft" | "btts_ft" | "over_1_5_fh" | "clean_sheets"
    >
  ) => {
    if (data.length === 0) return 0;
    return (
      data.reduce((sum, team) => sum + team[field].percentage, 0) / data.length
    ).toFixed(0);
  };

  // pagination helpers
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Ukupno timova</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {avgPercentage("over_2_5_ft")}%
            </div>
            <p className="text-xs text-muted-foreground">Prosek 3+ mečeva</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {avgPercentage("btts_ft")}%
            </div>
            <p className="text-xs text-muted-foreground">Prosek GG mečeva</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {avgPercentage("clean_sheets")}%
            </div>
            <p className="text-xs text-muted-foreground">
              Prosek mečeva bez primljenog gola
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Statistike timova koji igraju na izabrani datum
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32 sm:w-48 p-2 sm:p-2">
                    <Button
                      variant="ghost"
                      className="h-6 sm:h-8 p-0 font-semibold text-xs sm:text-sm"
                      onClick={() => handleSort("team")}
                    >
                      Tim
                      {sortField === "team" && (
                        <ArrowUpDownIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-center w-20 p-2 sm:p-2 text-xs sm:text-sm">
                    Liga
                  </TableHead>
                  <TableHead className="text-center w-12 sm:w-16 p-1 sm:p-2 text-xs sm:text-sm">
                    M
                  </TableHead>
                  <TableHead className="text-center w-16 sm:w-24 p-1 sm:p-4">
                    <Button
                      variant="ghost"
                      className="h-6 sm:h-8 p-0 font-semibold text-xs sm:text-sm"
                      onClick={() => handleSort("over_2_5_ft")}
                    >
                      3+
                      {sortField === "over_2_5_ft" && (
                        <ArrowUpDownIcon className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center w-16 sm:w-24 p-1 sm:p-2">
                    <Button
                      variant="ghost"
                      className="h-6 sm:h-8 p-0 font-semibold text-xs sm:text-sm"
                      onClick={() => handleSort("btts_ft")}
                    >
                      GG
                      {sortField === "btts_ft" && (
                        <ArrowUpDownIcon className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-center w-24 p-2">
                    <Button
                      variant="ghost"
                      className="h-8 p-0 font-semibold text-sm"
                      onClick={() => handleSort("over_1_5_fh")}
                    >
                      2+ PP
                      {sortField === "over_1_5_fh" && (
                        <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-center w-24 p-2">
                    <Button
                      variant="ghost"
                      className="h-8 p-0 font-semibold text-sm"
                      onClick={() => handleSort("clean_sheets")}
                    >
                      CS
                      {sortField === "clean_sheets" && (
                        <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((team, index) => {
                  const isTop3 = index < 3;

                  return (
                    <TableRow
                      key={`${team.team}-${team.league}`}
                      className={
                        isTop3
                          ? "bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-500"
                          : ""
                      }
                    >
                      <TableCell className="p-2 sm:p-2">
                        <div className="space-y-1">
                          <div className="font-semibold text-xs sm:text-sm truncate">
                            {team.team}
                          </div>
                          <div className="sm:hidden">
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {team.league.length > 20
                                ? team.league.substring(0, 20) + "..."
                                : team.league}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center p-2">
                        <Badge variant="outline" className="text-xs">
                          {team.league.length > 20
                            ? team.league.substring(0, 20) + "..."
                            : team.league}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium p-1 sm:p-2 text-xs sm:text-sm">
                        {team.total_matches}
                      </TableCell>
                      <TableCell className="text-center p-1 sm:p-2">
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm font-medium">
                            <span className="sm:hidden">
                              {team.over_2_5_ft.percentage.toFixed(1)}%
                            </span>
                            <span className="hidden sm:inline">
                              {team.over_2_5_ft.count}/{team.over_2_5_ft.total}
                            </span>
                          </div>
                          <div className="hidden sm:block text-xs text-muted-foreground">
                            {team.over_2_5_ft.percentage.toFixed(1)}%
                          </div>
                          <Progress
                            value={team.over_2_5_ft.percentage}
                            className="hidden sm:block w-16 h-2 mx-auto"
                          />
                        </div>
                      </TableCell>

                      <TableCell className="text-center p-1 sm:p-2">
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm font-medium">
                            <span className="sm:hidden">
                              {team.btts_ft.percentage.toFixed(1)}%
                            </span>
                            <span className="hidden sm:inline">
                              {team.btts_ft.count}/{team.btts_ft.total}
                            </span>
                          </div>
                          <div className="hidden sm:block text-xs text-muted-foreground">
                            {team.btts_ft.percentage.toFixed(1)}%
                          </div>
                          <Progress
                            value={team.btts_ft.percentage}
                            className="hidden sm:block w-16 h-2 mx-auto"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center p-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {team.over_1_5_fh.count}/{team.over_1_5_fh.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.over_1_5_fh.percentage.toFixed(1)}%
                          </div>
                          <Progress
                            value={team.over_1_5_fh.percentage}
                            className="hidden sm:block w-16 h-2 mx-auto"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center p-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {team.clean_sheets.count}/{team.clean_sheets.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.clean_sheets.percentage.toFixed(1)}%
                          </div>
                          <Progress
                            value={team.clean_sheets.percentage}
                            className="hidden sm:block w-16 h-2 mx-auto"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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
