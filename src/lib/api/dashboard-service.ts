import { API_URL } from '@/config/api';
import axios from 'axios';
import authService from './auth-service';

const API = axios.create({
  baseURL: API_URL,
});

// Interfaces para las estadísticas
export interface ProductStats {
  summary: {
    totalProducts: number;
    activeProducts: number;
    newProducts: number;
    percentageChange: number;
    productsWithNoStock: number;
    productsWithLowStock: number;
    stockLevel: number;
    revenue: number;
    avgPrice: number;
    percentActiveProducts: number;
  };
  categories: {
    name: string;
    count: number;
    percentage: number;
    avgPrice: number;
  }[];
  topExpensiveProducts: {
    id: string;
    name: string;
    price: number;
    category: string;
  }[];
  stockTrend: {
    date: string;
    totalStock: number;
    totalValue: number;
  }[];
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  percentageChange: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    date: string;
  }>;
  ordersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

export interface InventoryStats {
  general: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    stockValue: number;
  };
  movement: {
    totalMovements: number;
    entriesCount: number;
    exitsCount: number;
    transfersCount: number;
  };
  topMovedProducts: {
    productId: string;
    productName: string;
    totalQuantity: number;
    entriesCount: number;
    exitsCount: number;
  }[];
  stockByCategory: {
    category: string;
    itemCount: number;
    totalStock: number;
    totalValue: number;
  }[];
  roi?: {
    avgRoi: number;
    topRoiProducts?: {
      _id: string;
      productName: string;
      totalSalidas: number;
      totalValorSalidas: number;
      costoPromedio: number;
      roi: number;
    }[];
  };
}

export interface DashboardStats {
  products: ProductStats;
  orders: OrderStats;
  inventory: InventoryStats;
}

