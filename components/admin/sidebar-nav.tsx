'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutGrid, CalendarCheck } from 'lucide-react'

type Item = { href: string; label: string; icon?: React.ComponentType<any> }

export const NAV_ITEMS: Item[] = [
  { href: '/admin/top-matches-selection', label: 'Top matches', icon: LayoutGrid },
  { href: '/admin/daily-ticket', label: 'Daily ticket', icon: CalendarCheck },
  // add more later…
]

export default function SidebarNav() {
  const pathname = usePathname()
  return (
    <aside className="w-64 shrink-0 border-r bg-background/60 backdrop-blur p-3">
      <div className="px-2 py-3 font-semibold text-lg">Admin</div>
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
