"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "../../ui/input"

interface HeaderProps {
  onSearchChange?: (query: string) => void
  className?: string
}

export function Header({
  onSearchChange,
  className = ""
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Manejar el cambio en el input de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchQuery(newQuery)

    if (onSearchChange) {
      onSearchChange(newQuery)
    }
  }

  return (
    <header className={`h-14 border-b border-border px-4 flex items-center justify-center bg-background ${className}`}>
      {/* Solo barra de búsqueda centrada */}
      <div className="w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-8 h-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </header>
  )
}
