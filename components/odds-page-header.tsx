'use client'

import { ChevronLeft, Home, ChevronRight, Menu, HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image' // Ensure Image is imported from next/image

// Navigation helper function
const navigateToHome = () => {
  // For Next.js App Router
  if (typeof window !== 'undefined') {
    window.location.href = `/`
  }
}

interface OddsPageHeaderProps {
  ticketCount?: number
  onBackToHome?: () => void
  onTicketClick?: () => void
}

export function OddsPageHeader({
  ticketCount = 1,
  onBackToHome = () => (window.location.href = '/'),
}: OddsPageHeaderProps) {
  return (
    <div className="text-white sticky top-0 z-50 bg-background/60 dark:bg-kvotizza-dark-bg-10 border-b border-black/10 dark:border-white/10 h-16">
      {/* Main Header */}
      <header className="px-4  h-16">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo with back button */}
          <div className="flex items-center gap-3 h-16">
            {/* Back button - visible on desktop */}
            <button
              onClick={onBackToHome}
              className="hidden md:flex items-center justify-center p-2 rounded-lg 
                         bg-kvotizza-green-500 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors group hover:bg-kvotizza-green-600"
              title="Nazad na početnu"
            >
              <ChevronLeft className="h-4 w-4 text-white dark:text-sport-green-500 dark:group-hover:text-sport-green-400" />
            </button>

            {/* Logo and title */}
            <HomeIcon onClick={onBackToHome} className="md:hidden h-4 w-4 text-slate-400" />
            <div className="flex items-center gap-3">
              <Image
                src="/images/kvotizza-logo.png"
                alt="Kvotizza Logo"
                width={150}
                height={150}
                className="block dark:hidden h-16 w-auto"
                onClick={onBackToHome}
              />
              <Image
                src="/images/kvotizza-logo-white.png"
                alt="Kvotizza Logo"
                width={150}
                height={150}
                className="h-16 w-auto hidden dark:block"
                onClick={onBackToHome}
              />
              <div>
                <h1 className="text-xl text-kvotizza-green-500 dark:text-white font-bold">
                  Kvotizza
                </h1>
                <p className="text-xs text-muted-foreground">Pronađi najbolje kvote</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Breadcrumb - only visible on mobile */}
    </div>
  )
}
