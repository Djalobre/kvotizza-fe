// app/kvote/page.tsx
import KvoteClient from "./kvote-client"

export default function Page({
  searchParams,
}: {
  searchParams: {
    sport?: string
    dateSpan?: string
    league?: string
    view?: "time" | "league"
    category?: string
  }
}) {
  return <KvoteClient initialQuery={searchParams} />
}
