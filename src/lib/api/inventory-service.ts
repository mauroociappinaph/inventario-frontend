import axios from 'axios';

// Obtener la URL base de la API desde las variables de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Configuración de axios con interceptores
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interfaz para los productos de inventario
export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  supplier: string;
  lastUpdated: string;
}

// Interfaz para las estadísticas de inventario
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

// Servicio para operaciones de inventario
const inventoryService = {
  // Obtener todos los productos del inventario
  async getProducts() {
    try {
      const response = await api.get<InventoryProduct[]>('/inventory');
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos del inventario:', error);
      throw error;
    }
  },

  // Obtener un producto específico
  async getProduct(id: string) {
    try {
      const response = await api.get<InventoryProduct>(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el producto ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo producto
  async createProduct(product: Omit<InventoryProduct, 'id'>) {
    try {
      const response = await api.post<InventoryProduct>('/inventory', product);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  // Actualizar un producto existente
  async updateProduct(id: string, product: Partial<InventoryProduct>) {
    try {
      const response = await api.put<InventoryProduct>(`/inventory/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el producto ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(id: string) {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el producto ${id}:`, error);
      throw error;
    }
  },

  // Obtener estadísticas del inventario
  async getStatistics() {
    try {
      console.log('🔍 [InventoryService] Solicitando estadísticas de inventario filtradas por usuario actual...');
      const response = await api.get<InventoryStats>('/inventory/statistics');
      console.log('📊 [InventoryService] Estadísticas recibidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [InventoryService] Error al obtener estadísticas:', error);
      // Devolver datos de respaldo en caso de error
      return {
        general: {
          totalProducts: 0,
          activeProducts: 0,
          lowStockProducts: 0,
          stockValue: 0
        },
        movement: {
          totalMovements: 0,
          entriesCount: 0,
          exitsCount: 0,
          transfersCount: 0
        },
        topMovedProducts: [],
        stockByCategory: [],
        roi: { avgRoi: 0, topRoiProducts: [] }
      };
    }
  },

  // Obtener estadísticas de ROI
  async getRoiStatistics() {
    try {
      console.log('🔍 [InventoryService] Solicitando estadísticas de ROI filtradas por usuario actual...');
      const response = await api.get('/inventory/statistics/roi');
      console.log('📊 [InventoryService] Estadísticas de ROI recibidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [InventoryService] Error al obtener estadísticas de ROI:', error);
      return { avgRoi: 0, topRoiProducts: [] };
    }
  }
};

export default inventoryService;
