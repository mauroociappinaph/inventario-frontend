import { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { SidebarSection } from '@/types/sidebar';
import { useEfficiencyOptimizations } from './useEfficiencyOptimizations';

/**
 * Hook optimizado para manejar la funcionalidad del sidebar
 * con mejor estructura de datos para búsquedas y actualizaciones
 */
export const useSidebarOptimized = (sections: SidebarSection[]) => {
  const {
    activeItemId,
    expandedItems,
    loadingItems,
    sidebarVariant,
    setActiveItem,
    expandItem,
    collapseItem,
    setLoadingItem,
    setSidebarVariant,
  } = useUIStore();

  const { memoizeFunction, memoizeObject, createLookupMap } = useEfficiencyOptimizations();

  // Crear estructura de datos optimizada para búsquedas O(1)
  const itemsMap = createLookupMap(
    sections.flatMap(section => section.items || []),
    item => item.id
  );

  // Memoizar mapa de padres para búsqueda rápida O(1)
  const parentsMap = memoizeObject(() => {
    const map = new Map<string, string>();

    sections.forEach(section => {
      (section.items || []).forEach(item => {
        if (item.children) {
          item.children.forEach(child => {
            map.set(child.id, item.id);
          });
        }
      });
    });

    return map;
  }, [sections]);

  // Expandir automáticamente los padres del ítem activo
  useEffect(() => {
    if (activeItemId) {
      const parentId = parentsMap.get(activeItemId);
      if (parentId && !expandedItems.includes(parentId)) {
        expandItem(parentId);
      }
    }
  }, [activeItemId, expandedItems, parentsMap]);

  // Función optimizada para verificar si un ítem está activo
  const isActive = memoizeFunction((itemId: string) => {
    return activeItemId === itemId;
  }, [activeItemId]);

  // Función optimizada para verificar si un ítem está expandido
  const isExpanded = memoizeFunction((itemId: string) => {
    return expandedItems.includes(itemId);
  }, [expandedItems]);

  // Función optimizada para verificar si un ítem está cargando
  const isLoading = memoizeFunction((itemId: string) => {
    return loadingItems.includes(itemId);
  }, [loadingItems]);

  // Manejo optimizado de clicks en ítems
  const handleItemClick = memoizeFunction((itemId: string) => {
    const item = itemsMap.get(itemId);

    if (!item) return;

    // Si tiene hijos, toggle expansión
    if (item.children && item.children.length > 0) {
      if (expandedItems.includes(itemId)) {
        collapseItem(itemId);
      } else {
        expandItem(itemId);
      }
      return;
    }

    // Establecer como activo
    setActiveItem(itemId);

    // Iniciar estado de carga si hay URL
    if (item.href) {
      setLoadingItem(itemId, true);
      // Simulamos finalización de carga después de 500ms
      setTimeout(() => {
        setLoadingItem(itemId, false);
      }, 500);
    }
  }, [itemsMap, expandedItems]);

  // Función optimizada para cambiar variante del sidebar
  const toggleSidebarVariant = memoizeFunction(() => {
    setSidebarVariant(sidebarVariant === 'default' ? 'compact' : 'default');
  }, [sidebarVariant]);

  return {
    sidebarVariant,
    handleItemClick,
    isActive,
    isExpanded,
    isLoading,
    toggleSidebarVariant,
  };
};
