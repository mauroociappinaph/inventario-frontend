import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Crear una instancia de axios con configuración predeterminada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage (solo en el cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar las respuestas
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, extraer los datos
    return response.data;
  },
  (error) => {
    console.error("Error en la petición API:", error);

    // Manejar errores comunes
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;
      const responseData = error.response.data || {};

      console.log("Respuesta de error del servidor:", responseData);

      // Si es un error de autenticación (401), redirigir al login
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Redirigir a la página de login si no estamos ya en ella
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }

      // Construir un objeto de error más detallado
      return Promise.reject({
        status: status,
        message: responseData.message || getStatusMessage(status),
        errors: responseData.errors || [],
        data: responseData,
        timestamp: new Date().toISOString(),
        path: error.config?.url || 'unknown',
        method: error.config?.method?.toUpperCase() || 'UNKNOWN',
      });
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      // Esto puede ser un problema de red, servidor caído, o CORS
      const isNetworkError = !window.navigator.onLine;

      console.log("Error de red o servidor:", error.request);

      return Promise.reject({
        status: 503,
        message: isNetworkError
          ? 'No hay conexión a internet. Por favor verifique su conexión e intente nuevamente.'
          : 'No se pudo conectar con el servidor. Por favor intente más tarde.',
        timestamp: new Date().toISOString(),
        path: error.config?.url || 'unknown',
        method: error.config?.method?.toUpperCase() || 'UNKNOWN',
      });
    } else {
      // Algo ocurrió en la configuración de la solicitud que desencadenó un error
      console.log("Error general de solicitud:", error.message);

      return Promise.reject({
        status: 500,
        message: error.message || 'Error al procesar la solicitud.',
        timestamp: new Date().toISOString(),
        originalError: error.toString(),
      });
    }
  }
);

// Función auxiliar para obtener mensajes por código de estado
function getStatusMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    400: 'La solicitud contiene datos inválidos.',
    401: 'No autorizado. Por favor inicie sesión nuevamente.',
    403: 'No tiene permisos para acceder a este recurso.',
    404: 'El recurso solicitado no fue encontrado.',
    405: 'Método no permitido.',
    408: 'Tiempo de espera agotado para la solicitud.',
    409: 'Conflicto con el estado actual del recurso.',
    422: 'No se pudo procesar la solicitud debido a errores de validación.',
    429: 'Demasiadas solicitudes. Por favor intente más tarde.',
    500: 'Error interno del servidor.',
    502: 'Error de puerta de enlace.',
    503: 'Servicio no disponible temporalmente.',
    504: 'Tiempo de espera de la puerta de enlace agotado.'
  };

  return statusMessages[status] || `Error en la solicitud (${status})`;
}

// Interfaces para tipado

// Tipo para posibles estados de productos
export type ProductStatus = 'active' | 'inactive'; // Frontend
export type BackendProductStatus = 'activo' | 'inactivo'; // Backend

// Interfaces para DTOs
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  entryDate: string; // ISO string
  category?: string;
  minStock?: number;
  userId?: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
  timestamp?: string;
  path?: string;
  method?: string;
  originalError?: string;
}

// Servicio de autenticación
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },
  register: async (userData: { email: string; password: string; companyName: string; phone?: string }) => {
    return api.post('/auth/register', userData);
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
};

// Función para convertir el estado del backend al frontend
export const convertStatusToFrontend = (backendStatus: string): ProductStatus => {
  return backendStatus === 'activo' ? 'active' : 'inactive';
};

