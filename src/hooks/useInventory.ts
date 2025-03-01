import { useEffect, useMemo, useState } from 'react';
import { useInventoryStore, Product } from '@/stores/inventoryStore';

/**
 * Hook personalizado para manejar el inventario con funcionalidades adicionales
 * como filtrado, ordenamiento y cálculos.
 */
export function useInventory() {
  // Obtener el estado y las acciones del store
  const {
    products,
    categories,
    suppliers,
    movements,
    isLoading,
    error,
    selectedProductId,
    filters,
    setFilters,
    resetFilters,
    fetchProducts,
    fetchCategories,
    fetchSuppliers,
    fetchMovements,
    setSelectedProductId
  } = useInventoryStore();

  // Estado local para ordenamiento
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc'
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      // Solo cargar los datos si están vacíos
      if (products.length === 0) await fetchProducts();
      if (categories.length === 0) await fetchCategories();
      if (suppliers.length === 0) await fetchSuppliers();
      if (movements.length === 0) await fetchMovements();
    };

    loadData();
  }, [products.length, categories.length, suppliers.length, movements.length,
      fetchProducts, fetchCategories, fetchSuppliers, fetchMovements]);

  // Función para ordenar productos
  const requestSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // Productos filtrados y ordenados
  const filteredAndSortedProducts = useMemo(() => {
    // Clonar array para no mutar el original
    let filtered = [...products];

    // Aplicar filtros
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.supplier.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category === filters.category
      );
    }

    if (filters.supplier) {
      filtered = filtered.filter(product =>
        product.supplier === filters.supplier
      );
    }

    if (filters.stockStatus !== 'todos') {
      filtered = filtered.filter(product => {
        const ratio = product.stock / product.minStock;

        switch (filters.stockStatus) {
          case 'bajo':
            return ratio < 1.2;
          case 'normal':
            return ratio >= 1.2 && ratio <= 3;
          case 'exceso':
            return ratio > 3;
          default:
            return true;
        }
      });
    }

    // Ordenar productos
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [products, filters, sortConfig]);

  // Producto seleccionado
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find(product => product.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  // Estadísticas del inventario
  const inventoryStats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStockCount = products.filter(p => p.stock < p.minStock).length;
    const averagePrice = totalProducts
      ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts
      : 0;

    return {
      totalProducts,
      totalStock,
      lowStockCount,
      averagePrice,
      stockHealth: lowStockCount === 0 ? 'Óptimo' : lowStockCount < totalProducts * 0.1 ? 'Bueno' : 'Necesita atención'
    };
  }, [products]);

  return {
    // Datos
    products,
    categories,
    suppliers,
    movements,
    filteredProducts: filteredAndSortedProducts,
    selectedProduct,

    // Estado
    isLoading,
    error,
    sortConfig,
    filters,
    inventoryStats,

    // Acciones
    setSelectedProductId,
    setFilters,
    resetFilters,
    requestSort,

    // Helpers
    getProductById: (id: string) => products.find(p => p.id === id),
    getCategoryById: (id: string) => categories.find(c => c.id === id),
    getSupplierById: (id: string) => suppliers.find(s => s.id === id),

    // Refresh de datos
    refreshProducts: fetchProducts,
    refreshCategories: fetchCategories,
    refreshSuppliers: fetchSuppliers,
    refreshMovements: fetchMovements,
  };
}
