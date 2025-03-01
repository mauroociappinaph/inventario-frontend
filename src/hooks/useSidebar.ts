import { useEffect } from 'react';
import { useUIStore, SidebarSection } from '@/stores/uiStore';

/**
 * Hook personalizado que proporciona funcionalidad para el sidebar
 * utilizando el store centralizado.
 */
export function useSidebar(sections: SidebarSection[]) {
  const {
    sidebarVariant,
    setSidebarVariant,
    activeItemId,
    setActiveItemId,
    expandedItems,
    toggleExpandItem,
    expandParentOfActiveItem,
    loadingItems,
    setItemLoading
  } = useUIStore();

  // Expandir automáticamente el padre del item activo cuando cambia el activeItemId
  useEffect(() => {
    if (activeItemId) {
      expandParentOfActiveItem(sections);
    }
  }, [activeItemId, sections, expandParentOfActiveItem]);

  // Manejar el clic en un elemento del sidebar con indicador de carga
  const handleItemClick = (itemId: string, href?: string, onClick?: () => void) => {
    // Si es un elemento con subitems, solamente expandirlo
    const isParentWithSubitems = sections.some(section =>
      section.items.some(item =>
        item.id === itemId && item.subItems && item.subItems.length > 0
      )
    );

    if (isParentWithSubitems) {
      toggleExpandItem(itemId);
      return;
    }

    // Establecer estado de carga
    setItemLoading(itemId, true);

    // Marcar como activo
    setActiveItemId(itemId);

    // Ejecutar onClick si existe
    if (onClick) {
      onClick();
    }

    // Limpiar el estado de carga después de un tiempo (simular navegación)
    setTimeout(() => {
      setItemLoading(itemId, false);
    }, 500);
  };

  // Alternar la variante del sidebar (compact/default)
  const toggleSidebarVariant = () => {
    setSidebarVariant(sidebarVariant === 'default' ? 'compact' : 'default');
  };

  return {
    sidebarVariant,
    setSidebarVariant,
    toggleSidebarVariant,
    activeItemId,
    expandedItems,
    handleItemClick,
    isItemLoading: (itemId: string) => loadingItems[itemId] || false,
    isItemExpanded: (itemId: string) => expandedItems[itemId] || false,
    isItemActive: (itemId: string) => activeItemId === itemId
  };
}
