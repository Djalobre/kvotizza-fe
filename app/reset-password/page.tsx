'use client'
import { Suspense } from 'react'
import ResetInner from './reset-inner'

export const dynamic = 'force-dynamic' // optional

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading…</div>}>
      <ResetInner />
    </Suspense>
  )
}
