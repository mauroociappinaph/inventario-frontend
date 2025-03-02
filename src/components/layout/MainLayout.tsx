"use client"

import { useState, useEffect, ReactNode } from "react"
import { useTheme } from "next-themes"
import { Header } from "./header/Header"
import { EnhancedSidebar } from "./sidebar/EnhancedSidebar"
import { SidebarItem, SidebarSection } from "./sidebar/EnhancedSidebar"
import { UIStateProvider } from "@/providers/ui-state-provider"

interface User {
  name: string
  email: string
  avatar?: string
}

interface MainLayoutProps {
  children: ReactNode
  sidebarSections: SidebarSection[]
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
    // Esta función se pasa a Header pero no necesita mantener estado
    // ya que la navegación móvil se maneja de otra manera
  }

  // Ocultar el menú móvil cuando se hace clic en un ítem (en móvil)
  const handleSidebarItemClick = (item: SidebarItem) => {
    if (isMobile && onSidebarItemClick) {
      onSidebarItemClick(item)
    }
  }

  // No renderizar nada durante el montaje inicial para evitar problemas de hidratación
  if (!mounted) return null

  return (
    <UIStateProvider>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <EnhancedSidebar
            sidebarSections={sidebarSections}
            activeItemId={activeItemId}
            onItemClick={handleSidebarItemClick}
            logo={logo}
          />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </UIStateProvider>
  )
}
