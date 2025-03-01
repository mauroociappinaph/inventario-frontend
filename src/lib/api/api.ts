import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    // Manejar errores comunes
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;
      const responseData = error.response.data || {};

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

// Servicio de productos
export const productService = {
  getProducts: async (page = 1, limit = 10) => {
    return api.get(`/products?page=${page}&limit=${limit}`);
  },
  getProductById: async (id: string) => {
    return api.get(`/products/${id}`);
  },
  createProduct: async (productData: any) => {
    return api.post('/products', productData);
  },
  updateProduct: async (id: string, productData: any) => {
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
  updateOrderStatus: async (id: string, statusData: any) => {
    return api.put(`/orders/${id}/status`, statusData);
  },
  getOrderStatistics: async () => {
    return api.get('/orders/statistics');
  },
  getOrdersBySupplier: async (supplierId: string) => {
    return api.get(`/orders/supplier/${supplierId}`);
  }
};

// Servicio para la gestión de usuarios
export const userService = {
  getUsers: async (page = 1, limit = 10, role?: string) => {
    let url = `/users?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    return api.get(url);
  },
  getUserById: async (id: string) => {
    return api.get(`/users/${id}`);
  },
  createUser: async (userData: any) => {
    return api.post('/users', userData);
  },
  updateUser: async (id: string, userData: any) => {
    return api.put(`/users/${id}`, userData);
  },
  deleteUser: async (id: string) => {
    return api.delete(`/users/${id}`);
  },
  getUsersByRole: async (role: string) => {
    return api.get(`/users/role/${role}`);
  },
  updateUserRole: async (id: string, roleData: any) => {
    return api.put(`/users/${id}/role`, roleData);
  }
};

export default api;
