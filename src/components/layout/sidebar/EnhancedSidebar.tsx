"use client"

import { useState, useCallback } from "react"
import { PanelLeft, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNavigation } from "./SidebarNavigation"
import { TRANSITIONS, ICON_SIZES, BORDERS } from "@/lib/constants"

// Tipos para los elementos del sidebar
export type SidebarItem = {
  id: string
  icon?: React.ReactNode
  label: string
  onClick?: () => void
  subItems?: SidebarItem[]
}

export type SidebarSection = {
  id: string
  title: string
  items: SidebarItem[]
}

type EnhancedSidebarProps = {
  logo?: React.ReactNode
  sidebarSections: SidebarSection[]
  activeItemId?: string
  defaultCollapsed?: boolean
  onItemClick?: (item: SidebarItem) => void
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
}

export function EnhancedSidebar({
  logo,
  sidebarSections,
  activeItemId,
  defaultCollapsed = false,
  onItemClick,
  onCollapsedChange,
  className = ""
}: EnhancedSidebarProps) {
  // Estado para controlar si el sidebar está colapsado
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed)

  // Manejar el cambio de estado colapsado
  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)

    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed)
    }
  }, [isCollapsed, onCollapsedChange])

  // Manejar el clic en un ítem del sidebar
  const handleItemClick = useCallback((item: SidebarItem) => {
    if (onItemClick) {
      onItemClick(item)
    }
  }, [onItemClick])

  return (
    <aside
      className={`flex flex-col h-screen bg-background ${BORDERS.sidebar} ${TRANSITIONS.standard} ${
        isCollapsed ? "w-[60px]" : "w-[240px]"
      } ${className}`}
    >
      <div className={`flex items-center h-14 px-3 ${BORDERS.divider}`}>
        <div className={`${TRANSITIONS.standard} overflow-hidden ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}>
          {logo}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className={`ml-auto ${TRANSITIONS.fast}`}
          aria-label={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {isCollapsed ? (
            <PanelLeft className={ICON_SIZES.sm} />
          ) : (
            <PanelLeftClose className={ICON_SIZES.sm} />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <SidebarNavigation
          sections={sidebarSections}
          isCollapsed={isCollapsed}
          activeItemId={activeItemId}
          onItemClick={handleItemClick}
        />
      </div>

      <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
        {!isCollapsed && <span>InvSystem v1.0</span>}
      </div>
    </aside>
  )
}

// Expandir src/lib/constants.ts con más tokens de diseño
export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  // ...
};

export const TYPOGRAPHY = {
  // ...
};
