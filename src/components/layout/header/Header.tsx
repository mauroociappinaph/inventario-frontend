"use client"

import { useState } from "react"
import { Bell, Menu, Moon, Search, Sun } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"

interface User {
  name: string
  email: string
  avatar?: string
}

interface HeaderProps {
  user?: User
  onMobileMenuToggle: () => void
  isDarkTheme: boolean
  onThemeToggle: () => void
  onSearchChange?: (query: string) => void
  className?: string
}

export function Header({
  user,
  onMobileMenuToggle,
  isDarkTheme,
  onThemeToggle,
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

  // Obtener las iniciales del usuario para el fallback del avatar
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className={`h-14 border-b border-border px-4 flex items-center justify-between bg-background ${className}`}>
      {/* Botón del menú móvil y logo en móvil */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMobileMenuToggle}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="md:hidden flex items-center">
          <span className="font-semibold text-primary">InvSystem</span>
        </div>
      </div>

      {/* Búsqueda - se oculta en móvil */}
      <div className="hidden md:flex-1 md:flex md:max-w-md mx-4">
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

      {/* Acciones y perfil */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          {isDarkTheme ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {user && (
          <Button variant="ghost" className="flex items-center space-x-2 h-9 rounded-full pl-1 pr-3">
            <Avatar className="h-7 w-7">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
              )}
            </Avatar>
            <span className="hidden md:inline text-sm">{user.name}</span>
          </Button>
        )}
      </div>
    </header>
  )
}
