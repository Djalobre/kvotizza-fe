'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TipSubmissionForm } from '@/components/tip-submission-form'
import { TipsFeed } from '@/components/tips-feed'
import { Leaderboard } from '@/components/leaderboard'
import { CompetitionInfo } from '@/components/competition-info'
import { UserStats } from '@/components/user-stats'
import { Trophy, Target, TrendingUp, Users, Calendar, Award, Bell, Search } from 'lucide-react'
import RequireAuth from '@/components/auth/require-auth'
import { LandingNavbar } from '@/components/landing-navbar'

export default function TipovanjePage() {
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState('submit')
  const handleThemeToggle = () => {
    setIsDark(!isDark)
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])
  return (
    <div className="min-h-screen bg-background dark:bg-kvotizza-dark-bg-10">
      <LandingNavbar isDark={isDark} onThemeToggle={handleThemeToggle} />

      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Desktop Competition Info */}

        <CompetitionInfo />

        {/* Mobile-Optimized Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 md:mt-8">
          {/* Mobile Tab Navigation */}
          <div className="md:hidden">
            <TabsList className="grid w-full grid-cols-2 mb-4 dark:bg-white">
              <TabsTrigger
                value="submit"
                className="flex items-center gap-1 text-xs data-[state=active]:dark:bg-kvotizza-dark-bg-10"
              >
                <Target className="h-3 w-3" />
                Dodaj Tip
              </TabsTrigger>
              <TabsTrigger value="feed" className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                Tipovi
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="leaderboard" className="flex items-center gap-1 text-xs">
                <Trophy className="h-3 w-3" />
                Rang Lista
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                Statistike
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-4 dark:bg-kvotizza-dark-bg-20 ">
              <TabsTrigger
                value="submit"
                className="flex items-center gap-2 data-[state=active]:dark:bg-kvotizza-dark-bg-10 data-[state=active]:dark:border  dark:border-white/30"
              >
                <Target className="h-4 w-4" />
                Dodaj Tip
              </TabsTrigger>
              <TabsTrigger
                value="feed"
                className="flex items-center gap-2 data-[state=active]:dark:bg-kvotizza-dark-bg-10 data-[state=active]:dark:border  dark:border-white/30"
              >
                <TrendingUp className="h-4 w-4" />
                Svi Tipovi
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="flex items-center gap-2 data-[state=active]:dark:bg-kvotizza-dark-bg-10 data-[state=active]:dark:border dark:border-white/30"
              >
                <Trophy className="h-4 w-4" />
                Rang Lista
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="flex items-center gap-2 data-[state=active]:dark:bg-kvotizza-dark-bg-10 data-[state=active]:dark:border dark:border-white/30"
              >
                <Users className="h-4 w-4" />
                Moje Statistike
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="submit" className="mt-6 ">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
              <div className="lg:col-span-2">
                <RequireAuth>
                  <TipSubmissionForm />
                </RequireAuth>
              </div>
              <div className="hidden lg:block">
                <Card className="dark:bg-kvotizza-dark-bg-20">
                  <CardHeader>
                    <CardTitle className="text-lg">Kako funkcioniše?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm ">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium">Dodaj svoj tip</p>
                        <p className="text-muted-foreground">Izaberi meč, tip i kvotu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium">Objasni svoju analizu</p>
                        <p className="text-muted-foreground">Dodaj razlog zašto veruješ u tip</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium">Osvoji poene</p>
                        <p className="text-muted-foreground">
                          Tačni tipovi donose poene na osnovu kvote
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium">Pobedi u takmičenju</p>
                        <p className="text-muted-foreground">
                          Najbolji tipster meseca osvaja freebets
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feed" className="mt-6">
            <TipsFeed />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <RequireAuth>
              <UserStats />
            </RequireAuth>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
