"use client"

import { useState, useCallback } from "react"
import { Button } from "../../ui/button"
import { SidebarNavigation } from "./SidebarNavigation"
import { PanelLeftClose, PanelLeft } from "lucide-react"

interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  items?: SidebarItem[]
}

interface EnhancedSidebarProps {
  logo: React.ReactNode
  sidebarSections: {
    items: SidebarItem[]
  }[]
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
      className={`flex flex-col h-screen border-r border-border bg-background transition-all duration-300 ${
        isCollapsed ? "w-[60px]" : "w-[240px]"
      } ${className}`}
    >
      <div className="flex items-center h-14 px-3 border-b border-border">
        <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0" : "w-full"}`}>
          {logo}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="ml-auto"
          aria-label={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
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
