import axios from 'axios';
import { useLoading } from '@/hooks/useLoading';

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
      const response = await api.get('/inventory/statistics');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
};

export default inventoryService;
