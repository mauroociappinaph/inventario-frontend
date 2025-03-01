import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, X } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "../lib/utils"

// Tipos para los elementos del sidebar
export type SidebarItem = {
  id: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  badge?: {
    count: number
    color?: string
  }
  subItems?: Omit<SidebarItem, "subItems" | "icon">[]
}

export type SidebarSection = {
  id: string
  title: string
  items: SidebarItem[]
}

export type SidebarUserInfo = {
  name: string
  role: string
  avatar?: string
  initials?: string
}

export type EnhancedSidebarProps = {
  isMobile?: boolean
  onClose?: () => void
  logo?: React.ReactNode
  title?: string
  sections: SidebarSection[]
  userInfo?: SidebarUserInfo
  activeItemId?: string
  footerContent?: React.ReactNode
  variant?: "default" | "compact" | "expanded"
  onItemClick?: (itemId: string) => void
}

export function EnhancedSidebar({
  isMobile = false,
  onClose,
  logo,
  title = "InvSystem",
  sections,
  userInfo,
  activeItemId,
  footerContent,
  variant = "default",
  onItemClick,
}: EnhancedSidebarProps) {
  // Estado para controlar las secciones expandidas (para elementos con subelementos)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    // Inicializar expandedItems basado en el activeItemId
    const initialExpanded: Record<string, boolean> = {};

    if (activeItemId) {
      // Buscar el elemento padre que contiene el item activo
      sections.forEach(section => {
        section.items.forEach(item => {
          if (item.subItems?.some(subItem => subItem.id === activeItemId)) {
            // Expandir automáticamente el elemento padre si contiene el subitem activo
            initialExpanded[item.id] = true;
          }

          // También expandir si el propio elemento es el activo y tiene subitems
          if (item.id === activeItemId && item.subItems?.length) {
            initialExpanded[item.id] = true;
          }
        });
      });
    }

    return initialExpanded;
  });

  // Efecto para actualizar expandedItems cuando cambia activeItemId desde fuera
  useEffect(() => {
    if (activeItemId) {
      let needsUpdate = false;
      const newExpandedItems = { ...expandedItems };

      sections.forEach(section => {
        section.items.forEach(item => {
          // Si el elemento activo está en los subitems, y el padre no está expandido
          if (
            item.subItems?.some(subItem => subItem.id === activeItemId) &&
            !expandedItems[item.id]
          ) {
            newExpandedItems[item.id] = true;
            needsUpdate = true;
          }
        });
      });

      // Solo actualizar el estado si hay cambios para evitar re-renderizados innecesarios
      if (needsUpdate) {
        setExpandedItems(newExpandedItems);
      }
    }
  }, [activeItemId, sections, expandedItems]);

  // Maneja el clic en un elemento con subelementos
  const toggleExpandItem = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  // Renderizar un elemento individual del sidebar
  const renderSidebarItem = (item: SidebarItem, isSubItem = false) => {
    const isActive = activeItemId === item.id
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems[item.id]

    return (
      <div key={item.id} className={isSubItem ? "pl-lg" : ""}>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "sm"}
          className={cn(
            "w-full justify-start mb-xs transition-standard",
            isActive
              ? "text-sidebar-foreground bg-sidebar-accent/30"
              : "text-dim-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            variant === "compact" && !isSubItem && "h-9 w-9 p-0 flex justify-center"
          )}
          onClick={() => {
            if (hasSubItems) {
              toggleExpandItem(item.id)
            } else if (item.onClick) {
              item.onClick()
            }
            if (!hasSubItems && onItemClick) {
              onItemClick(item.id)
            }
          }}
        >
          {/* Icono solo visible en modo normal o compact */}
          {item.icon && !isSubItem && (
            <span className={variant === "compact" ? "mr-0" : "mr-md"}>{item.icon}</span>
          )}

          {/* Etiqueta solo visible en modo normal o expandido */}
          {(variant !== "compact" || isSubItem) && (
            <span className="truncate">{item.label}</span>
          )}

          {/* Indicador de expandible - mostrar en todos los modos, incluyendo móvil */}
          {hasSubItems && (
            <span className="ml-auto">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          )}

          {/* Badge o contador de notificaciones */}
          {item.badge && item.badge.count > 0 && (
            <span
              className={cn(
                "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full text-xs font-medium",
                item.badge.color || "bg-primary text-primary-foreground"
              )}
            >
              {item.badge.count}
            </span>
          )}
        </Button>

        {/* Subelementos si están expandidos */}
        {hasSubItems && isExpanded && !isSubItem && (
          <div className="mt-xs mb-sm space-y-xs">
            {item.subItems?.map(subItem => renderSidebarItem(
              { ...subItem, icon: null as any }, // Los subelementos no tienen icono
              true
            ))}
          </div>
        )}
      </div>
    )
  }

  // Componente para el contenido del sidebar
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo y título */}
      <div className="spacing-md border-b border-sidebar-border">
        <div className="flex items-center gap-sm">
          {logo || (
            <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
              {title.substring(0, 2).toUpperCase()}
            </div>
          )}
          {variant !== "compact" && <span className="text-lg font-semibold">{title}</span>}
        </div>
      </div>

      {/* Secciones y elementos de menú */}
      <div className={cn("flex-1 spacing-y-md overflow-y-auto", variant === "compact" ? "spacing-x-xs" : "")}>
        {sections.map((section) => (
          <div key={section.id} className={cn("section-spacing", variant === "compact" ? "spacing-x-xs" : "spacing-x-sm")}>
            {variant !== "compact" && (
              <p className="text-xs uppercase text-dim-3 font-semibold mb-sm spacing-x-sm">
                {section.title}
              </p>
            )}
            {section.items.map((item) => renderSidebarItem(item))}
          </div>
        ))}
      </div>

      {/* Información del usuario y footer */}
      {(userInfo || footerContent) && (
        <div className={cn(
          "border-t border-sidebar-border mt-auto",
          variant === "compact" ? "spacing-sm" : "spacing-md"
        )}>
          {userInfo && (
            <div className={cn("flex items-center gap-sm mb-sm", variant === "compact" && "justify-center")}>
              <Avatar className="h-8 w-8">
                {userInfo.avatar ? (
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                ) : null}
                <AvatarFallback>{userInfo.initials || userInfo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {variant !== "compact" && (
                <div>
                  <p className="text-sm font-medium">{userInfo.name}</p>
                  <p className="text-xs text-dim-3">{userInfo.role}</p>
                </div>
              )}
            </div>
          )}
          {footerContent}
        </div>
      )}
    </div>
  )

  // Renderizado condicional basado en si es móvil o escritorio
  if (isMobile) {
    return (
      <div className="fixed inset-y-0 left-0 w-full max-w-xs xs:max-w-sm bg-sidebar text-sidebar-foreground spacing-md flex flex-col h-full">
        <div className="flex items-center justify-between mb-md pb-sm border-b border-sidebar-border">
          <div className="flex items-center gap-sm">
            {logo || (
              <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
                {title.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-lg font-semibold">{title}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="transition-standard">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent />
      </div>
    )
  }

  // Versión de escritorio
  return (
    <aside className={cn(
      "sidebar-transition flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
      variant === "compact" ? "w-14" : "w-64"
    )}>
      <SidebarContent />
    </aside>
  )
}
