import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'

type LeagueMultiSelectProps = {
  leagues: string[]
  selected: string[]
  onToggle: (league: string) => void
  onClear?: () => void
  compact?: boolean
}

function LeagueMultiSelect({
  leagues,
  selected,
  onToggle,
  onClear,
  compact = false,
}: LeagueMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const label =
    selected.length === 0
      ? 'Sve'
      : selected.length === 1
      ? '1 izabrana'
      : `${selected.length} izabranih`

  const handleToggle = (league: string) => {
    onToggle(league)
    // Don't close dropdown - keep it open
  }

  const handleClear = () => {
    onClear?.()
    // Don't close dropdown - keep it open
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={compact ? 'h-6 w-28 text-xs' : 'h-7 w-28 text-xs'}
        >
          <Filter className="h-3 w-3 mr-1" />
          {label}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-0">
        <DropdownMenuLabel className="px-3 py-2 text-xs">Takmičenja</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* All / clear - Custom clickable div */}
        <div
          className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClear()
          }}
        >
          <div className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary mr-2">
            {selected.length === 0 && (
              <svg className="h-2.5 w-2.5 fill-current text-current" viewBox="0 0 8 8">
                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
              </svg>
            )}
          </div>
          Sve (očisti izbor)
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-64 overflow-auto py-1">
          {leagues.map((league) => (
            <div
              key={league}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleToggle(league)
              }}
            >
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary mr-2">
                {selected.includes(league) && (
                  <svg className="h-2.5 w-2.5 fill-current text-current" viewBox="0 0 8 8">
                    <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                  </svg>
                )}
              </div>
              <span className="truncate">{league}</span>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LeagueMultiSelect
