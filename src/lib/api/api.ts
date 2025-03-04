import axios from 'axios';
import authServiceImport from './auth-service';
import { apiCache } from './cache';
import { connectionState, withRetry } from './sync-utils';

// Configuración base de axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Crear una instancia de axios con configuración predeterminada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para controlar si ya hay un intento de renovación en curso
let isRefreshing = false;
// Cola de promesas pendientes que esperan la renovación del token
let refreshSubscribers: Array<(token: string) => void> = [];

// Función para procesar la cola de peticiones pendientes
const processQueue = (error: any, token: string | null = null) => {
  refreshSubscribers.forEach(callback => {
    if (token) {
      callback(token);
    }
  });
  refreshSubscribers = [];
};

// Función para añadir peticiones a la cola
const addSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

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

    // Para solicitudes POST que van a /inventory, verificamos que el productId exista
    if (config.method === 'post' && config.url === '/inventory' && config.data) {
      console.log('Interceptor - Datos enviados a /inventory:',
        typeof config.data === 'string' ? JSON.parse(config.data) : config.data
      );

      const data = typeof config.data === 'string'
        ? JSON.parse(config.data)
        : config.data;

      if (!data.productId) {
        console.error('Interceptor - Error: falta productId en la solicitud a /inventory');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar las respuestas y renovar tokens
api.interceptors.response.use(
  (response) => {
    // Actualizar el estado de la conexión
    connectionState.lastSuccessTime = Date.now();
    connectionState.consecutiveFailures = 0;
    connectionState.hasBackendConnection = true;

    // Si la respuesta es exitosa, extraer los datos
    return response.data;
  },
  async (error) => {
    console.error("Error en la petición API:", error);

    // Manejar errores comunes
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;
      const responseData = error.response.data || {};

      console.log("Respuesta de error del servidor:", responseData);

      // Si es un error de autenticación (401), intentar renovar el token
      if (status === 401) {
        const originalRequest = error.config;

        // Evitar intentos de renovación en peticiones de login/refresh
        const isAuthRequest = originalRequest.url.includes('/auth/login') ||
                             originalRequest.url.includes('/auth/refresh-token');

        // Establecer un límite de intentos para evitar bucles infinitos
        if (!originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        const MAX_RETRY_ATTEMPTS = 2; // Máximo 2 intentos de reintento

        if (!isAuthRequest && !originalRequest._retry && originalRequest._retryCount < MAX_RETRY_ATTEMPTS) {
          // Si no estamos ya renovando, iniciar proceso de renovación
          if (!isRefreshing) {
            isRefreshing = true;
            originalRequest._retry = true;
            originalRequest._retryCount++;

            console.log(`Intento de renovación #${originalRequest._retryCount}. Token expirado o inválido.`);

            try {
              // Intentar renovar el token
              const authResponse = await authServiceImport.refreshToken();
              const newToken = authResponse.token;

              // Si se renueva exitosamente, actualizar el token en la petición original
              if (newToken) {
                console.log("Token renovado exitosamente. Reintentando petición...");
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Procesar cola de peticiones pendientes
                processQueue(null, newToken);
                isRefreshing = false;

                // Reintentar la petición original con el nuevo token
                return api(originalRequest);
              }
            } catch (refreshError) {
              console.error("Error al renovar token:", refreshError);
              // Procesar cola con error
              processQueue(refreshError, null);
              isRefreshing = false;

              // Marcar la conexión como problemática
              connectionState.hasBackendConnection = false;
              connectionState.lastFailureTime = Date.now();
              connectionState.consecutiveFailures++;

              // No redirigir automáticamente, permitir que el usuario siga usando la app
              // con datos almacenados en caché y reintentará más tarde
              console.log("Error de renovación de token. Se usarán datos en caché si están disponibles.");

              return Promise.reject({
                ...error,
                isAuthError: true,
                message: "Error de autenticación. Se usarán datos en caché."
              });
            }
          } else {
            // Si ya estamos renovando, encolar esta petición
            console.log("Encolando petición mientras se renueva el token...");
            return new Promise(resolve => {
              addSubscriber(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalRequest));
              });
            });
          }
        } else if (isAuthRequest) {
          console.log("Error 401 en petición de autenticación");
          // Para peticiones de auth que fallan con 401, actualizar estado pero no redireccionar automáticamente
          connectionState.hasAuthError = true;
          return Promise.reject({
            ...error,
            isAuthError: true,
            message: "Error de autenticación en operación de login/refresh"
          });
        } else if (originalRequest._retryCount >= MAX_RETRY_ATTEMPTS) {
          console.log(`Máximo de intentos de renovación (${MAX_RETRY_ATTEMPTS}) alcanzado.`);
          connectionState.hasAuthError = true;
          return Promise.reject({
            ...error,
            isAuthError: true,
            message: "Máximo de intentos de renovación de sesión alcanzado"
          });
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

      // Actualizar el estado de la conexión
      connectionState.consecutiveFailures++;
      if (connectionState.consecutiveFailures >= 3) {
        connectionState.hasBackendConnection = false;
      }

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

/**
 * Función mejorada para realizar peticiones HTTP con caché y reintentos
 */
function request<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  options?: {
    useCache?: boolean;
    cacheTTL?: number;
    staleWhileRevalidate?: boolean;
    retries?: number;
  }
): Promise<T> {
  const {
    useCache = method === 'GET', // Por defecto, solo cacheamos GETs
    cacheTTL = 5 * 60 * 1000, // 5 minutos
    staleWhileRevalidate = true,
    retries = 3
  } = options || {};

  // Ruta completa con parámetros query
  const fullEndpoint = endpoint + (data && method === 'GET' ? convertToQueryParams(data) : '');

  // Función para ejecutar la solicitud real
  const executeRequest = async (): Promise<T> => {
    switch (method) {
      case 'GET':
        return (await api.get(fullEndpoint)).data;
      case 'POST':
        return (await api.post(endpoint, data)).data;
      case 'PUT':
        return (await api.put(endpoint, data)).data;
      case 'DELETE':
        return (await api.delete(endpoint)).data;
      default:
        throw new Error(`Método HTTP no soportado: ${method}`);
    }
  };

  // Si es una solicitud GET y se usa caché, intentar recuperar de la caché
  if (useCache && method === 'GET') {
    return apiCache.withCache<T>(
      endpoint,
      () => withRetry<T>(executeRequest, { maxRetries: retries }),
      data, // Parámetros para generar la clave de caché
      {
        ttl: cacheTTL,
        staleWhileRevalidate
      }
    );
  }

  // Para otros métodos o si no se usa caché, solo hacer la solicitud con reintentos
  return withRetry<T>(executeRequest, { maxRetries: retries });
}

/**
 * Convierte un objeto a parámetros de consulta URL
 */
function convertToQueryParams(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return '';

  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  }

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Servicio de productos
export const productService = {
  getProducts: async (page = 1, limit = 10, userId?: string) => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('Solicitando productos:', { page, limit, userId });

      // Realizar la petición sin caché para obtener siempre datos frescos
      const response = await request('GET', '/products', { page, limit, userId }, {
        useCache: false,
        retries: 1
      });

      console.log('Respuesta del servidor:', response);

      // Normalizar la respuesta
      let normalizedResponse;

      if (Array.isArray(response)) {
        normalizedResponse = {
          products: response,
          total: response.length,
          pages: Math.ceil(response.length / limit)
        };
      } else if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data.products)) {
          normalizedResponse = {
            products: response.data.products,
            total: response.data.total || response.data.products.length,
            pages: response.data.pages || Math.ceil(response.data.total / limit)
          };
        } else if (response.products && Array.isArray(response.products)) {
          normalizedResponse = {
            products: response.products,
            total: response.total || response.products.length,
            pages: response.pages || Math.ceil(response.total / limit)
          };
        }
      }

      if (!normalizedResponse) {
        console.error('Formato de respuesta no válido:', response);
        return {
          products: [],
          total: 0,
          pages: 1
        };
      }

      console.log('Respuesta normalizada:', normalizedResponse);
      return normalizedResponse;

    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  getProductById: async (id: string) => {
    return request('GET', `/products/${id}`, null, {
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      staleWhileRevalidate: true
    });
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

      const response = await request('POST', '/products', dtoData, { useCache: false });

      // Forzar una actualización inmediata de la caché
      apiCache.invalidateByPattern('/products');

      // Esperar un momento para asegurar que el backend haya procesado la creación
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Respuesta exitosa del backend:', response);
      return response;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Partial<CreateProductDto>) => {
    const response = await request('PUT', `/products/${id}`, productData, { useCache: false });

    // Invalidar la caché del producto específico y la lista de productos
    apiCache.invalidate(`/products/${id}`);
    apiCache.invalidateByPattern('/products');

    return response;
  },

  deleteProduct: async (id: string) => {
    const response = await request('DELETE', `/products/${id}`, null, { useCache: false });

    // Invalidar la caché de productos al eliminar uno
    apiCache.invalidateByPattern('/products');

    return response;
  },
};

