"use client"

import type React from "react" // Explicitly import React
import type { BetTypeSelection } from "../types/bookies"

interface ClickableBetTypeProps {
  matchId: number
  matchup: string
  league: string
  category: string
  type: string
  displayOdds?: number // Just for display, not stored
  isBest?: boolean
  className?: string
  children?: React.ReactNode
}

export function ClickableBetType({
  matchId,
  matchup,
  league,
  category,
  type,
  displayOdds,
  isBest = false,
  className = "",
  children,
}: ClickableBetTypeProps) {
  const handleBetTypeClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row expansion when clicking bet type

    const betTypeSelection: BetTypeSelection = {
      matchId,
      matchup,
      league,
      category,
      type,
    }

  // Retrieve existing selections from localStorage
  const existingSelections: BetTypeSelection[] = JSON.parse(localStorage.getItem("betTypeSelections") || "[]")

  // Filter out any existing bet for the same matchId
  const updatedSelections = existingSelections.filter((selection) => selection.matchId !== matchId)

  // Add the new betTypeSelection for the matchup
  updatedSelections.push(betTypeSelection)

  // Update localStorage with the new selections
  localStorage.setItem("betTypeSelections", JSON.stringify(updatedSelections))

  // Dispatch custom event to notify sidebar
  window.dispatchEvent(new CustomEvent("betTypeSelectionsUpdated"))
    
  }

  return (
    <button
      onClick={handleBetTypeClick}
      className={`
            inline-block 
            w-12 h-6 text-sm        /* Mobile size */
            sm:w-20 sm:h-7 sm:text-base  /* Desktop size */
            rounded font-small 
            transition-all duration-200 
            hover:scale-105 hover:shadow-md 
            cursor-pointer
        ${
          isBest
            ? "bg-kvotizza-green-100 dark:bg-kvotizza-green-900/30 text-kvotizza-green-700 dark:text-kvotizza-green-300 font-bold hover:bg-kvotizza-green-200 dark:hover:bg-kvotizza-green-900/50"
            : "bg-kvotizza-blue-50 dark:bg-kvotizza-blue-900/20 text-kvotizza-blue-700 dark:text-kvotizza-blue-300 hover:bg-kvotizza-blue-100 dark:hover:bg-kvotizza-blue-900/40"
        }
        
        ${className}
      `}
      title={`Dodaj ${type} u svoj tiket`}
    >
      {children || (displayOdds ? displayOdds.toFixed(2) : type)}
    </button>
  )
}
