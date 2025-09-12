// components/auth/RequireAuth.tsx
'use client'
import { ReactNode } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Loader2, LogIn } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <Card className="dark:bg-kvotizza-dark-bg-20">
        <CardContent className=" pt-6 text-sm text-white flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Proveravam prijavu…
        </CardContent>
      </Card>
    )
  }

  if (status !== 'authenticated') {
    return (
      <Card className="dark:bg-kvotizza-dark-bg-20">
        <CardContent className="pt-6 text-sm ">
          Morate biti prijavljeni da biste videli ovu sekciju.
          <div className="mt-3">
            <Button
              onClick={() =>
                signIn(undefined, {
                  callbackUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
                })
              }
            >
              <LogIn className="h-4 w-4 mr-2" />
              Prijavi se
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