class DashboardService {
  // Obtiene estadísticas de productos
  async getProductStats(): Promise<ProductStats> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await API.get('/products/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Verificar si la respuesta tiene la estructura esperada
      // Si no, transformarla al formato necesario
      const responseData = response.data;

      if (!responseData || !responseData.summary || typeof responseData.summary.totalProducts === 'undefined') {
        console.warn('La respuesta de la API no tiene el formato esperado, transformando datos...');

        // Extraer los datos disponibles o usar valores por defecto
        const extractedData = {
          summary: {
            totalProducts: responseData?.totalProducts || 0,
            activeProducts: responseData?.activeProducts || 0,
            newProducts: responseData?.newProducts || 0,
            percentageChange: responseData?.percentageChange || 0,
            productsWithNoStock: responseData?.productsWithNoStock || 0,
            productsWithLowStock: responseData?.lowStockProducts || 0,
            stockLevel: responseData?.stockLevel || 0,
            revenue: responseData?.revenue || 0,
            avgPrice: responseData?.avgPrice || 0,
            percentActiveProducts: responseData?.percentActiveProducts || 0
          },
          categories: responseData?.categories || [],
          topExpensiveProducts: responseData?.topProducts || [],
          stockTrend: responseData?.stockTrend || []
        };

        return extractedData;
      }

      return responseData;
    } catch (error) {
      console.error('Error al obtener estadísticas de productos:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Obtiene estadísticas de órdenes
  async getOrderStats(): Promise<OrderStats> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await API.get('/orders/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de órdenes:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Obtiene estadísticas de inventario
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      const token = authService.getToken();
      if (!token) {
        console.warn('⚠️ [DashboardService] No hay token de autenticación disponible.');
        // Retornar datos simulados en lugar de lanzar un error
        console.log('🔄 [DashboardService] Usando datos simulados como fallback...');
        return this.getSimulatedInventoryStats();
      }

      console.log('🔍 [DashboardService] Solicitando estadísticas generales de inventario...');
      const response = await API.get('/inventory/statistics', {
        headers: { Authorization: `Bearer ${token}` },
        // Configuración de tiempo de espera
        timeout: 10000 // 10 segundos
      });
      console.log('📊 [DashboardService] Respuesta de estadísticas generales recibida:', response.data);

      // Intentar obtener los datos de ROI de manera específica
      let roiData = undefined;
      try {
        console.log('🔍 [DashboardService] Solicitando datos específicos de ROI...');
        const roiResponse = await API.get('/inventory/statistics/roi', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📊 [DashboardService] Respuesta de ROI completa:', JSON.stringify(roiResponse.data, null, 2));

        if (roiResponse.data && roiResponse.data.roi) {
          roiData = roiResponse.data.roi;
          console.log('✅ [DashboardService] Datos de ROI obtenidos exitosamente:', JSON.stringify(roiData, null, 2));
          console.log('   [DashboardService] ROI promedio:', roiData.avgRoi);
        } else if (roiResponse.data && typeof roiResponse.data === 'object') {
          console.log('⚠️ [DashboardService] Estructura de ROI no estándar, buscando otras opciones...');

          // Búsqueda en primer nivel
          if ('avgRoi' in roiResponse.data) {
            console.log('✅ [DashboardService] avgRoi encontrado directamente en la respuesta:', roiResponse.data.avgRoi);
            roiData = roiResponse.data;
          } else {
            // Búsqueda más profunda
            for (const key in roiResponse.data) {
              const value = roiResponse.data[key];
              if (value && typeof value === 'object' && 'avgRoi' in value) {
                console.log(`✅ [DashboardService] avgRoi encontrado en atributo ${key}:`, value.avgRoi);
                roiData = value;
                break;
              }
            }
          }
        }
      } catch (roiError) {
        console.warn('⚠️ [DashboardService] Error al obtener datos específicos de ROI:', roiError);
      }

      // Verificar si la respuesta tiene la estructura esperada
      const responseData = response.data;

      if (!responseData || !responseData.movement || typeof responseData.movement.entriesCount === 'undefined') {
        console.warn('⚠️ [DashboardService] La respuesta de inventario no tiene el formato esperado, transformando datos...');

        // Extraer los datos disponibles o usar valores por defecto
        const extractedData: InventoryStats = {
          general: {
            totalProducts: responseData?.general?.totalProducts || responseData?.totalProducts || 0,
            activeProducts: responseData?.general?.activeProducts || responseData?.activeProducts || 0,
            lowStockProducts: responseData?.general?.lowStockProducts || responseData?.lowStockProducts || 0,
            stockValue: responseData?.general?.stockValue || responseData?.stockValue || 0
          },
          movement: {
            totalMovements: responseData?.movement?.totalMovements || responseData?.totalMovements || 0,
            entriesCount: responseData?.movement?.entriesCount || responseData?.entriesCount || 0,
            exitsCount: responseData?.movement?.exitsCount || responseData?.exitsCount || 0,
            transfersCount: responseData?.movement?.transfersCount || responseData?.transfersCount || 0
          },
          topMovedProducts: responseData?.topMovedProducts || [],
          stockByCategory: responseData?.stockByCategory || [],
          // Usar los datos específicos de ROI si están disponibles
          roi: roiData || responseData?.roi
        };

        console.log('📊 [DashboardService] Datos extractados a devolver:', JSON.stringify(extractedData.roi, null, 2));
        return extractedData;
      }

      // Si los datos de ROI están disponibles, reemplazar los que vienen en la respuesta general
      if (roiData) {
        console.log('📊 [DashboardService] Actualizando datos de ROI en respuesta general:', JSON.stringify(roiData, null, 2));
        responseData.roi = roiData;
      } else {
        console.log('�� [DashboardService] Usando datos de ROI de respuesta general:', responseData.roi);
      }

      return responseData;
    } catch (error) {
      console.error('❌ [DashboardService] Error al obtener estadísticas de inventario:', error);

      // Verificar si es un error de autenticación
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('⚠️ [DashboardService] Error de autenticación (401). Token inválido o expirado.');

        // Limpiar token inválido
        localStorage.removeItem('auth_token');

        // Redirigir al login sólo si estamos en una página protegida
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard') || currentPath.includes('/user-dashboard')) {
          console.log('🔄 [DashboardService] Redirigiendo a login debido a sesión expirada...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }

      // En cualquier caso de error, retornar datos simulados como fallback
      console.log('🔄 [DashboardService] Retornando datos simulados debido al error...');
      return this.getSimulatedInventoryStats();
    }
  }

  // Combina todas las estadísticas para el dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Obteniendo estadísticas de dashboard...');

      // Intentamos obtener datos de productos, y si falla usamos datos simulados
      const productsStats = await this.getProductStats()
        .catch(error => {
          console.warn('Usando datos simulados para productos:', error.message);
          return this.getSimulatedProductStats();
        });

      // Intentamos obtener datos de órdenes, y si falla usamos datos simulados
      const ordersStats = await this.getOrderStats()
        .catch(error => {
          console.warn('Usando datos simulados para órdenes:', error.message);
          return this.getSimulatedOrderStats();
        });

      // Intentamos obtener datos de inventario, y si falla usamos datos simulados
      const inventoryStats = await this.getInventoryStats()
        .catch(error => {
          console.warn('Usando datos simulados para inventario:', error.message);
          return this.getSimulatedInventoryStats();
        });

      return {
        products: productsStats,
        orders: ordersStats,
        inventory: inventoryStats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      return {
        products: this.getSimulatedProductStats(),
        orders: this.getSimulatedOrderStats(),
        inventory: this.getSimulatedInventoryStats()
      };
    }
  }

  // Maneja errores de la API de forma centralizada
  private handleApiError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status;
        if (status === 401 || status === 403) {
          console.warn('Error de autenticación al acceder a la API');
          // Si hay un callback de logout, lo llamaría aquí
        } else if (status === 404) {
          console.warn('El recurso solicitado no existe');
        } else if (status >= 500) {
          console.error('Error interno del servidor');
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor');
      }
    }
  }

