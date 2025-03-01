import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem } from '../sidebar/SidebarItem';
import { useSidebarOptimized } from '@/hooks/useSidebarOptimized';
import { SidebarSection } from '@/types/sidebar';

type SidebarContainerProps = {
  sections: SidebarSection[];
  className?: string;
};

/**
 * Componente contenedor de sidebar con separación de responsabilidades
 * Utiliza el hook optimizado para manejar la lógica de estado
 */
export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  sections,
  className,
}) => {
  // Usar el hook optimizado para toda la lógica
  const {
    sidebarVariant,
    handleItemClick,
    isActive,
    isExpanded,
    isLoading,
    toggleSidebarVariant,
  } = useSidebarOptimized(sections);

  const isCompact = sidebarVariant === 'compact';

  return (
    <aside
      className={cn(
        'flex flex-col bg-background border-r overflow-hidden transition-all',
        isCompact ? 'w-[60px]' : 'w-[260px]',
        className
      )}
    >
      {/* Cabecera de Sidebar */}
      <div className="p-4 flex items-center justify-between border-b">
        {!isCompact && <h2 className="text-lg font-semibold">Dashboard</h2>}
        <button
          onClick={toggleSidebarVariant}
          className="rounded-md p-1 hover:bg-accent transition-colors"
          aria-label={isCompact ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCompact ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Contenido de Sidebar */}
      <div className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            {/* Título de sección (oculto en variante compacta) */}
            {!isCompact && section.title && (
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
            )}

            {/* Items de la sección */}
            <div className="space-y-1">
              {(section.items || []).map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  level={0}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  isLoading={isLoading}
                  onItemClick={handleItemClick}
                  variant={sidebarVariant}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
