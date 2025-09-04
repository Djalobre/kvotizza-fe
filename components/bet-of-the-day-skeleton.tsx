'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export function KvotizzaPickSkeleton() {
  return (
    <Card className="rounded-lg h-full bg-transparent border-none shadow-none">
      <CardHeader className="mb-2 shadow-lg dark:bg-gradient-to-r dark:from-kvotizza-dark-bg-20 dark:to-kvotizza-dark-bg-20 bg-gradient-to-r from-sport-blue-50 to-sport-green-50 pb-3 bg-black rounded-lg dark:border-b dark:border-white/30">
        <CardTitle className="flex items-center gap-2 text-lg text-kvotizza-green-500 dark:text-sport-green-600">
          <Image
            src="/images/kvotizza-logo.png"
            alt="Kvotizza Logo"
            width={30}
            height={30}
            className="block dark:hidden h-10 w-auto"
          />
          <Image
            src="/images/kvotizza-logo-white.png"
            alt="Kvotizza Logo"
            width={30}
            height={30}
            className="h-10 w-auto hidden dark:block"
          />{' '}
          Kvotizza dana
        </CardTitle>
      </CardHeader>
      <CardContent className="dark:bg-kvotizza-dark-bg-20 shadow-lg p-4 md:p-6 flex-1 flex flex-col bg-white rounded-lg">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Match Header Skeleton */}
          <div className="text-center space-y-2 pb-4 border-b">
            <div className="h-6 bg-muted rounded w-3/4 mx-auto animate-pulse" />
            <div className="flex items-center justify-center gap-4">
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Best Odd Skeleton */}
          <div className="bg-sport-green-50/50 dark:bg-sport-green-950/10 rounded-lg p-4 border border-sport-green-200/50 dark:border-sport-green-800/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-4 w-24 bg-sport-green-200/20 rounded animate-pulse mb-1" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              </div>
              <div className="text-right">
                <div className="h-8 w-16 bg-sport-green-200/20 rounded animate-pulse mb-1" />
                <div className="h-3 w-12 bg-muted rounded animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              <div className="h-5 w-16 bg-sport-green-200/20 rounded animate-pulse" />
            </div>

            {/* CTA Button Skeleton */}
            <div className="h-12 w-full bg-sport-green-200/20 rounded animate-pulse" />
          </div>

          {/* Odds List Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded border bg-muted animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="h-5 w-12 bg-muted rounded animate-pulse mb-1" />
                    <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Analysis Skeleton */}
          <div className="mt-auto pt-4 border-t">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-12 bg-muted rounded animate-pulse mx-auto mb-1" />
                    <div className="h-5 w-10 bg-muted rounded animate-pulse mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TicketSkeleton() {
  return (
    <Card className="flex flex-col h-full rounded-lg bg-transparent border-none shadow-none">
      <CardHeader className="mb-2 shadow-lg dark:bg-gradient-to-r dark:from-kvotizza-dark-bg-10 dark:to-kvotizza-dark-bg-10 bg-gradient-to-r from-sport-blue-50 to-sport-green-50 pb-3 bg-black rounded-lg dark:border-b dark:border-white/30">
        <CardTitle className="flex items-center gap-2 text-lg text-kvotizza-green-500 dark:text-sport-green-600">
          <Image
            src="/images/kvotizza-logo.png"
            alt="Kvotizza Logo"
            width={30}
            height={30}
            className="block dark:hidden h-10 w-auto"
          />
          <Image
            src="/images/kvotizza-logo-white.png"
            alt="Kvotizza Logo"
            width={30}
            height={30}
            className="h-10 w-auto hidden dark:block"
          />{' '}
          Tiket dana
        </CardTitle>
      </CardHeader>
      <CardContent className="shadow-lg p-4 md:p-6 flex-1 flex flex-col bg-white rounded-lg dark:bg-kvotizza-dark-bg-20">
        <div className="space-y-4 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded border bg-muted animate-pulse" />
                <div>
                  <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-8 w-12 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-8 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <div className="h-px bg-muted my-4" />
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-12 bg-muted rounded animate-pulse" />
              </div>
              <div className="text-right">
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
                <div className="h-5 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
