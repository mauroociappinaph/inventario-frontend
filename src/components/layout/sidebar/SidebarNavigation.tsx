"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "../../ui/button"

interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  items?: SidebarItem[]
}

interface SidebarNavigationProps {
  sections: {
    items: SidebarItem[]
  }[]
  isCollapsed: boolean
  activeItemId?: string
  onItemClick?: (item: SidebarItem) => void
}

export function SidebarNavigation({
  sections,
  isCollapsed,
  activeItemId: propActiveItemId,
  onItemClick
}: SidebarNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Estado para controlar qué items están expandidos
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    const initialExpandedItems: Record<string, boolean> = {}

    // Función recursiva para marcar los padres de activeItemId como expandidos
    const expandParentsOfActiveItem = (items: SidebarItem[], activeId: string | undefined) => {
      if (!activeId) return false

      for (const item of items) {
        if (item.id === activeId) return true

        if (item.items) {
          const hasActiveChild = expandParentsOfActiveItem(item.items, activeId)
          if (hasActiveChild) {
            initialExpandedItems[item.id] = true
            return true
          }
        }
      }

      return false
    }

    // Inicializar el estado expandido basado en el activeItemId
    sections.forEach(section => {
      expandParentsOfActiveItem(section.items, propActiveItemId)
    })

    return initialExpandedItems
  })

  // Estado local para el ítem activo
  const [activeItemId, setActiveItemId] = useState<string | undefined>(propActiveItemId)

  // Actualizar el ítem activo cuando cambia la propiedad
  useEffect(() => {
    if (propActiveItemId && propActiveItemId !== activeItemId) {
      setActiveItemId(propActiveItemId)

      // Verificar si necesitamos expandir items padres
      if (propActiveItemId) {
        const newExpandedItems = { ...expandedItems }
        let needsUpdate = false

        const expandParents = (items: SidebarItem[], targetId: string): boolean => {
          for (const item of items) {
            if (item.id === targetId) return true

            if (item.items) {
              const hasTarget = expandParents(item.items, targetId)
              if (hasTarget && !newExpandedItems[item.id]) {
                newExpandedItems[item.id] = true
                needsUpdate = true
              }
              if (hasTarget) return true
            }
          }

          return false
        }

        sections.forEach(section => {
          expandParents(section.items, propActiveItemId)
        })

        if (needsUpdate) {
          setExpandedItems(newExpandedItems)
        }
      }
    }
  }, [propActiveItemId, activeItemId, expandedItems, sections])

  // Manejar el clic en un ítem
  const handleItemClick = (item: SidebarItem) => {
    // Si el ítem tiene subitems, alternamos su estado expandido
    if (item.items && item.items.length > 0) {
      setExpandedItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }))
    }

    // Si el ítem tiene href, navegamos a esa ruta
    if (item.href) {
      router.push(item.href)
    }

    // Actualizamos el ítem activo
    setActiveItemId(item.id)

    // Llamamos al callback si existe
    if (onItemClick) {
      onItemClick(item)
    }
  }

  // Renderizar un ítem recursivamente
  const renderItem = (item: SidebarItem, depth = 0) => {
    const isActive = item.id === activeItemId
    const isExpanded = expandedItems[item.id] || false
    const hasSubItems = item.items && item.items.length > 0

    return (
      <li key={item.id} className="my-px">
        <Button
          variant="ghost"
          className={`w-full justify-start h-9 px-2 ${
            isActive ? "bg-primary/10 text-primary" : ""
          } ${isCollapsed && depth === 0 ? "justify-center" : ""}`}
          onClick={() => handleItemClick(item)}
        >
          {item.icon && (
            <span className={`mr-2 ${isCollapsed && depth === 0 ? "mr-0" : ""}`}>
              {item.icon}
            </span>
          )}

          {(!isCollapsed || depth > 0) && (
            <span className="truncate">{item.label}</span>
          )}

          {hasSubItems && !isCollapsed && (
            <span className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </Button>

        {hasSubItems && isExpanded && (
          <ul className={`pl-${depth > 0 ? 4 : 2} mt-1`}>
            {item.items && item.items.map(subItem => renderItem(subItem, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <nav className="mt-2">
      {sections.map((section, index) => (
        <ul key={index} className="space-y-1">
          {section.items.map(item => renderItem(item))}
        </ul>
      ))}
    </nav>
  )
}