// Servicio de inventario
export const inventoryService = {
  getInventoryMovements: async () => {
    return request('GET', '/inventory', null, {
      cacheTTL: 1 * 60 * 1000, // 1 minuto
      staleWhileRevalidate: true
    });
  },

  createInventoryMovement: async (movementData: any) => {
    // Verificamos que productId esté presente y tenga el formato esperado
    if (!movementData.productId) {
      console.error('Error: productId es requerido para crear un movimiento de inventario');
      throw new Error('productId es requerido');
    }

    // Aseguramos que productId sea una cadena
    const productId = String(movementData.productId);

    // Verificamos que tenga el formato de ID de MongoDB
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      console.error(`Error: productId '${productId}' no tiene formato válido de MongoDB (24 caracteres hexadecimales)`);
      throw new Error('productId no tiene formato válido');
    }

    // Mapeamos el movementType al formato correcto para el backend
    let movementType = movementData.movementType;
    if (movementType === 'entrada') movementType = 'entrada';
    if (movementType === 'salida') movementType = 'salida';
    // Para compatibilidad interna (el backend podría usar 'type' en algún lugar)
    let type = 'entrada';
    if (movementData.type === 'salida') {
      type = 'salida';
    }

    // Creamos una copia del objeto con el ID correcto y tipos compatibles
    const dataToSend = {
      ...movementData,
      productId: productId,
      movementType: movementType, // Usamos 'in' o 'out' para la validación del DTO
      type: type, // Mantenemos 'type' por compatibilidad
      date: movementData.date || movementData.movementDate // Aseguramos que la fecha exista
    };

    console.log('📦 Enviando datos de movimiento al backend:', dataToSend);
    return request('POST', '/inventory', dataToSend, { useCache: false });
  },

  getInventoryMovementById: async (id: string) => {
    return request('GET', `/inventory/${id}`, null, {
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      staleWhileRevalidate: true
    });
  },
};

