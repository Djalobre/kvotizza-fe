"use client";

import { useState, useEffect } from "react";
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

export function AnalyticsFilter({ onFilterChange }: AnalyticsFilterProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [allLeagues, setAllLeagues] = useState<LeagueOption[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<
    "today" | "tomorrow" | "next_3_days" | "all"
  >("today");

  useEffect(() => {
    apiService.getCountries().then(setCountries).catch(console.error);
  }, []);

  useEffect(() => {
    apiService.getLeagues().then(setAllLeagues).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCountries.length > 0) {
      Promise.all(
        selectedCountries.map((country) => apiService.getLeagues(country))
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
      apiService.getLeagues().then(setAllLeagues).catch(console.error);
    }
    setSelectedLeagues([]);
  }, [selectedCountries]);

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
