'use client'

import { ChevronLeft, Home, ChevronRight, Menu } from 'lucide-react'
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
    <div className="bg-slate-800 text-white sticky top-0 z-50 bg-background/60 dark:bg-kvotizza-dark-bg-10 border-b border-black/10 dark:border-white/10">
      {/* Main Header */}
      <header className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo with back button */}
          <div className="flex items-center gap-3">
            {/* Back button - visible on desktop */}
            <button
              onClick={onBackToHome}
              className="hidden md:flex items-center justify-center p-2 rounded-lg 
                         bg-kvotizza-green-500 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors group hover:bg-kvotizza-green-600"
              title="Nazad na početnu"
            >
              <ChevronLeft className="h-5 w-5 text-white dark:text-sport-green-500 dark:group-hover:text-sport-green-400" />
            </button>

            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <Image
                src="/images/kvotizza-logo.png"
                alt="Kvotizza Logo"
                width={200}
                height={200}
                className="block dark:hidden h-20 w-auto"
              />
              <Image
                src="/images/kvotizza-logo-white.png"
                alt="Kvotizza Logo"
                width={200}
                height={200}
                className="h-20 w-auto hidden dark:block"
              />
              <div>
                <h1 className="text-xl text-kvotizza-green-500 dark:text-white font-bold">
                  Uporedi kvote
                </h1>
                <p className="text-sm text-kvotizza-green-500 dark:text-sport-green-500">
                  Pronađi najbolju ponudu
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Breadcrumb - only visible on mobile */}
      <div className="md:hidden px-4 py-2 border-t border-slate-700">
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1 text-sport-green-500 hover:text-sport-green-400 
                       transition-colors py-1 px-2 rounded hover:bg-slate-700"
          >
            <Home className="h-4 w-4" />
            <span>Početna</span>
          </button>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="text-slate-300">Kvote</span>
        </nav>
      </div>
    </div>
  )
}
