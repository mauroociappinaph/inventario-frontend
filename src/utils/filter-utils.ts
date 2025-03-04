import { Product } from '@/types/inventory.interfaces';

/**
 * Extrae las categorías únicas de los productos
 * @param products Array de productos
 * @returns Array de categorías únicas
 */
export function getUniqueCategories(products: Product[]): string[] {
  if (!Array.isArray(products)) {
    return [];
  }

  try {
    // Usar Set para eliminar duplicados y obtener categorías únicas
    const uniqueCategories = Array.from(new Set(
      products.map(product => product.category || 'Sin categoría')
    ));

    return uniqueCategories;
  } catch (error) {
    console.error("Error al obtener categorías únicas:", error);
    return [];
  }
}

/**
 * Filtra productos según los criterios especificados
 * @param products Array de productos a filtrar
 * @param filters Objeto con los criterios de filtrado
 * @returns Array de productos filtrados
 */
export function filterProducts(
  products: Product[],
  filters: {
    searchTerm?: string;
    categoryFilter?: string;
    stockFilter?: 'all' | 'low' | 'out';
    minPrice?: number;
    maxPrice?: number;
  }
): Product[] {
  if (!Array.isArray(products)) {
    return [];
  }

  const { searchTerm, categoryFilter, stockFilter, minPrice, maxPrice } = filters;

  try {
    return products.filter(product => {
      // Búsqueda por término
      const matchesSearch = !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por categoría
      const matchesCategory = !categoryFilter || categoryFilter === 'all' ||
        product.category === categoryFilter;

      // Filtro por stock
      const matchesStock = !stockFilter || stockFilter === 'all' ||
        (stockFilter === 'low' && product.stock <= product.minStock && product.stock > 0) ||
        (stockFilter === 'out' && product.stock === 0);

      // Filtro por precio
      const matchesMinPrice = !minPrice || product.price >= minPrice;
      const matchesMaxPrice = !maxPrice || product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesStock &&
             matchesMinPrice && matchesMaxPrice;
    });
  } catch (error) {
    console.error("Error al filtrar productos:", error);
    return [];
  }
}

/**
 * Ordena productos según un criterio y dirección especificados
 * @param products Array de productos a ordenar
 * @param sortBy Campo por el cual ordenar
 * @param sortDirection Dirección del ordenamiento (asc o desc)
 * @returns Array de productos ordenados
 */
export function sortProducts(
  products: Product[],
  sortBy?: string,
  sortDirection: 'asc' | 'desc' = 'asc'
): Product[] {
  if (!Array.isArray(products) || !sortBy) {
    return products;
  }

  try {
    return [...products].sort((a, b) => {
      // Obtener valores a comparar
      let aValue = a[sortBy as keyof Product] ?? '';
      let bValue = b[sortBy as keyof Product] ?? '';

      // Convertir a string para comparación coherente
      if (typeof aValue !== 'string') aValue = String(aValue);
      if (typeof bValue !== 'string') bValue = String(bValue);

      // Ordenar
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  } catch (error) {
    console.error("Error al ordenar productos:", error);
    return products;
  }
}

/**
 * Aplica filtros y ordenamiento a una lista de productos
 * @param products Array de productos original
 * @param filterOptions Opciones de filtrado
 * @param sortOptions Opciones de ordenamiento
 * @returns Array de productos filtrados y ordenados
 */
export function getFilteredAndSortedProducts(
  products: Product[],
  filterOptions: {
    searchTerm?: string;
    categoryFilter?: string;
    stockFilter?: 'all' | 'low' | 'out';
    minPrice?: number;
    maxPrice?: number;
  },
  sortOptions: {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
): Product[] {
  // Primero filtrar
  const filteredProducts = filterProducts(products, filterOptions);

  // Luego ordenar
  return sortProducts(
    filteredProducts,
    sortOptions.sortBy,
    sortOptions.sortDirection
  );
}
