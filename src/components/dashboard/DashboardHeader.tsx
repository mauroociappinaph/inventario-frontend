"use client"

import { Search } from "lucide-react"
import { Input } from "../ui/input"

type DashboardHeaderProps = {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function DashboardHeader({
  searchQuery,
  setSearchQuery,
}: DashboardHeaderProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-center spacing-x-md bg-card flex-shrink-0 px-4">
      <div className="w-full max-w-md relative">
        <Search className="absolute left-sm top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-10 bg-muted/40 border-none h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar en la aplicación"
        />
      </div>
    </header>
  )
}
