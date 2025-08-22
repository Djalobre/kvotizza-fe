import { Suspense } from 'react'
import KvoteClient from './kvote-client'

export default function Page() {
  return (
    <Suspense fallback={<div>Učitavanje…</div>}>
      <KvoteClient />
    </Suspense>
  )
}
