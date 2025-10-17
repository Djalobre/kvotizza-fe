"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import type { OddsMovementFilter } from "@/types/odds-movement";
import { apiService } from "@/lib/api-service";
import { cn } from "@/lib/utils";

interface OddsMovementFiltersProps {
  filters: OddsMovementFilter;
  onFiltersChange: (filters: OddsMovementFilter) => void;
  activeTab?: string;
}
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function OddsMovementFilters({
  filters,
  onFiltersChange,
  activeTab,
}: OddsMovementFiltersProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [betCategories, setBetCategories] = useState<string[]>([]);
  const [bookies, setBookies] = useState<string[]>([]);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingBetCategories, setLoadingBetCategories] = useState(false);
  const [loadingBookies, setLoadingBookies] = useState(false);

  // Popover states
  const [countryOpen, setCountryOpen] = useState(false);
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [betTypeOpen, setBetTypeOpen] = useState(false);
  const [bookieOpen, setBookieOpen] = useState(false);

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

  // Fetch countries when date changes
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const { dateFrom, dateTo } = getDateParams(filters.dateRange);
        const data = await apiService.getOddsCountries({ dateFrom, dateTo });
        setCountries(data || []);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [filters.dateRange]);

  // Fetch leagues when countries change
  useEffect(() => {
    if (filters.countries.length === 0) {
      setLeagues([]);
      return;
    }

    const fetchLeagues = async () => {
      setLoadingLeagues(true);
      try {
        const { dateFrom, dateTo } = getDateParams(filters.dateRange);
        const data = await apiService.getOddsLeagues({
          countries: filters.countries,
          dateFrom,
          dateTo,
        });

        setLeagues(data.leagues?.map((l: any) => l.league) || []);
      } catch (error) {
        console.error("Error fetching leagues:", error);
        setLeagues([]);
      } finally {
        setLoadingLeagues(false);
      }
    };

    fetchLeagues();
  }, [filters.countries, filters.dateRange]);

  // Fetch bet categories and bookies when leagues change
  useEffect(() => {
    if (filters.leagues.length === 0) {
      setBetCategories([]);
      setBookies([]);
      return;
    }

    const fetchData = async () => {
      setLoadingBetCategories(true);
      setLoadingBookies(true);
      try {
        const { dateFrom, dateTo } = getDateParams(filters.dateRange);

        const [betCats, bookieData] = await Promise.all([
          apiService.getOddsBetCategories({
            countries: filters.countries,
            leagues: filters.leagues,
            dateFrom,
            dateTo,
          }),
          apiService.getOddsBookies({
            countries: filters.countries,
            leagues: filters.leagues,
            dateFrom,
            dateTo,
          }),
        ]);

        setBetCategories(betCats || []);
        setBookies(bookieData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setBetCategories([]);
        setBookies([]);
      } finally {
        setLoadingBetCategories(false);
        setLoadingBookies(false);
      }
    };

    fetchData();
  }, [filters.leagues, filters.dateRange, filters.countries]);

  const toggleFilter = (type: keyof OddsMovementFilter, value: string) => {
    const currentValues = filters[type] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const newFilters = {
      ...filters,
      [type]: newValues,
    };

    // Cascade reset
    if (type === "countries") {
      newFilters.leagues = [];
      newFilters.betCategories = [];
      newFilters.bookies = [];
    } else if (type === "leagues") {
      newFilters.betCategories = [];
      newFilters.bookies = [];
    }

    onFiltersChange(newFilters);
  };

  return (
    <div className="rounded-lg bg-background border-b sticky top-0 z-10 shadow-sm dark:bg-kvotizza-dark-bg-20">
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
        {/* Date Range */}
        <Select
          value={filters.dateRange}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              dateRange: value as OddsMovementFilter["dateRange"],
            })
          }
        >
          <SelectTrigger className="w-[120px] h-9 text-xs dark:bg-kvotizza-dark-bg-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-kvotizza-dark-bg-10">
            <SelectItem value="today">Danas</SelectItem>
            <SelectItem value="tomorrow">Sutra</SelectItem>
            <SelectItem value="week">7 dana</SelectItem>
            <SelectItem value="all">Sve</SelectItem>
          </SelectContent>
        </Select>

        {/* Countries */}
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1 text-xs dark:bg-kvotizza-dark-bg-10",
                filters.countries.length > 0 && "border-primary"
              )}
              disabled={loadingCountries}
            >
              <Filter className="h-3 w-3" />
              Države
              {filters.countries.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {filters.countries.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-2 dark:bg-kvotizza-dark-bg-10"
            align="start"
          >
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {loadingCountries ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Učitavanje...
                </div>
              ) : countries.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Nema dostupnih država
                </div>
              ) : (
                countries.map((country) => (
                  <div
                    key={country}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer dark:bg-kvotizza-dark-bg-10"
                    onClick={() => toggleFilter("countries", country)}
                  >
                    <Checkbox
                      checked={filters.countries.includes(country)}
                      onCheckedChange={() => toggleFilter("countries", country)}
                    />
                    <label className="text-xs cursor-pointer flex-1">
                      {country}
                    </label>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Leagues */}
        <Popover open={leagueOpen} onOpenChange={setLeagueOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1 text-xs dark:bg-kvotizza-dark-bg-10",
                filters.leagues.length > 0 && "border-primary"
              )}
              disabled={loadingLeagues || filters.countries.length === 0}
            >
              <Filter className="h-3 w-3" />
              Lige
              {filters.leagues.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px] ">
                  {filters.leagues.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-2 dark:bg-kvotizza-dark-bg-10"
            align="start"
          >
            <div className="space-y-1 max-h-64 overflow-y-auto ">
              {loadingLeagues ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Učitavanje...
                </div>
              ) : leagues.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  {filters.countries.length === 0
                    ? "Prvo izaberite državu"
                    : "Nema dostupnih liga"}
                </div>
              ) : (
                leagues.map((league) => (
                  <div
                    key={league}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer dark:bg-kvotizza-dark-bg-10"
                    onClick={() => toggleFilter("leagues", league)}
                  >
                    <Checkbox
                      checked={filters.leagues.includes(league)}
                      onCheckedChange={() => toggleFilter("leagues", league)}
                    />
                    <label className="text-xs cursor-pointer flex-1">
                      {league}
                    </label>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Bet Types */}
        <Popover open={betTypeOpen} onOpenChange={setBetTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1 text-xs dark:bg-kvotizza-dark-bg-10",
                filters.betCategories.length > 0 && "border-primary"
              )}
              disabled={loadingBetCategories || filters.leagues.length === 0}
            >
              <Filter className="h-3 w-3" />
              Tipovi
              {filters.betCategories.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {filters.betCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-2 dark:bg-kvotizza-dark-bg-10"
            align="start"
          >
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {loadingBetCategories ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Učitavanje...
                </div>
              ) : betCategories.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  {filters.leagues.length === 0
                    ? "Prvo izaberite ligu"
                    : "Nema dostupnih tipova"}
                </div>
              ) : (
                betCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    onClick={() => toggleFilter("betCategories", category)}
                  >
                    <Checkbox
                      checked={filters.betCategories.includes(category)}
                      onCheckedChange={() =>
                        toggleFilter("betCategories", category)
                      }
                    />
                    <label className="text-xs cursor-pointer flex-1">
                      {category}
                    </label>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Bookies */}
        <Popover open={bookieOpen} onOpenChange={setBookieOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1 text-xs dark:bg-kvotizza-dark-bg-10",
                filters.bookies.length > 0 && "border-primary"
              )}
              disabled={loadingBookies || filters.leagues.length === 0}
            >
              <Filter className="h-3 w-3" />
              Kladionice
              {filters.bookies.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {filters.bookies.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-2 dark:bg-kvotizza-dark-bg-10"
            align="start"
          >
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {loadingBookies ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Učitavanje...
                </div>
              ) : bookies.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  {filters.leagues.length === 0
                    ? "Prvo izaberite ligu"
                    : "Nema dostupnih kladionica"}
                </div>
              ) : (
                bookies.map((bookie) => (
                  <div
                    key={bookie}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    onClick={() => toggleFilter("bookies", bookie)}
                  >
                    <Checkbox
                      checked={filters.bookies.includes(bookie)}
                      onCheckedChange={() => toggleFilter("bookies", bookie)}
                    />
                    <label className="text-xs cursor-pointer flex-1">
                      {bookie}
                    </label>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Min Change & Max Odd */}
        {/* Min Change & Max Odd */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Min Change */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Min promena:
            </span>
            <Select
              value={filters.minChange.toString()}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  minChange: Number.parseInt(value),
                })
              }
            >
              <SelectTrigger className="w-[80px] h-9 text-xs dark:bg-kvotizza-dark-bg-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-kvotizza-dark-bg-10">
                <SelectItem value="1">1%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Current Odd - ONLY SHOW ON MOVERS TAB */}
          {activeTab === "movers" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Max kvota:
              </span>
              <Select
                value={filters.maxCurrentOdd?.toString() || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    maxCurrentOdd:
                      value === "all" ? undefined : Number.parseFloat(value),
                  })
                }
              >
                <SelectTrigger className="w-[80px] h-9 text-xs dark:bg-kvotizza-dark-bg-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-kvotizza-dark-bg-10">
                  <SelectItem value="all">Sve</SelectItem>
                  <SelectItem value="2">2.0</SelectItem>
                  <SelectItem value="3">3.0</SelectItem>
                  <SelectItem value="5">5.0</SelectItem>
                  <SelectItem value="10">10.0</SelectItem>
                  <SelectItem value="20">20.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
