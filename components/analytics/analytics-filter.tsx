"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/lib/api-service";
import MultiSelectDropdown from "@/components/multi-select-dropdown";
import { LeagueOption } from "@/types/analytics";

interface AnalyticsFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  countries: string[];
  leagues: string[];
  dateRange: "today" | "tomorrow" | "next_3_days" | "all";
}

// Helper function to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AnalyticsFilter({ onFilterChange }: AnalyticsFilterProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [allLeagues, setAllLeagues] = useState<LeagueOption[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<
    "today" | "tomorrow" | "next_3_days" | "all"
  >("today");

  // Calculate date range based on selection
  const getDateRange = useCallback(() => {
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
  }, [dateRange]);

  // Fetch countries with date filter
  useEffect(() => {
    const { dateFrom, dateTo } = getDateRange();
    apiService
      .getCountries({ dateFrom, dateTo })
      .then(setCountries)
      .catch(console.error);
  }, [dateRange, getDateRange]);

  // Fetch leagues based on selected countries and date range
  useEffect(() => {
    const { dateFrom, dateTo } = getDateRange();

    if (selectedCountries.length > 0) {
      Promise.all(
        selectedCountries.map((country) =>
          apiService.getLeagues({ country, dateFrom, dateTo })
        )
      )
        .then((results) => {
          const uniqueLeagues = results
            .flat()
            .filter(
              (league, index, self) =>
                index ===
                self.findIndex((l) => l.tournament === league.tournament)
            );
          setAllLeagues(uniqueLeagues);
        })
        .catch(console.error);
    } else {
      apiService
        .getLeagues({ dateFrom, dateTo })
        .then(setAllLeagues)
        .catch(console.error);
    }
  }, [selectedCountries, dateRange, getDateRange]);

  // Clear selections and refetch when date range changes
  useEffect(() => {
    setSelectedCountries([]);
    setSelectedLeagues([]);
  }, [dateRange]);

  // Clear selected leagues when countries change
  useEffect(() => {
    setSelectedLeagues([]);
  }, [selectedCountries]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange({
      countries: selectedCountries,
      leagues: selectedLeagues,
      dateRange,
    });
  }, [selectedCountries, selectedLeagues, dateRange, onFilterChange]);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const handleLeagueToggle = (league: string) => {
    setSelectedLeagues((prev) =>
      prev.includes(league)
        ? prev.filter((l) => l !== league)
        : [...prev, league]
    );
  };

  const leagueNames = allLeagues.map((l) => l.tournament);

  return (
    <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Države:</span>
          <MultiSelectDropdown
            leagues={countries}
            selected={selectedCountries}
            onToggle={handleCountryToggle}
            onClear={() => setSelectedCountries([])}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lige:</span>
          <MultiSelectDropdown
            leagues={leagueNames}
            selected={selectedLeagues}
            onToggle={handleLeagueToggle}
            onClear={() => setSelectedLeagues([])}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[150px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Danas</SelectItem>
              <SelectItem value="tomorrow">Sutra</SelectItem>
              <SelectItem value="next_3_days">Naredna 3 dana</SelectItem>
              <SelectItem value="all">Svi mečevi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Države</span>
            <MultiSelectDropdown
              leagues={countries}
              selected={selectedCountries}
              onToggle={handleCountryToggle}
              onClear={() => setSelectedCountries([])}
              compact
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Lige</span>
            <MultiSelectDropdown
              leagues={leagueNames}
              selected={selectedLeagues}
              onToggle={handleLeagueToggle}
              onClear={() => setSelectedLeagues([])}
              compact
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Period</span>
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Danas</SelectItem>
              <SelectItem value="tomorrow">Sutra</SelectItem>
              <SelectItem value="next_3_days">Naredna 3 dana</SelectItem>
              <SelectItem value="all">Svi mečevi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
