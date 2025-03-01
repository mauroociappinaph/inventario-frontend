import axios from 'axios';
import { API_URL } from '@/config/api';
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

      const response = await API.get('/products/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
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
        throw new Error('No se encontró token de autenticación');
      }

      const response = await API.get('/inventory/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de inventario:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Combina todas las estadísticas para el dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Intentamos obtener datos de productos, y si falla usamos datos simulados
      const productsStats = await this.getProductStats().catch(error => {
        console.warn('Usando datos simulados para productos:', error.message);
        return this.getSimulatedProductStats();
      });

      // Intentamos obtener datos de órdenes, y si falla usamos datos simulados
      const ordersStats = await this.getOrderStats().catch(error => {
        console.warn('Usando datos simulados para órdenes:', error.message);
        return this.getSimulatedOrderStats();
      });

      // Intentamos obtener datos de inventario, y si falla usamos datos simulados
      const inventoryStats = await this.getInventoryStats().catch(error => {
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
      throw error;
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

  private getSimulatedInventoryStats(): InventoryStats {
    return {
      general: {
        totalProducts: 1250,
        activeProducts: 980,
        lowStockProducts: 120,
        stockValue: 142500
      },
      movement: {
        totalMovements: 320,
        entriesCount: 180,
        exitsCount: 125,
        transfersCount: 15
      },
      topMovedProducts: [
        { productId: '1', productName: 'Camiseta Básica', totalQuantity: 250, entriesCount: 150, exitsCount: 100 },
        { productId: '2', productName: 'Pantalón Vaquero', totalQuantity: 180, entriesCount: 100, exitsCount: 80 },
        { productId: '3', productName: 'Zapatillas Deportivas', totalQuantity: 150, entriesCount: 90, exitsCount: 60 },
        { productId: '4', productName: 'Bolso de Mano', totalQuantity: 120, entriesCount: 70, exitsCount: 50 },
        { productId: '5', productName: 'Gafas de Sol', totalQuantity: 100, entriesCount: 60, exitsCount: 40 }
      ],
      stockByCategory: [
        { category: 'Ropa', itemCount: 450, totalStock: 2250, totalValue: 56250 },
        { category: 'Calzado', itemCount: 300, totalStock: 1500, totalValue: 37500 },
        { category: 'Accesorios', itemCount: 250, totalStock: 1250, totalValue: 31250 },
        { category: 'Deportes', itemCount: 150, totalStock: 750, totalValue: 18750 },
        { category: 'Electrónica', itemCount: 100, totalStock: 500, totalValue: 12500 }
      ]
    };
  }
}

export const dashboardService = new DashboardService();
