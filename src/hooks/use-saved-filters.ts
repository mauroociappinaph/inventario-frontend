'use client';

import { useLocalStorage } from './use-local-storage';

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
  isDefault?: boolean;
}

interface UseSavedFiltersOptions {
  /**
   * Identificador único para el tipo de filtro (ej: 'products', 'orders', etc.)
   */
  filterType: string;
  /**
   * Número máximo de filtros guardados
   */
  maxSavedFilters?: number;
}

/**
 * Hook para gestionar filtros guardados
 */
export function useSavedFilters<T extends Record<string, any>>({
  filterType,
  maxSavedFilters = 10
}: UseSavedFiltersOptions) {
  const storageKey = `saved-filters-${filterType}`;
  const [savedFilters, setSavedFilters] = useLocalStorage<SavedFilter[]>(storageKey, []);

  /**
   * Guarda un nuevo filtro
   */
  const saveFilter = (name: string, filters: T, isDefault?: boolean) => {
    setSavedFilters((currentFilters) => {
      // Si ya alcanzamos el límite y vamos a añadir uno nuevo, eliminamos el más antiguo
      // que no sea el predeterminado
      let filtersToKeep = [...currentFilters];
      if (filtersToKeep.length >= maxSavedFilters) {
        // Encontrar el filtro no predeterminado más antiguo
        const oldestFilterIndex = filtersToKeep
          .filter(f => !f.isDefault)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]?.id;

        if (oldestFilterIndex) {
          filtersToKeep = filtersToKeep.filter(f => f.id !== oldestFilterIndex);
        }
      }

      // Si hay un filtro predeterminado y estamos configurando este como predeterminado,
      // desmarcar el anterior como predeterminado
      if (isDefault) {
        filtersToKeep = filtersToKeep.map(f => ({
          ...f,
          isDefault: false
        }));
      }

      // Crear el nuevo filtro
      const newFilter: SavedFilter = {
        id: crypto.randomUUID(),
        name,
        filters,
        createdAt: new Date().toISOString(),
        isDefault: isDefault ?? false
      };

      return [...filtersToKeep, newFilter];
    });
  };

  /**
   * Elimina un filtro guardado
   */
  const deleteFilter = (filterId: string) => {
    setSavedFilters(currentFilters =>
      currentFilters.filter(filter => filter.id !== filterId)
    );
  };

  /**
   * Establece un filtro como predeterminado
   */
  const setDefaultFilter = (filterId: string) => {
    setSavedFilters(currentFilters =>
      currentFilters.map(filter => ({
        ...filter,
        isDefault: filter.id === filterId
      }))
    );
  };

  /**
   * Obtiene el filtro predeterminado
   */
  const getDefaultFilter = () => {
    return savedFilters.find(filter => filter.isDefault);
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    setDefaultFilter,
    getDefaultFilter
  };
}
