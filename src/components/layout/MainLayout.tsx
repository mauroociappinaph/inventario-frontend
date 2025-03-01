"use client"

import { useState, useEffect, ReactNode } from "react"
import { useTheme } from "next-themes"
import { Header } from "./header/Header"
import { EnhancedSidebar } from "./sidebar/EnhancedSidebar"
import { SidebarItem } from "../types/sidebar"

interface User {
  name: string
  email: string
  avatar?: string
}

interface MainLayoutProps {
  children: ReactNode
  sidebarSections: {
    items: SidebarItem[]
  }[]
  user?: User
  logo: ReactNode
  activeItemId?: string
  onSidebarItemClick?: (item: SidebarItem) => void
}

export function MainLayout({
  children,
  sidebarSections,
  user,
  logo,
  activeItemId,
  onSidebarItemClick
}: MainLayoutProps) {
  // Estados para el tema
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Estado para controlar si el menú móvil está abierto
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Estado para el tamaño de la ventana
  const [isMobile, setIsMobile] = useState(false)

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar inicialmente
    checkMobile()

    // Agregar event listener para cambios de tamaño
    window.addEventListener("resize", checkMobile)

    // Limpiar event listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Alternar tema claro/oscuro
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Alternar menú móvil
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev)
  }

  // Ocultar el menú móvil cuando se hace clic en un ítem (en móvil)
  const handleSidebarItemClick = (item: SidebarItem) => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }

    if (onSidebarItemClick) {
      onSidebarItemClick(item)
    }
  }

  // No renderizar nada durante el montaje inicial para evitar problemas de hidratación
  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {/* Sidebar - oculto en móvil a menos que se active */}
      <div className={`
        fixed inset-0 z-50 md:relative
        ${mobileMenuOpen ? "block" : "hidden"}
        md:block
      `}>
        {/* Overlay para cerrar al hacer clic fuera (solo en móvil) */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
        )}

        <EnhancedSidebar
          logo={logo}
          sidebarSections={sidebarSections}
          activeItemId={activeItemId}
          defaultCollapsed={false}
          onItemClick={handleSidebarItemClick}
          className="z-10 relative h-full md:h-screen"
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full">
        <Header
          user={user}
          onMobileMenuToggle={toggleMobileMenu}
          isDarkTheme={theme === "dark"}
          onThemeToggle={toggleTheme}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>

        <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
          <p>© {new Date().getFullYear()} InvSystem. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}