// Servicio de stock
export const stockService = {
  getCurrentStock: async (productId: string) => {
    return request('GET', `/stock/${productId}`, null, {
      cacheTTL: 1 * 60 * 1000, // 1 minuto
      staleWhileRevalidate: true
    });
  },
};

// Nuevos servicios para proveedores
export const supplierService = {
  getSuppliers: async (page = 1, limit = 10) => {
    return request('GET', `/suppliers?page=${page}&limit=${limit}`, null, {
      cacheTTL: 2 * 60 * 1000, // 2 minutos
      staleWhileRevalidate: true
    });
  },
  getSupplierById: async (id: string) => {
    return request('GET', `/suppliers/${id}`, null, {
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      staleWhileRevalidate: true
    });
  },
  createSupplier: async (supplierData: any) => {
    return request('POST', '/suppliers', supplierData, { useCache: false });
  },
  updateSupplier: async (id: string, supplierData: any) => {
    const response = await request('PUT', `/suppliers/${id}`, supplierData, { useCache: false });

    // Invalidar la caché del proveedor específico y la lista de proveedores
    apiCache.invalidate(`/suppliers/${id}`);
    apiCache.invalidateByPattern('/suppliers');

    return response;
  },
  deleteSupplier: async (id: string) => {
    const response = await request('DELETE', `/suppliers/${id}`, null, { useCache: false });

    // Invalidar la caché de proveedores al eliminar uno
    apiCache.invalidateByPattern('/suppliers');

    return response;
  },
  getSuppliersByCategory: async (category: string) => {
    return request('GET', `/suppliers/category/${category}`, null, {
      cacheTTL: 2 * 60 * 1000, // 2 minutos
      staleWhileRevalidate: true
    });
  },
  getSuppliersByProduct: async (productId: string) => {
    return request('GET', `/suppliers/product/${productId}`, null, {
      cacheTTL: 2 * 60 * 1000, // 2 minutos
      staleWhileRevalidate: true
    });
  },
  addProductToSupplier: async (supplierId: string, productId: string) => {
    return request('PUT', `/suppliers/${supplierId}/products/${productId}`, null, { useCache: false });
  },
  removeProductFromSupplier: async (supplierId: string, productId: string) => {
    return request('DELETE', `/suppliers/${supplierId}/products/${productId}`, null, { useCache: false });
  }
};

// Nuevos servicios para pedidos
export const orderService = {
  getOrders: async (page = 1, limit = 10, status?: string, supplierId?: string) => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (supplierId) url += `&supplierId=${supplierId}`;
    return request('GET', url, null, {
      cacheTTL: 2 * 60 * 1000, // 2 minutos
      staleWhileRevalidate: true
    });
  },
  getOrderById: async (id: string) => {
    return request('GET', `/orders/${id}`, null, {
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      staleWhileRevalidate: true
    });
  },
  createOrder: async (orderData: any) => {
    return request('POST', '/orders', orderData, { useCache: false });
  },
  updateOrder: async (id: string, orderData: any) => {
    const response = await request('PUT', `/orders/${id}`, orderData, { useCache: false });

    // Invalidar la caché del pedido específico y la lista de pedidos
    apiCache.invalidate(`/orders/${id}`);
    apiCache.invalidateByPattern('/orders');

    return response;
  },
  deleteOrder: async (id: string) => {
    const response = await request('DELETE', `/orders/${id}`, null, { useCache: false });

    // Invalidar la caché de pedidos al eliminar uno
    apiCache.invalidateByPattern('/orders');

    return response;
  },
};
