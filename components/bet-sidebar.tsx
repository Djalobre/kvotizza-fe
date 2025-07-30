"use client"

import { useState, useEffect } from "react"
import { X, Calculator, Trash2, BarChart3, ChevronLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { BetTypeSelection } from "../types/bookies"

interface BetSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onAnalyzeBet: (selections: BetTypeSelection[]) => void
}

export function BetSidebar({ isOpen, onToggle, onAnalyzeBet }: BetSidebarProps) {
  const [selections, setSelections] = useState<BetTypeSelection[]>([])
  const [stake, setStake] = useState<number>(10)
  const [highlight, setHighlight] = useState(false)


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
      onAnalyzeBet(selections)
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-background border-l shadow-lg z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          ${isOpen ? "w-full md:w-96" : "w-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-kvotizza-blue-500" />
              <h2 className="text-lg font-semibold">Bet Builder</h2>
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
                <h3 className="text-lg font-semibold mb-2">No bet types selected</h3>
                <p className="text-sm text-muted-foreground">Click on any bet type to add it to your selections</p>
              </div>
            ) : (
              <>
                {/* Selections List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Your Bet Type Selections</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllSelections}
                      className="text-kvotizza-red-500 hover:text-kvotizza-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {selections.map((selection, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{selection.matchup}</p>
                            <p className="text-xs text-muted-foreground truncate">{selection.league}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {selection.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
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
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Stake Input */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Analysis Settings</h3>
                  <div>
                    <label className="text-sm font-medium">Stake for Analysis</label>
                    <Input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleAnalyzeBet}
                    variant="outline"
                    className="w-full flex items-center gap-2 bg-transparent text-kvotizza-blue-700 hover:bg-kvotizza-blue-50"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analyze Bet Across All Bookies
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Analysis will show odds for these bet types across all bookmakers
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
          className="fixed top-4 right-4 z-40 shadow-lg bg-kvotizza-green-500 hover:bg-kvotizza-green-600 text-white"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Bet Types
          {selections.length > 0 && (
            
            <Badge 
            variant="secondary"
            className={`ml-2 transition-colors duration-100 ${
              highlight ? "bg-yellow-200 text-black" : ""
            }`}>
              {selections.length}
            </Badge>
          )}
        </Button>
      )}
    </>
  )
}
