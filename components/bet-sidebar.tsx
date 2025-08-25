"use client"

import { useState, useEffect } from "react"
import { X, Calculator, Trash2, BarChart3, ChevronLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { BetTypeSelection } from "../types/bookies"
import React from "react"

interface BetSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onAnalyzeBet: (selections: BetTypeSelection[], stake: number) => void
  page: string
}

export function BetSidebar({ isOpen, onToggle, onAnalyzeBet, page }: BetSidebarProps) {
  const [selections, setSelections] = useState<BetTypeSelection[]>([])
  const [highlight, setHighlight] = useState(false)
  const [stakeInput, setStakeInput] = useState<string>(""); // what user types
  const stake = React.useMemo(() => {
    // convert to number when you need it
    const s = stakeInput.replace(",", ".").trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }, [stakeInput]);

  function handleStakeChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only digits, one dot/comma, and empty string
    const v = e.target.value;
    const sanitized = v
      .replace(/[^\d.,]/g, "")        // keep digits and separators
      .replace(/[,]/g, ".")           // normalize comma to dot
      .replace(/(\..*)\./g, "$1");    // only one dot
    setStakeInput(sanitized);
  }
  
  function handleStakeBlur() {
    // Normalize on blur: clamp >= 0, remove leading zeros, or keep empty
    if (stakeInput === "" || stakeInput === ".") {
      setStakeInput(""); // allow empty
      return;
    }
    const n = Math.max(0, Number(stakeInput));
    // Format how you like: integer or fixed decimals
    // For integer:
    setStakeInput(String(n).replace(/^0+(?=\d)/, "")); // drop leading zeros
    // For 2 decimals instead, use: setStakeInput(n.toFixed(2));
  }
  const className =
    page === 'main'
      ? 'fixed z-[100] dark:bg-kvotizza-green-500 dark:text-white shadow-lg bg-kvotizza-green-500 hover:bg-kvotizza-green-600 backdrop-blur-none top-5 right-0 sm:top-6 sm:right-0 md:top-6 md:right-0'
      : 'dark:bg-kvotizza-green-500 dark:text-white fixed z-[100] shadow-lg bg-white hover:bg-muted text-kvotizza-500 backdrop-blur-none top-5 right-0 sm:top-6 sm:right-0 md:top-6 md:right-0'

  useEffect(() => {
    // Load selections from localStorage
    const savedSelections = JSON.parse(localStorage.getItem("betTypeSelections") || "[]")
    setSelections(savedSelections)
  }, [])

  useEffect(() => {
    // Highlight badge when selections are updated
    setHighlight(true)
    const timeout = setTimeout(() => setHighlight(false), 1000) // Remove highlight after 1 second
    return () => clearTimeout(timeout)
  }, [selections])


  useEffect(() => {
    // Listen for storage changes to update selections in real-time
    const handleStorageChange = () => {
      const savedSelections = JSON.parse(localStorage.getItem("betTypeSelections") || "[]")
      setSelections(savedSelections)
    }

    window.addEventListener("storage", handleStorageChange)
    // Also listen for custom event when selections are updated
    window.addEventListener("betTypeSelectionsUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("betTypeSelectionsUpdated", handleStorageChange)
    }
  }, [])

  const removeSelection = (index: number) => {
    const updatedSelections = selections.filter((_, i) => i !== index)
    setSelections(updatedSelections)
    localStorage.setItem("betTypeSelections", JSON.stringify(updatedSelections))
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("betTypeSelectionsUpdated"))
  }

  const clearAllSelections = () => {
    setSelections([])
    localStorage.removeItem("betTypeSelections")
    window.dispatchEvent(new CustomEvent("betTypeSelectionsUpdated"))
  }

  const handleAnalyzeBet = () => {
    if (selections.length > 0) {
      onAnalyzeBet(selections, stake)
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-background border-l shadow-lg z-50 transition-transform duration-300 ease-in-out dark:bg-kvotizza-dark-bg-20 dark:border dark:border-white/30
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          ${isOpen ? "w-full md:w-96" : "w-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-kvotizza-blue-500" />
              <h2 className="text-lg font-semibold">Tiket</h2>
              {selections.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selections.length}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selections.length === 0 ? (
              /* Empty State */
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nema izabranih mečeva</h3>
                <p className="text-sm text-muted-foreground">Klikni na znak plus pored tipa da ga dodaš u izbor</p>
              </div>
            ) : (
              <>
                {/* Selections List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Tvoj tiket</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllSelections}
                      className="text-kvotizza-red-500 hover:text-kvotizza-red-700"
                    >
                      <Trash2 className="h-4 w-4 dark:text-kvotizza-dark-theme-red-10" />
                    </Button>
                  </div>

                  {selections.map((selection, index) => (
                    <Card key={index} className="p-3 dark:bg-kvotizza-dark-bg-10 dark:border dark:border-white/30">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{selection.matchup}</p>
                            <p className="text-xs text-muted-foreground truncate">{selection.league}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs dark:bg-kvotizza-dark-bg-20">
                                {selection.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs dark:bg-kvotizza-dark-bg-20">
                                {selection.type}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelection(index)}
                            className="text-kvotizza-red-500 hover:text-kvotizza-red-700 ml-2"
                          >
                            <X className="h-3 w-3 dark:text-kvotizza-dark-theme-red-10" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Stake Input */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Podešavanje uloga</h3>
                  <div>
                    <label className="text-sm font-medium">Ulog</label>
                    <Input
                      type="text"                 // use text to avoid browser forcing formats
                      inputMode="decimal"         // mobile numeric keypad
                      pattern="[0-9]*[.,]?[0-9]*" // soft validation
                      placeholder="Unesite ulog"
                      value={stakeInput}
                      onChange={handleStakeChange}
                      onBlur={handleStakeBlur}
                      className="mt-1 bg-white dark:bg-kvotizza-dark-bg-10 dark:border dark:border-white/30"
                      // Optional: stop scroll wheel changing value on desktop mice
                      onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                      // Optional: block e/E/+/- which some browsers allow in number fields
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                      }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                <Button
                  onClick={handleAnalyzeBet}
                  disabled={!stake || stake <= 0} // stake is 0 or empty
                  variant="outline"
                  className={`
                    w-full flex items-center gap-2
                    dark:border dark:border-white/30 dark:bg-kvotizza-dark-bg-10 bg-white
                    text-kvotizza-blue-700 dark:hover:bg-black/20 hover:bg-kvotizza-blue-50
                    dark:hover:text-dark-theme-kvotizza-blue-10 dark:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <BarChart3 className="h-4 w-4 dark:text-kvotizza-dark-theme-blue-10" />
                  Analiza mečeva
                </Button>

                <p className="text-xs text-muted-foreground text-center dark:text-kvotizza-dark-theme-blue-10">
                  Analiza prikazuje kvote za izabrane tipove u svim kladionicama
                </p>
              </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button when sidebar is closed */}
      {!isOpen && (
  <Button
    onClick={onToggle}
    className={`${className}`}
    size="sm"
  >
    <ChevronLeft className="h-4 w-4 mr-1" />
    <span className="hidden sm:inline">Tiket</span> {/* hide label on very small screens */}
    {selections.length > 0 && (
      <Badge 
        variant="secondary"
        className={`ml-2 bg-white border-l border-black/30 dark:text-black transition-colors duration-100 px-1.5 py-0.5 text-xs ${highlight ? "bg-yellow-400 dark:text-black/70 text-black/70" : ""}`}
      >
        {selections.length}
      </Badge>
    )}
  </Button>
      )}
    </>
  )
}
