"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "../../ui/button"
import { ICON_SIZES, TRANSITIONS } from "@/lib/constants"
import { useUIState } from "@/providers/ui-state-provider"

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
  const { activeItemId: contextActiveItemId, setActiveItemId: setContextActiveItemId } = useUIState()

  // Refs para controlar actualizaciones
  const isInitialMount = useRef(true)
  const lastPathname = useRef(pathname)

  // Usar el ID activo del contexto si está disponible, de lo contrario usar el que viene por props
  const activeItemIdToUse = propActiveItemId || contextActiveItemId

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
      expandParentsOfActiveItem(section.items, activeItemIdToUse)
    })

    return initialExpandedItems
  })

  // Estado local para el ítem activo
  const [activeItemId, setActiveItemId] = useState<string | undefined>(activeItemIdToUse)

  // Actualizar el ítem activo cuando cambia la propiedad o el contexto
  useEffect(() => {
    if (activeItemIdToUse && activeItemIdToUse !== activeItemId) {
      setActiveItemId(activeItemIdToUse)

      // Verificar si necesitamos expandir items padres
      if (activeItemIdToUse) {
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
          expandParents(section.items, activeItemIdToUse)
        })

        if (needsUpdate) {
          setExpandedItems(newExpandedItems)
        }
      }
    }
  }, [activeItemIdToUse, activeItemId, expandedItems, sections])

  // Actualizar activeItemId basado en el pathname actual - corrección del bucle infinito
  useEffect(() => {
    // Evitar la ejecución en el montaje inicial
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Evitar actualizaciones si la ruta no ha cambiado
    if (lastPathname.current === pathname) {
      return
    }

    // Actualizar la referencia a la última ruta
    lastPathname.current = pathname

    // Función recursiva para encontrar un ítem por su href
    const findItemByHref = (items: SidebarItem[], path: string): SidebarItem | undefined => {
      for (const item of items) {
        if (item.href === path) return item

        if (item.items) {
          const found = findItemByHref(item.items, path)
          if (found) return found
        }
      }
      return undefined
    }

    // Buscar en todas las secciones
    let matchingItem: SidebarItem | undefined

    sections.forEach(section => {
      if (!matchingItem) {
        matchingItem = findItemByHref(section.items, pathname)
      }
    })

    // Si encontramos un ítem que coincida con la ruta actual, actualizamos el estado
    if (matchingItem && matchingItem.id !== activeItemId) {
      // Actualizar ambos estados en un solo paso
      const newItemId = matchingItem.id
      setActiveItemId(newItemId)
      setContextActiveItemId(newItemId)

      // Asegurarnos de que sus padres estén expandidos
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
        expandParents(section.items, newItemId)
      })

      if (needsUpdate) {
        setExpandedItems(newExpandedItems)
      }
    }
  }, [pathname, sections, setContextActiveItemId]) // Removido activeItemId y expandedItems de las dependencias

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

    // También actualizamos el contexto global
    setContextActiveItemId(item.id)

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
          className={`w-full justify-start h-9 px-2 ${TRANSITIONS.fast} ${
            isActive ? "bg-primary/10 text-primary" : ""
          } ${isCollapsed && depth === 0 ? "justify-center" : ""}`}
          onClick={() => handleItemClick(item)}
        >
          {item.icon && (
            <span className={`${isCollapsed && depth === 0 ? "" : "mr-2"} ${TRANSITIONS.fast}`}>
              {item.icon}
            </span>
          )}

          {(!isCollapsed || depth > 0) && (
            <span className={`truncate ${TRANSITIONS.standard}`}>{item.label}</span>
          )}

          {hasSubItems && !isCollapsed && (
            <span className={`ml-auto ${TRANSITIONS.fast}`}>
              {isExpanded ? (
                <ChevronDown className={ICON_SIZES.sm} />
              ) : (
                <ChevronRight className={ICON_SIZES.sm} />
              )}
            </span>
          )}
        </Button>

        {hasSubItems && (
          <ul
            className={`pl-${depth > 0 ? 4 : 2} mt-1 overflow-hidden ${TRANSITIONS.standard}`}
            style={{
              maxHeight: isExpanded ? `${item.items?.length ? item.items.length * 40 : 0}px` : '0',
              opacity: isExpanded ? 1 : 0
            }}
          >
            {item.items && item.items.map(subItem => renderItem(subItem, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <nav className={`mt-2 ${TRANSITIONS.standard}`}>
      {sections.map((section, index) => (
        <ul key={index} className="space-y-1">
          {section.items.map(item => renderItem(item))}
        </ul>
      ))}
    </nav>
  )
}
