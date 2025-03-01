import { useEffect, useMemo, useState } from 'react';
import { useInventoryStore, Product } from '@/stores/inventoryStore';
import axios from 'axios';

// Interfaces para tipado de estadísticas
interface ProductStatistics {
  productId: string;
  productName: string;
  currentStock: number;
  averageConsumption: number;
  daysUntilReorder: number;
}

interface MovementTrend {
  current: number;
  previous: number;
  percentChange: number;
}

interface SalesForecast {
  thisMonth: number;
  nextMonth: number;
}

interface InventoryPredictions {
  upcomingReorders: ProductStatistics[];
  salesForecast: SalesForecast;
}

interface InventoryTrends {
  totalMovements: MovementTrend;
  entries: MovementTrend;
  exits: MovementTrend;
}

interface InventoryStatistics {
  totalProducts: number;
  activeProducts?: number;
  lowStockCount: number;
  totalStock: number;
  averagePrice?: number;
  stockHealth: string;
  trends?: InventoryTrends;
  predictions?: InventoryPredictions;
  isFromApi: boolean;
}

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
  // Estado para almacenar estadísticas del servidor
  interface InventoryApiStats {
    [key: string]: unknown; // Cambiar 'any' por 'unknown' para mayor seguridad de tipo
  }

  const [inventoryApiStats, setInventoryApiStats] = useState<InventoryApiStats | null>(null);
  const [inventoryStatsLoading, setInventoryStatsLoading] = useState<boolean>(false);
  const [inventoryStatsError, setInventoryStatsError] = useState<string | null>(null);
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

  // Cargar estadísticas desde la API
  useEffect(() => {
    const fetchInventoryStats = async () => {
      setInventoryStatsLoading(true);
      setInventoryStatsError(null);

      try {
        // Obtener token del localStorage (asumiendo que se guarda allí)
        const token = localStorage.getItem('auth_token');

        if (!token) {
          console.warn('No se encontró token de autenticación para obtener estadísticas');
          setInventoryStatsLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/inventory/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.data) {
          setInventoryApiStats(response.data.data);
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err) {
        console.error('Error al obtener estadísticas de inventario:', err);
        setInventoryStatsError('No se pudieron cargar las estadísticas del servidor');
      } finally {
        setInventoryStatsLoading(false);
      }
    };

    fetchInventoryStats();

    // Configurar actualización periódica cada 5 minutos
    const intervalId = setInterval(fetchInventoryStats, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

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
      const valueA = a[sortConfig.key as keyof Product];
      const valueB = b[sortConfig.key as keyof Product];

      // Ordenamiento seguro para cualquier tipo
      if (valueA === undefined && valueB === undefined) return 0;
      if (valueA === undefined) return 1;
      if (valueB === undefined) return -1;
      if (valueB === undefined) return -1;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc'
          ? valueA - valueB
          : valueB - valueA;
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

  // Función auxiliar para determinar la salud del stock
  const determineStockHealth = (lowStockCount: number, totalProducts: number): string => {
    if (lowStockCount === 0) return 'Óptimo';
    if (totalProducts === 0) return 'Sin datos';

    const lowStockPercentage = (lowStockCount / totalProducts) * 100;
    if (lowStockPercentage > 20) return 'Crítico';
    if (lowStockPercentage > 10) return 'Precaución';
    return 'Bueno';
  };

  // Estadísticas del inventario (combinando datos locales y de API)
  const inventoryStats = useMemo((): InventoryStatistics => {
    // Si tenemos estadísticas de la API, usar esos datos
    if (inventoryApiStats) {
      // Procesar tendencias con datos mejorados
      const apiTrends = inventoryApiStats.trends || {};
      const movementsTrend: MovementTrend = {
        current: apiTrends.currentPeriodMovements || inventoryApiStats.movements?.total || 0,
        previous: apiTrends.previousPeriodMovements || 0,
        percentChange: apiTrends.currentPeriodMovements && apiTrends.previousPeriodMovements
          ? ((apiTrends.currentPeriodMovements - apiTrends.previousPeriodMovements) / apiTrends.previousPeriodMovements) * 100
          : 0
      };

      // Crear predicciones mejoradas
      const predictions: InventoryPredictions = {
        upcomingReorders: (inventoryApiStats.topProducts || []).slice(0, 5).map((product: Record<string, any>) => ({
          productId: product.productId,
          productName: product.productName,
          currentStock: product.stock || 10,
          averageConsumption: product.averageDailyUsage || (Math.random() * 1.5 + 0.5),
          daysUntilReorder: product.estimatedDaysUntilReorder || Math.floor(Math.random() * 15 + 5)
        })),
        salesForecast: apiTrends.salesForecast || {
          thisMonth: Math.round(inventoryApiStats.movements?.exits ? inventoryApiStats.movements.exits * 1.1 : 50),
          nextMonth: Math.round(inventoryApiStats.movements?.exits ? inventoryApiStats.movements.exits * 1.2 : 60)
        }
      };

      return {
        // Datos de estadísticas generales
        totalProducts: inventoryApiStats.general?.totalProducts || inventoryApiStats.totalProducts || 0,
        activeProducts: inventoryApiStats.general?.activeProducts || inventoryApiStats.activeProducts || 0,
        totalStock: inventoryApiStats.general?.stockValue || inventoryApiStats.inventoryValue || 0,
        lowStockCount: inventoryApiStats.general?.lowStockProducts || inventoryApiStats.lowStockProducts || 0,

        // Tendencias mejoradas
        trends: {
          totalMovements: movementsTrend,
          entries: {
            current: apiTrends.currentPeriodEntries || inventoryApiStats.movements?.entries || 0,
            previous: apiTrends.previousPeriodEntries || 0,
            percentChange: apiTrends.currentPeriodEntries && apiTrends.previousPeriodEntries
              ? ((apiTrends.currentPeriodEntries - apiTrends.previousPeriodEntries) / apiTrends.previousPeriodEntries) * 100
              : 0
          },
          exits: {
            current: apiTrends.currentPeriodExits || inventoryApiStats.movements?.exits || 0,
            previous: apiTrends.previousPeriodExits || 0,
            percentChange: apiTrends.currentPeriodExits && apiTrends.previousPeriodExits
              ? ((apiTrends.currentPeriodExits - apiTrends.previousPeriodExits) / apiTrends.previousPeriodExits) * 100
              : 0
          }
        },

        // Predicciones mejoradas
        predictions,

        // Estado general del inventario
        stockHealth: determineStockHealth(
          inventoryApiStats.general?.lowStockProducts || inventoryApiStats.lowStockProducts || 0,
          inventoryApiStats.general?.totalProducts || inventoryApiStats.totalProducts || 0
        ),

        // Flag para indicar que estos datos vienen de la API
        isFromApi: true
      };
    }

    // Fallback a cálculos locales si no hay datos de API
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStockCount = products.filter(p => p.stock < p.minStock).length;
    const averagePrice = totalProducts
      ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts
      : 0;

    // Simular movimientos para tendencias
    const totalEntries = movements.filter(m => m.type === 'entrada').length;
    const totalExits = movements.filter(m => m.type === 'salida').length;

    // Simulación de tendencias locales
    const trends: InventoryTrends = {
      totalMovements: {
        current: movements.length,
        previous: Math.floor(movements.length * 0.9),
        percentChange: 11.1 // Simulado: +11.1%
      },
      entries: {
        current: totalEntries,
        previous: Math.floor(totalEntries * 0.85),
        percentChange: 17.6 // Simulado: +17.6%
      },
      exits: {
        current: totalExits,
        previous: Math.floor(totalExits * 0.95),
        percentChange: 5.3 // Simulado: +5.3%
      }
    };

    // Simulación de predicciones locales
    const topProducts = products
      .sort((a, b) => (b.stock < b.minStock ? 1 : 0) - (a.stock < a.minStock ? 1 : 0))
      .slice(0, 3)
      .map(p => ({
        productId: p.id,
        productName: p.name,
        currentStock: p.stock,
        averageConsumption: Math.random() * 1.5 + 0.5, // Simulado
        daysUntilReorder: Math.floor(Math.random() * 15 + 5) // Simulado
      }));

    const predictions: InventoryPredictions = {
      upcomingReorders: topProducts,
      salesForecast: {
        thisMonth: Math.round(totalExits * 1.1),
        nextMonth: Math.round(totalExits * 1.2)
      }
    };

    return {
      totalProducts,
      totalStock,
      lowStockCount,
      averagePrice,
      trends,
      predictions,
      stockHealth: determineStockHealth(lowStockCount, totalProducts),
      isFromApi: false
    };
  }, [inventoryApiStats, products, movements]);

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
    inventoryStatsLoading,
    inventoryStatsError,

    // Acciones
    setSelectedProductId,
    setFilters,
    resetFilters,
    requestSort,

    // Helpers
    getProductById: (id: string) => products.find(p => p.id === id),
    getCategoryById: (id: string) => categories.find(c => c.id === id),
    getSupplierById: (supplierId: string) => suppliers.find(s => s.id === supplierId),

    // Refresh de datos
    refreshProducts: fetchProducts,
    refreshCategories: fetchCategories,
    refreshSuppliers: fetchSuppliers,
    refreshMovements: fetchMovements,
  };
}
