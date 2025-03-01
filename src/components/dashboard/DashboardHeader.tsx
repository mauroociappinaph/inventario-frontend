"use client"

import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Sidebar
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

type DashboardHeaderProps = {
  isDarkTheme: boolean
  mobileMenuOpen: boolean
  searchQuery: string
  userInfo: {
    name: string
    initials?: string
    avatar?: string
  }
  setMobileMenuOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  toggleTheme: () => void
  toggleSidebarVariant: () => void
}

export function DashboardHeader({
  isDarkTheme,
  mobileMenuOpen,
  searchQuery,
  userInfo,
  setMobileMenuOpen,
  setSearchQuery,
  toggleTheme,
  toggleSidebarVariant
}: DashboardHeaderProps) {
  return (
    <header className="h-14 border-b border-border flex items-center gap-md spacing-x-md bg-card flex-shrink-0">
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú"
          className="transition-standard"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 max-w-md relative">
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

      <div className="flex items-center gap-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 transition-standard"
          onClick={toggleSidebarVariant}
          aria-label="Cambiar vista de sidebar"
        >
          <Sidebar className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 transition-standard"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" aria-hidden="true"></span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 transition-standard"
          onClick={toggleTheme}
          aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt={userInfo.name} />
          <AvatarFallback>{userInfo.initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
