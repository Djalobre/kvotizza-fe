"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Match, TopMatches } from "../types/bookies"

interface MatchCarouselProps {
  matches: TopMatches[]
  className?: string
}

interface MatchOutcome {
  type: string
  odd: number | null
  bookie: string | null
}
const navigateToMatch = (matchId: number) => {
    // For Next.js App Router
    if (typeof window !== "undefined") {
      window.location.href = `/match/${matchId}`
    }
  }
function best1X2ForMatch(match: TopMatches): MatchOutcome[] {
  const outcomes = ['Konačan ishod 1', 'Konačan ishod X', 'Konačan ishod 2'] as const
  return outcomes.map((t) => {
    const best = match.bets?.[t]?.bestOdds || 0;
    const bestBookie: string | null = match.bets?.[t]?.bestBookie || null;
    return { type: t, odd: best || null, bookie: bestBookie };
  });
}

export function MatchCarousel({ matches, className }: MatchCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(2) // Default to 2

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1) // mobile
      } else {
        setItemsPerView(2) // tablet and desktop
      }
    }

    // Set initial value
    updateItemsPerView()

    // Add resize listener
    window.addEventListener("resize", updateItemsPerView)

    // Cleanup
    return () => window.removeEventListener("resize", updateItemsPerView)
  }, [])

  // Calculate max index - this ensures we can always fill the view
  // For example: 5 matches, showing 2 at a time -> maxIndex = 3 (positions 0,1,2,3)
  // Position 3 would show matches 3,4
  const maxIndex = Math.max(0, matches.length - itemsPerView)
  const showNavigation = matches.length > itemsPerView

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
  }

  // Get visible matches, handling edge cases
  const getVisibleMatches = () => {
    const visible: TopMatches[] = []

    for (let i = 0; i < itemsPerView; i++) {
      const matchIndex = currentIndex + i
      if (matchIndex < matches.length) {
        visible.push(matches[matchIndex])
      }
    }

    return visible
  }

  const visibleMatches = getVisibleMatches()

  if (matches.length === 0) {
    return <div className={cn("text-center py-8 text-muted-foreground", className)}>Nema dostupnih mečeva</div>
  }

  return (
    <div className={cn("relative", className)}>
      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10 dark:bg-kvotizza-dark-bg-20  bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg",
                "left-1 md:left-0", // Closer to edge on mobile
                "h-8 w-8 md:h-10 md:w-10", // Smaller on mobile
              )}
            onClick={goToPrevious}
            aria-label="Prethodni meč"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
                "dark:bg-kvotizza-dark-bg-20  absolute top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg",
                "right-1 md:right-0", // Closer to edge on mobile
                "h-8 w-8 md:h-10 md:w-10", // Smaller on mobile
              )}
            onClick={goToNext}
            aria-label="Sledeći meč"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
        </>
      )}

      {/* Matches Container */}
      <div className="px-4 md:px-12">
        <div
          className={cn(
            "grid gap-3 md:gap-4 transition-all duration-300 ease-in-out",
            itemsPerView === 1 && "grid-cols-1",
            itemsPerView === 2 && "grid-cols-1 md:grid-cols-2",
          )}
        >
          {/* Always render slots for consistent layout */}
          {Array.from({ length: itemsPerView }).map((_, slotIndex) => {
            const match = visibleMatches[slotIndex]

            if (!match) {
              // Empty slot - render invisible placeholder to maintain grid
              return (
                <div key={`empty-${slotIndex}`} className="invisible">
                  <Card className="h-full dark:bg-kvotizza-dark-bg-20 ">
                  <CardContent className="p-3 md:p-4 ">
                  <div className="h-32"></div>
                    </CardContent>
                  </Card>
                </div>
              )
            }

            const outcomes = best1X2ForMatch(match)
            return (
              <Card key={`${match.id}-${currentIndex}-${slotIndex}`} className="hover:shadow-md transition-shadow dark:bg-kvotizza-dark-bg-20 ">
               <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm md:text-base leading-tight">{match.matchup}</p>
                      <p className="text-xs text-muted-foreground mt-1">{match.league}</p>
                    </div>
                    
                    <Button
                    variant="outline"
                    className="bg-transparent text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 shrink-0"
                    onClick={(e) => {
                        e.stopPropagation()
                        navigateToMatch(match.id)
                      }}                    >
                      Kvote
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {outcomes.map((outcome) => (
                      <div key={outcome.type} className="p-2 md:p-3 rounded-md bg-muted/30 rounded border text-center">
                        <p className="text-xs text-muted-foreground">{outcome.type}</p>
                        <p className="text-lg md:text-xl font-bold">{outcome.odd ? outcome.odd.toFixed(2) : "-"}</p>
                        <div className="flex items-center justify-center gap-1 md:gap-2 mt-1">
                          <img
                            src={outcome.bookie ? `/images/${outcome.bookie.toLowerCase()}.png` : '/images/default.png'}
                            className="h-4 w-4 md:h-5 md:w-5 rounded"
                            alt="Logo"
                          />
                          <span className="text-xs truncate">{outcome.bookie || "N/A"}</span>

                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Dots Indicator */}
      {showNavigation && (
        <div className="flex justify-center mt-4 md:mt-6 gap-1.5 md:gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "rounded-full transition-colors",
                "w-2 h-2 md:w-3 md:h-3", // Smaller dots on mobile
                index === currentIndex ? "bg-sport-blue-600" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Idi na poziciju ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Position indicator for better UX */}

    </div>
  )
}
