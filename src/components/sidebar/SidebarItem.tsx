import React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItemType } from '@/types/sidebar';

type SidebarItemProps = {
  item: SidebarItemType;
  level: number;
  isActive: (id: string) => boolean;
  isExpanded: (id: string) => boolean;
  isLoading: (id: string) => boolean;
  onItemClick: (id: string) => void;
  variant: 'default' | 'compact';
};

/**
 * Componente para renderizar un ítem del sidebar
 * Separado para mejorar mantenibilidad y responsabilidad única
 */
export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  level,
  isActive,
  isExpanded,
  isLoading,
  onItemClick,
  variant,
}) => {
  const active = isActive(item.id);
  const expanded = isExpanded(item.id);
  const loading = isLoading(item.id);
  const hasChildren = item.children && item.children.length > 0;

  // Determinar si debe mostrar como extendido o compacto
  const isCompact = variant === 'compact';

  // Calcular padding para indentación
  const paddingLeft = isCompact ? 12 : level * 12 + 12;

  // Preparar clases condicionales
  const itemClasses = cn(
    'flex items-center py-2 px-3 text-sm rounded-md transition-colors relative',
    'hover:bg-accent/50 group cursor-pointer',
    active && 'bg-accent text-accent-foreground font-medium',
    !active && 'text-muted-foreground'
  );

  // Renderizar contenido del ítem
  const renderItemContent = () => (
    <div
      className={itemClasses}
      style={{ paddingLeft }}
      onClick={() => onItemClick(item.id)}
    >
      {/* Icono */}
      {item.icon && (
        <div className="mr-2 flex items-center justify-center w-5 h-5">
          {React.createElement(item.icon, {
            size: 16,
            className: active ? 'text-accent-foreground' : 'text-muted-foreground'
          })}
        </div>
      )}

      {/* Título (oculto en variante compacta) */}
      {!isCompact && <span className="truncate">{item.title}</span>}

      {/* Mostrar loader si está cargando */}
      {loading && (
        <div className="absolute right-2">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Chevron para ítems con hijos */}
      {hasChildren && !loading && !isCompact && (
        <div className="absolute right-2">
          {expanded ? (
            <ChevronDown size={16} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={16} className="text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );

  // Renderizar el ítem con un enlace si tiene href
  if (item.href && !hasChildren) {
    return (
      <Link href={item.href} className="block">
        {renderItemContent()}
      </Link>
    );
  }

  return (
    <div>
      {renderItemContent()}

      {/* Renderizar hijos si tiene y está expandido */}
      {hasChildren && expanded && !isCompact && (
        <div className="pl-2">
          {item.children!.map(child => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              isActive={isActive}
              isExpanded={isExpanded}
              isLoading={isLoading}
              onItemClick={onItemClick}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
};
