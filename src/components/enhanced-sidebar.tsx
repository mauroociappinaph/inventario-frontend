"use client"

import { KeyboardEvent } from "react"
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  X,
  Bell,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { useUIStore, SidebarItem, SidebarSection } from "@/stores/uiStore"
import { useSidebar } from "@/hooks/useSidebar"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAppNavigation } from "@/hooks/useAppNavigation"

// Tipo para la información del usuario
export interface SidebarUserInfo {
  name: string;
  role?: string;
  email?: string;
  avatar?: string;
  initials: string;
}

// Interfaz para las props del sidebar mejorado
export interface EnhancedSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  logo?: React.ReactNode;
  title?: string;
  sections: SidebarSection[];
  userInfo?: SidebarUserInfo;
  footerContent?: React.ReactNode;
  variant?: "default" | "compact" | "expanded";
  onItemClick?: (itemId: string) => void;
  selectedItemId?: string;
}

export function EnhancedSidebar({
  isMobile = false,
  onClose,
  logo,
  title = "InvSystem",
  sections,
  userInfo,
  footerContent,
  variant: propVariant,
  onItemClick,
  selectedItemId,
}: EnhancedSidebarProps) {
  const { theme } = useAppTheme()
  const { navigateTo } = useAppNavigation()

  // Usar nuestros hooks centralizados de Zustand
  const {
    sidebarVariant: contextVariant,
    activeItemId: contextActiveItemId,
  } = useUIStore()

  const {
    handleItemClick,
    isItemLoading,
    isItemExpanded,
    toggleSidebarVariant
  } = useSidebar(sections)

  // Usar la variante del contexto si está disponible, de lo contrario usar la prop
  const variant = propVariant || contextVariant || "default"

  // Función que maneja el clic en un elemento del sidebar
  const handleItemButtonClick = (
    itemId: string,
    itemHref?: string,
    itemOnClick?: () => void
  ) => {
    handleItemClick(itemId, itemHref, () => {
      // Notificar al componente padre si existe onItemClick
      if (onItemClick) {
        onItemClick(itemId);
      }

      // Usar la función onClick del item si existe
      if (itemOnClick) {
        itemOnClick();
      }
      // Si hay href, navegar
      else if (itemHref) {
        navigateTo(itemHref, itemId);
      }

      // En móvil, cerrar el menú después de seleccionar
      if (isMobile && onClose) {
        onClose();
      }
    });
  };

  // Renderizar un elemento individual del sidebar
  const renderSidebarItem = (item: SidebarItem, isSubItem = false) => {
    // Usar selectedItemId si está disponible, de lo contrario usar contextActiveItemId
    const activeId = selectedItemId || contextActiveItemId
    const isActive = activeId === item.id
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = isItemExpanded(item.id)
    const isLoading = isItemLoading(item.id)

    // Manejador de eventos de teclado para navegación accesible
    const handleKeyDown = (e: KeyboardEvent) => {
      // Expandir/contraer con Enter o Espacio
      if ((e.key === 'Enter' || e.key === ' ') && hasSubItems) {
        e.preventDefault();
        handleItemClick(item.id)
      }

      // Activar item con Enter
      else if (e.key === 'Enter' && !hasSubItems) {
        e.preventDefault();

        // Notificar al componente padre
        if (onItemClick) {
          onItemClick(item.id);
        }

        if (item.onClick) {
          item.onClick();
        } else if (item.href) {
          navigateTo(item.href, item.id);
        }
      }

      // Expandir con Flecha Derecha
      else if (e.key === 'ArrowRight' && hasSubItems && !isExpanded) {
        e.preventDefault();
        handleItemClick(item.id)
      }

      // Contraer con Flecha Izquierda
      else if (e.key === 'ArrowLeft' && hasSubItems && isExpanded) {
        e.preventDefault();
        handleItemClick(item.id)
      }

      // Navegación con flechas arriba/abajo (delegado al contenedor principal)
    };

    return (
      <div key={item.id} className={isSubItem ? "pl-lg" : ""}>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "sm"}
          className={`
            w-full justify-start mb-xs transition-standard
            ${isActive
              ? "text-sidebar-foreground bg-sidebar-accent/30"
              : "text-dim-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }
            ${variant === "compact" && !isSubItem && "h-9 w-9 p-0 flex justify-center"}
            ${isLoading ? "opacity-70 pointer-events-none" : ""}
          `}
          onClick={() => handleItemButtonClick(item.id, item.href, item.onClick)}
          disabled={isLoading}
          onKeyDown={handleKeyDown}
          title={variant === "compact" && !isSubItem ? item.label : undefined}
          aria-label={`${item.label}${isLoading ? ', cargando' : ''}`}
          aria-expanded={hasSubItems ? isExpanded : undefined}
          aria-haspopup={hasSubItems ? "true" : undefined}
          role={hasSubItems ? "button" : undefined}
          tabIndex={0}
          data-state={isActive ? "active" : (isLoading ? "loading" : "inactive")}
        >
          {/* Contenedor para el icono con animación de carga */}
          <div className="relative">
            {/* Icono solo visible en modo normal o compact */}
            {item.icon && !isSubItem && (
              <span className={`
                ${variant === "compact" ? "mr-0" : "mr-md"}
                ${isLoading ? "opacity-0" : ""}
              `}>{item.icon}</span>
            )}

            {/* Indicador de carga sobre el icono */}
            {isLoading && !isSubItem && (
              <div className={`
                absolute top-0 left-0 w-full h-full flex items-center justify-center
                ${variant !== "compact" ? "ml-0" : ""}
              `}>
                <div className="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Etiqueta solo visible en modo normal o expandido */}
          {(variant !== "compact" || isSubItem) && (
            <div className="truncate flex items-center">
              {isLoading && isSubItem && (
                <div className="mr-md h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
              )}
              <span>{item.label}</span>
            </div>
          )}

          {/* Badge (si existe) */}
          {item.badge && (variant !== "compact" || isSubItem) && (
            <span
              className={`ml-auto min-w-5 h-5 rounded-full text-xs flex items-center justify-center px-1 ${item.badge.color}`}
              aria-label={`${item.badge.count} notificaciones`}
            >
              {item.badge.count}
            </span>
          )}

          {/* Badge compacto (solo número sin estilo) para versión compacta */}
          {item.badge && variant === "compact" && !isSubItem && (
            <span
              className="absolute top-0 right-0 min-w-4 h-4 rounded-full text-xs flex items-center justify-center bg-primary text-primary-foreground"
              aria-label={`${item.badge.count} notificaciones`}
            >
              {item.badge.count}
            </span>
          )}

          {/* Indicador de expandible - mostrar en todos los modos, incluyendo móvil */}
          {hasSubItems && (
            <span className="ml-auto">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          )}
        </Button>

        {/* Subitems - se muestran si hay subelementos y el ítem está expandido */}
        {hasSubItems && isExpanded && (
          <div className="pl-lg" role="group" aria-label={`Subelementos de ${item.label}`}>
            {item.subItems && item.subItems.map(subItem => renderSidebarItem(subItem, true))}
          </div>
        )}
      </div>
    )
  }

  // Calcular las clases CSS para el sidebar basado en la variante
  const sidebarClasses = `
    bg-sidebar
    border-sidebar-border
    border-r
    transition-all
    duration-300
    flex
    flex-col
    text-sidebar-foreground
    ${variant === "compact" ? "w-16" : "w-64"}
    ${isMobile ? "h-screen fixed top-0 left-0 z-50" : "h-full"}
  `

  // Manejar eventos de teclado a nivel de contenedor para navegación entre items
  const handleContainerKeyDown = (e: KeyboardEvent) => {
    // Solo manejar flechas arriba/abajo
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    e.preventDefault();

    // Encontrar todos los elementos focusables
    const focusable = document.querySelectorAll('[role="button"], [tabindex="0"]');
    const focusableArray = Array.from(focusable);

    // Encontrar el elemento actualmente enfocado
    const currentIndex = focusableArray.indexOf(document.activeElement as Element);

    if (currentIndex === -1) return;

    // Calcular el siguiente índice basado en la dirección
    let nextIndex;
    if (e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % focusableArray.length;
    } else {
      nextIndex = (currentIndex - 1 + focusableArray.length) % focusableArray.length;
    }

    // Enfocar el siguiente elemento
    (focusableArray[nextIndex] as HTMLElement).focus();
  };

  const { toggleTheme } = useAppTheme();

  // Renderizar el sidebar
  return (
    <aside className={sidebarClasses}>
      {/* Cabecera del sidebar */}
      <div className="h-16 flex items-center px-sm border-b border-sidebar-border justify-between">
        {variant !== "compact" ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            {logo}
            {title && <span className="font-semibold text-sidebar-foreground">{title}</span>}
          </div>
        ) : (
          <div className="flex justify-center w-full">
            {logo}
          </div>
        )}

        {/* Botón de cierre en móvil */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Botón para alternar el modo compacto/expandido en desktop */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebarVariant}
          >
            {variant === "compact" ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Área de contenido principal del sidebar */}
      <div
        className="flex-1 overflow-y-auto"
        onKeyDown={handleContainerKeyDown}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Renderizar secciones */}
        {sections.map((section, index) => (
          <div key={index} className="mb-lg">
            {section.title && variant !== "compact" && (
              <h2 className="text-xs uppercase font-semibold text-dim-3 px-sm my-sm">
                {section.title}
              </h2>
            )}
            <div className="space-y-xs px-xs">
              {section.items.map(item => renderSidebarItem(item))}
            </div>
          </div>
        ))}
      </div>

      {/* Pie del sidebar */}
      {(userInfo || footerContent) && (
        <div className="mt-auto border-t border-sidebar-border py-sm px-xs">
          {/* Mostrar información del usuario si está disponible */}
          {userInfo && (
            <div className={`flex items-center ${variant === "compact" ? "justify-center" : "px-sm mb-md"}`}>
              <Avatar
                src={userInfo.avatar}
                alt={userInfo.name}
                initials={userInfo.initials}
                size="sm"
                className="h-8 w-8"
              />

              {variant !== "compact" && (
                <div className="ml-sm">
                  <p className="text-sm font-medium text-sidebar-accent-foreground leading-none">{userInfo.name}</p>
                  {userInfo.role && <p className="text-xs text-sidebar-foreground/60 mt-1">{userInfo.role}</p>}
                </div>
              )}
            </div>
          )}

          {/* Botones de acción en el footer */}
          <div className={`flex ${variant === "compact" ? "flex-col items-center" : "justify-around"} mt-sm`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-dim-3 hover:text-sidebar-foreground">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-dim-3 hover:text-sidebar-foreground">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-dim-3 hover:text-sidebar-foreground"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Contenido personalizado en el footer */}
          {footerContent && variant !== "compact" && (
            <div className="mt-md px-sm">
              {footerContent}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