  // Datos simulados para cuando falla la API
  private getSimulatedProductStats(): ProductStats {
    return {
      summary: {
        totalProducts: 1250,
        activeProducts: 980,
        newProducts: 45,
        percentageChange: 12.5,
        productsWithNoStock: 75,
        productsWithLowStock: 120,
        stockLevel: 5600,
        revenue: 142500,
        avgPrice: 85.50,
        percentActiveProducts: 78.4
      },
      categories: [
        { name: 'Electrónica', count: 350, percentage: 28, avgPrice: 120.75 },
        { name: 'Hogar', count: 280, percentage: 22.4, avgPrice: 75.30 },
        { name: 'Oficina', count: 210, percentage: 16.8, avgPrice: 45.20 },
        { name: 'Juguetes', count: 175, percentage: 14, avgPrice: 35.60 },
        { name: 'Deportes', count: 150, percentage: 12, avgPrice: 95.40 }
      ],
      topExpensiveProducts: [
        { id: '1', name: 'Laptop Premium', price: 1299.99, category: 'Electrónica' },
        { id: '2', name: 'Smartphone Pro', price: 999.99, category: 'Electrónica' },
        { id: '3', name: 'Cámara DSLR', price: 849.99, category: 'Electrónica' },
        { id: '4', name: 'Bicicleta de Montaña', price: 749.99, category: 'Deportes' },
        { id: '5', name: 'Televisor 4K', price: 699.99, category: 'Electrónica' }
      ],
      stockTrend: Array(30).fill(0).map((_, i) => ({
        date: `2023-${Math.floor(i / 30) + 1}-${(i % 30) + 1}`,
        totalStock: 5000 + Math.floor(Math.random() * 1000),
        totalValue: 120000 + Math.floor(Math.random() * 20000)
      }))
    };
  }

