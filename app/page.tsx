import { Suspense } from 'react'
import Landing from './landing/page'

export default function Page() {
  return (
    <Suspense fallback={<div>Učitavanje…</div>}>
      <Landing />
    </Suspense>
  )
}
