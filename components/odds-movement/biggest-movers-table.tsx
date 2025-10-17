"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { OddsChange } from "@/types/odds-movement";

interface BiggestMoversTableProps {
  data: OddsChange[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const safeFixed = (
  value: number | undefined | null,
  decimals: number = 2
): string => {
  if (value === undefined || value === null || isNaN(value)) return "0.00";
  return value.toFixed(decimals);
};

export function BiggestMoversTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: BiggestMoversTableProps) {
  // Stats summary
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const ups = data.filter((d) => d.trend === "up").length;
    const downs = data.filter((d) => d.trend === "down").length;
    const avgChange =
      data.reduce((sum, d) => sum + Math.abs(d.change_percent), 0) /
      data.length;
    const maxChange = Math.max(...data.map((d) => Math.abs(d.change_percent)));

    return { ups, downs, avgChange, maxChange };
  }, [data]);

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-3 ">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Card className="dark:bg-kvotizza-dark-bg-20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ukupno</p>
                  <p className="text-xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-kvotizza-dark-bg-20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Rast</p>
                  <p className="text-xl font-bold text-green-600">
                    {stats.ups}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-kvotizza-dark-bg-20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pad</p>
                  <p className="text-xl font-bold text-red-600">
                    {stats.downs}
                  </p>
                </div>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-kvotizza-dark-bg-20">
            <CardContent className="p-3">
              <div>
                <p className="text-xs text-muted-foreground">Max promena</p>
                <p className="text-xl font-bold">
                  {safeFixed(stats.maxChange, 1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card className="dark:bg-kvotizza-dark-bg-20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              Najveće promene kvota
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {startRecord}-{endRecord} od {totalCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Meč</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Liga
                  </TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Kladionica
                  </TableHead>
                  <TableHead className="text-xs text-right">Stara</TableHead>
                  <TableHead className="text-xs text-right">Nova</TableHead>
                  <TableHead className="text-xs text-right">Promena</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <p className="text-sm">
                        Nema podataka za izabrane filtere
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((change, idx) => (
                    <TableRow
                      key={`${change.match_id}-${change.bet_name}-${change.bookie}-${idx}`}
                    >
                      <TableCell className="text-xs">
                        <div className="font-medium">
                          {change.home_team || "N/A"} vs{" "}
                          {change.away_team || "N/A"}
                        </div>
                        <div className="text-[10px] text-muted-foreground sm:hidden">
                          {change.competition_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">
                        {change.competition_name}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{change.bet_category}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {change.bet_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden md:table-cell">
                        {change.bookie}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {safeFixed(change.opening_odd)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-medium">
                        {safeFixed(change.current_odd)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            change.trend === "up"
                              ? "default"
                              : change.trend === "down"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px] font-mono"
                        >
                          {change.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : change.trend === "down" ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : null}
                          {change.change_percent > 0 ? "+" : ""}
                          {safeFixed(change.change_percent, 1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-3">
              <div className="text-xs text-muted-foreground hidden sm:block">
                Strana {currentPage} od {totalPages}
              </div>

              <div className="flex items-center gap-1 mx-auto sm:mx-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground sm:hidden">
                {currentPage}/{totalPages}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