  private getSimulatedOrderStats(): OrderStats {
    return {
      totalOrders: 850,
      totalRevenue: 68500,
      averageOrderValue: 80.59,
      percentageChange: 15.3,
      recentOrders: [
        { id: '101', customerName: 'Ana López', total: 125.30, status: 'completed', date: '2023-03-15' },
        { id: '102', customerName: 'Carlos Ruiz', total: 89.99, status: 'processing', date: '2023-03-14' },
        { id: '103', customerName: 'María García', total: 210.50, status: 'completed', date: '2023-03-13' },
        { id: '104', customerName: 'Juan Pérez', total: 45.75, status: 'shipped', date: '2023-03-12' },
        { id: '105', customerName: 'Laura Díaz', total: 325.00, status: 'processing', date: '2023-03-11' }
      ],
      ordersByStatus: [
        { status: 'completed', count: 450, percentage: 52.9 },
        { status: 'processing', count: 150, percentage: 17.6 },
        { status: 'shipped', count: 175, percentage: 20.6 },
        { status: 'cancelled', count: 75, percentage: 8.8 }
      ],
      revenueByMonth: [
        { month: 'Enero', revenue: 12500 },
        { month: 'Febrero', revenue: 15800 },
        { month: 'Marzo', revenue: 14300 },
        { month: 'Abril', revenue: 16200 },
        { month: 'Mayo', revenue: 17500 },
        { month: 'Junio', revenue: 18100 }
      ]
    };
  }

  // Datos simulados para inventario
  getSimulatedInventoryStats(): InventoryStats {
    return {
      general: {
        totalProducts: 780,
        activeProducts: 730,
        lowStockProducts: 25,
        stockValue: 145800
      },
      movement: {
        totalMovements: 320,
        entriesCount: 180,
        exitsCount: 140,
        transfersCount: 0
      },
      topMovedProducts: [
        {
          productId: 'sim-1',
          productName: 'Producto Simulado 1',
          totalQuantity: 45,
          entriesCount: 25,
          exitsCount: 20
        },
        {
          productId: 'sim-2',
          productName: 'Producto Simulado 2',
          totalQuantity: 38,
          entriesCount: 22,
          exitsCount: 16
        },
        {
          productId: 'sim-3',
          productName: 'Producto Simulado 3',
          totalQuantity: 32,
          entriesCount: 18,
          exitsCount: 14
        },
        {
          productId: 'sim-4',
          productName: 'Producto Simulado 4',
          totalQuantity: 28,
          entriesCount: 16,
          exitsCount: 12
        },
        {
          productId: 'sim-5',
          productName: 'Producto Simulado 5',
          totalQuantity: 24,
          entriesCount: 14,
          exitsCount: 10
        }
      ],
      stockByCategory: [
        {
          category: 'Electrónicos',
          itemCount: 120,
          totalStock: 450,
          totalValue: 67500
        },
        {
          category: 'Moda',
          itemCount: 280,
          totalStock: 840,
          totalValue: 42000
        },
        {
          category: 'Hogar',
          itemCount: 220,
          totalStock: 660,
          totalValue: 36300
        }
      ],
      roi: {
        avgRoi: 0, // Cambiado de 85 a 0 para evitar mostrar datos simulados incorrectos
        topRoiProducts: [
          {
            _id: 'sim-roi-1',
            productName: 'Smartphone X Pro',
            totalSalidas: 25,
            totalValorSalidas: 25000,
            costoPromedio: 800,
            roi: 0 // Cambiado para no mostrar valores simulados altos
          },
          {
            _id: 'sim-roi-2',
            productName: 'Tablet Ultra',
            totalSalidas: 18,
            totalValorSalidas: 16200,
            costoPromedio: 600,
            roi: 0
          },
          {
            _id: 'sim-roi-3',
            productName: 'Audífonos Deluxe',
            totalSalidas: 40,
            totalValorSalidas: 8000,
            costoPromedio: 120,
            roi: 0
          },
          {
            _id: 'sim-roi-4',
            productName: 'Smart Watch',
            totalSalidas: 15,
            totalValorSalidas: 4500,
            costoPromedio: 200,
            roi: 0
          },
          {
            _id: 'sim-roi-5',
            productName: 'Cámara 4K',
            totalSalidas: 10,
            totalValorSalidas: 6500,
            costoPromedio: 400,
            roi: 0
          }
        ]
      }
    };
  }
}

export const dashboardService = new DashboardService();
