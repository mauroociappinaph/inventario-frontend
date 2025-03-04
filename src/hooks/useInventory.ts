import { useAuth } from '@/context/auth-context';
import { useInventoryStore } from '@/store/useInventoryStore';
import { Product } from '@/types/inventory.interfaces';
import axios, { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';

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
  roi?: {
    avgRoi: number;
    topRoiProducts?: any[];
  };
  isFromApi: boolean;
}

interface InventoryApiStats {
  [key: string]: any;
  trends?: {
    [key: string]: any;
  };
  movements?: {
    [key: string]: any;
  };
  general?: {
    [key: string]: any;
  };
}

interface Filters {
  search: string;
  category: string;
  stockStatus: string;
}

/**
 * Hook personalizado para manejar el inventario con funcionalidades adicionales
 * como filtrado, ordenamiento y cálculos.
 */
export function useInventory() {
  const { user } = useAuth();
  const {
    products,
    stockMovements,
    isLoading,
    error,
    fetchProducts,
    fetchStockMovements
  } = useInventoryStore();

  // Estado para filtros
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    stockStatus: 'todos'
  });

  // Estado para estadísticas
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

  // Estado para producto seleccionado
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          await Promise.all([
            fetchProducts(user.id),
            fetchStockMovements(user.id)
          ]);
        } catch (error) {
          console.error('Error al cargar datos:', error);
        }
      }
    };

    loadData();
  }, [user?.id, fetchProducts, fetchStockMovements]);

  // Cargar estadísticas desde la API
  useEffect(() => {
    const fetchInventoryStats = async () => {
      setInventoryStatsLoading(true);
      setInventoryStatsError(null);

      try {
        // Obtener token del localStorage (asumiendo que se guarda allí)
        const token = localStorage.getItem('auth_token');

        if (!token) {
          console.warn('🔑 [useInventory] No se encontró token de autenticación para obtener estadísticas');
          setInventoryStatsLoading(false);
          return;
        }

        console.log('🔍 [useInventory] Solicitando estadísticas generales de inventario...');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/inventory/statistics`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('📊 [useInventory] Respuesta de estadísticas generales recibida:', response.data);

        // Obtener también los datos específicos del ROI
        console.log('🔍 [useInventory] Solicitando estadísticas específicas de ROI...');
        const roiResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/inventory/statistics/roi`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('📊 [useInventory] Datos de ROI recibidos (estructura completa):', JSON.stringify(roiResponse.data, null, 2));

        let inventoryData = null;
        if (response.data && response.data.data) {
          inventoryData = response.data.data;
        } else if (response.data) {
          inventoryData = response.data;
        } else {
          throw new Error('Formato de respuesta inesperado');
        }

        // Incorporar los datos de ROI
        if (roiResponse.data && roiResponse.data.roi) {
          console.log('✅ [useInventory] Estructura de ROI estándar encontrada:', roiResponse.data.roi);
          console.log('   [useInventory] ROI promedio recibido:', roiResponse.data.roi.avgRoi);
          inventoryData.roi = roiResponse.data.roi;
        } else if (roiResponse.data) {
          console.log('⚠️ [useInventory] Estructura de ROI no estándar:', roiResponse.data);
          // Intentar extraer directamente
          if ('avgRoi' in roiResponse.data) {
            console.log('✅ [useInventory] avgRoi encontrado directamente:', roiResponse.data.avgRoi);
            inventoryData.roi = roiResponse.data;
          } else {
            // Buscar más profundo
            const deepSearch = (obj: any): any => {
              if (!obj || typeof obj !== 'object') return null;

              for (const key in obj) {
                if (key === 'avgRoi') {
                  console.log(`✅ [useInventory] avgRoi encontrado en la respuesta: ${obj[key]}`);
                  return { avgRoi: obj[key], topRoiProducts: obj.topRoiProducts || [] };
                }

                if (typeof obj[key] === 'object') {
                  const result = deepSearch(obj[key]);
                  if (result) return result;
                }
              }

              return null;
            };

            const roiData = deepSearch(roiResponse.data);
            if (roiData) {
              console.log('✅ [useInventory] Datos de ROI encontrados mediante búsqueda profunda:', roiData);
              inventoryData.roi = roiData;
            } else {
              console.warn('⚠️ [useInventory] No se encontraron datos de ROI en la respuesta');
            }
          }
        }

        console.log('📊 [useInventory] Datos finales de inventario con ROI:', JSON.stringify(inventoryData.roi, null, 2));
        setInventoryApiStats(inventoryData);
      } catch (err) {
        console.error('❌ [useInventory] Error al obtener estadísticas de inventario:', err);

        // Manejo de errores mejorado con detalles específicos
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          console.log("❌ [useInventory] Detalles completos del error:", {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers,
            url: axiosError.config?.url
          });

          if (axiosError.response?.status === 500) {
            setInventoryStatsError(`Error interno del servidor: ${axiosError.message}`);
          } else if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            setInventoryStatsError('Error de autenticación: Sesión expirada o sin permisos');
          } else if (axiosError.response?.status === 404) {
            setInventoryStatsError('Endpoint no encontrado: La ruta de API solicitada no existe');
          } else {
            setInventoryStatsError(`Error en la solicitud: ${axiosError.message}`);
          }
        } else {
          setInventoryStatsError(`No se pudieron cargar las estadísticas del servidor: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
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
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category === filters.category
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
      console.log('📊 [useInventory] Usando estadísticas de API para calcular ROI');

      // Verificar si tenemos datos de ROI
      if (inventoryApiStats.roi) {
        console.log('✅ [useInventory] Encontrados datos de ROI en inventoryApiStats:', inventoryApiStats.roi);
        console.log('   [useInventory] avgRoi =', inventoryApiStats.roi.avgRoi);
      } else {
        console.warn('⚠️ [useInventory] No se encontraron datos de ROI en inventoryApiStats');
      }

      // Procesar tendencias con datos mejorados
      const apiTrends = inventoryApiStats.trends || {} as Record<string, any>;
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
    const movements = Array.isArray(stockMovements) ? stockMovements : [];
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

    // Simulación de ROI para datos locales
    const simulatedRoi = {
      avgRoi: 0, // Cambiado de 250 a 0 para que no muestre un valor incorrecto cuando no hay datos reales
      topRoiProducts: products.slice(0, 5).map(p => ({
        _id: p.id,
        productName: p.name,
        totalSalidas: Math.floor(Math.random() * 30 + 10),
        totalValorSalidas: p.price * (Math.floor(Math.random() * 30 + 10)),
        costoPromedio: p.price * 0.6,
        roi: 0 // Cambiado para no mostrar valores simulados altos
      }))
    };

    return {
      totalProducts,
      totalStock,
      lowStockCount,
      averagePrice,
      trends,
      predictions,
      roi: simulatedRoi,
      stockHealth: determineStockHealth(lowStockCount, totalProducts),
      isFromApi: false
    };
  }, [inventoryApiStats, products, stockMovements]);

  // Función para resetear filtros
  const resetFilters = () => setFilters({
    search: '',
    category: '',
    stockStatus: 'todos'
  });

  return {
    // Datos
    products,
    stockMovements,
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
    getCategoryById: (id: string) => {
      const categories = useInventoryStore.getState().getCategories();
      return categories.find(c => c === id);
    },

    // Refresh de datos
    refreshProducts: fetchProducts,
    refreshStockMovements: fetchStockMovements,
  };
}