// Servicio de productos
export const productService = {
  getProducts: async (page = 1, limit = 10, userId?: string) => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return api.get(`/products?page=${page}&limit=${limit}&userId=${userId}`);
  },
  getProductById: async (id: string) => {
    return api.get(`/products/${id}`);
  },
  createProduct: async (productData: Partial<CreateProductDto>) => {
    try {
      // Convertir la fecha de entrada a un formato que el backend pueda interpretar como Date
      let entryDate: Date;

      // Validar y convertir la fecha de entrada
      if (productData.entryDate) {
        try {
          entryDate = new Date(productData.entryDate);
          // Verificar si es una fecha válida
          if (isNaN(entryDate.getTime())) {
            // Si no es válida, usar fecha actual
            entryDate = new Date();
          }
        } catch {
          // En caso de error al parsear, usar fecha actual
          entryDate = new Date();
        }
      } else {
        // Si no hay fecha, usar la actual
        entryDate = new Date();
      }

      // Creamos un objeto exactamente con la estructura que espera el DTO del backend
      const dtoData: CreateProductDto = {
        name: productData.name?.trim() || '',
        price: Math.max(0, Number(productData.price || 0)),
        stock: Math.max(0, Number(productData.stock || 0)),
        minStock: Math.max(0, Number(productData.minStock || Math.max(1, Math.floor(Number(productData.stock || 0) * 0.1)))),
        entryDate: entryDate.toISOString(),
        category: productData.category?.trim() || '',
        userId: productData.userId || '',
      };

      console.log('Enviando datos al backend:', JSON.stringify(dtoData, null, 2));

      const response = await api.post('/products', dtoData);
      console.log('Respuesta exitosa del backend:', response);
      return response;
    } catch (error: unknown) {
      console.error('Error al crear producto en el backend:', error);

      // Usamos typeof para verificar el tipo antes de acceder a propiedades
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: any } };
        if (axiosError.response?.data) {
          console.error('Detalles de la respuesta:', axiosError.response.data);
        }
      }

      // Re-lanzar el error para que sea manejado por el siguiente nivel
      throw error;
    }
  },
  updateProduct: async (id: string, productData: Partial<CreateProductDto>) => {
    return api.put(`/products/${id}`, productData);
  },
  deleteProduct: async (id: string) => {
    return api.delete(`/products/${id}`);
  },
};

// Servicio de inventario
export const inventoryService = {
  getInventoryMovements: async () => {
    return api.get('/inventory');
  },
  createInventoryMovement: async (movementData: any) => {
    return api.post('/inventory', movementData);
  },
  getInventoryMovementById: async (id: string) => {
    return api.get(`/inventory/${id}`);
  },
};

// Servicio de stock
export const stockService = {
  getCurrentStock: async (productId: string) => {
    return api.get(`/stock/${productId}`);
  },
};

// Nuevos servicios para proveedores
export const supplierService = {
  getSuppliers: async (page = 1, limit = 10) => {
    return api.get(`/suppliers?page=${page}&limit=${limit}`);
  },
  getSupplierById: async (id: string) => {
    return api.get(`/suppliers/${id}`);
  },
  createSupplier: async (supplierData: any) => {
    return api.post('/suppliers', supplierData);
  },
  updateSupplier: async (id: string, supplierData: any) => {
    return api.put(`/suppliers/${id}`, supplierData);
  },
  deleteSupplier: async (id: string) => {
    return api.delete(`/suppliers/${id}`);
  },
  getSuppliersByCategory: async (category: string) => {
    return api.get(`/suppliers/category/${category}`);
  },
  getSuppliersByProduct: async (productId: string) => {
    return api.get(`/suppliers/product/${productId}`);
  },
  addProductToSupplier: async (supplierId: string, productId: string) => {
    return api.put(`/suppliers/${supplierId}/products/${productId}`);
  },
  removeProductFromSupplier: async (supplierId: string, productId: string) => {
    return api.delete(`/suppliers/${supplierId}/products/${productId}`);
  }
};

// Nuevos servicios para pedidos
export const orderService = {
  getOrders: async (page = 1, limit = 10, status?: string, supplierId?: string) => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (supplierId) url += `&supplierId=${supplierId}`;
    return api.get(url);
  },
  getOrderById: async (id: string) => {
    return api.get(`/orders/${id}`);
  },
  createOrder: async (orderData: any) => {
    return api.post('/orders', orderData);
  },
  updateOrder: async (id: string, orderData: any) => {
    return api.put(`/orders/${id}`, orderData);
  },
  deleteOrder: async (id: string) => {
    return api.delete(`/orders/${id}`);
  },
};
