'use client'

import { useState } from 'react'
import { Moon, Sun, Menu, X, Trophy, BarChart3, Newspaper, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image' // Ensure Image is imported from next/image

interface LandingNavbarProps {
  isDark?: boolean
  onThemeToggle?: () => void
}

export function LandingNavbar({ isDark = false, onThemeToggle }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Kvote', href: '/kvote', icon: Trophy },
    // { label: 'Analize', href: '/analize', icon: BarChart3 },
    // { label: 'Blog', href: '/blog', icon: Newspaper },
    { label: 'Kontakt', href: '/kontakt', icon: HelpCircle },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b dark:bg-kvotizza-dark-bg-10 dark:border-white/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/kvotizza-logo.png"
              alt="Kvotizza Logo"
              width={150}
              height={150}
              className="block dark:hidden h-16 w-auto"
            />
            <Image
              src="/images/kvotizza-logo-white.png"
              alt="Kvotizza Logo"
              width={150}
              height={150}
              className="h-16 w-auto hidden dark:block"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-kvotizza-green-500">Kvotizza</h1>
              <p className="text-xs text-muted-foreground">Pametno poređenje kvota</p>
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-self-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            ))}
          </div>
          {/* Right Side Actions */}
          <div className="flex  gap-3 justify-self-end">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="h-9 w-9 p-0"
              title={isDark ? 'Prebaci na svetlu temu' : 'Prebaci na tamnu temu'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-sm">
            <div className="py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              ))}
              <div className="px-4 pt-2">
                <Button
                  size="sm"
                  className="w-full bg-sport-green-500 hover:bg-sport-green-600 text-black font-medium"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    alert('Navigacija na kvote stranicu')
                  }}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Pogledaj sve kvote
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
