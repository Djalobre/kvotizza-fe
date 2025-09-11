'use client'
import { Suspense } from 'react'
import SignInInner from './signin-inner'

export const dynamic = 'force-dynamic' // optional but keeps this page dynamic

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading…</div>}>
      <SignInInner />
    </Suspense>
  )
}
