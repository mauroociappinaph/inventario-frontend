/**
 * Utilidades para mejorar la sincronización entre frontend y backend
 *
 * Este archivo proporciona herramientas para:
 * - Reintentos automáticos de solicitudes fallidas
 * - Cola de solicitudes para enviar cuando se recupere la conexión
 * - Monitoreo de conexión
 */

import { useToast } from "@/components/ui/use-toast";

export interface RetryOptions {
  /** Número máximo de reintentos */
  maxRetries?: number;
  /** Tiempo base en ms para el algoritmo de backoff exponencial */
  baseDelay?: number;
  /** Factor para el algoritmo de backoff exponencial */
  backoffFactor?: number;
  /** Tipos de errores que se deben reintentar automáticamente */
  retryableErrors?: number[];
  /** Función a llamar en cada reintento */
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Estado actual de la conexión
 */
export const connectionState = {
  isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
  hasBackendConnection: true,
  lastCheckTime: Date.now(),
  lastSuccessTime: Date.now(),
  lastFailureTime: 0,
  consecutiveFailures: 0,
  hasAuthError: false,
};

/**
 * Cola de solicitudes pendientes para enviar cuando se recupere la conexión
 */
type QueuedRequest = {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  maxAttempts: number;
  attempts: number;
  abortController?: AbortController;
};

const requestQueue: QueuedRequest[] = [];

// Variable para almacenar la función toast cuando esté disponible
let toastFn: any = null;

/**
 * Muestra una notificación, comprobando si la función toast está disponible
 */
function showToast(props: { title: string; description: string; variant: "default" | "destructive" }) {
  if (typeof window !== 'undefined') {
    // Si estamos en un contexto donde useToast() no es utilizable directamente
    // Podemos usar la referencia guardada
    if (toastFn) {
      toastFn(props);
    } else {
      // Si no hay función toast disponible, mostramos en consola
      console.log(`[TOAST] ${props.title}: ${props.description}`);
    }
  }
}

/**
 * Permite establecer la función toast desde un componente React
 */
export function setToastFunction(fn: any) {
  toastFn = fn;
}

/**
 * Inicializa los listeners de conexión
 */
export function initConnectionListeners() {
  if (typeof window === 'undefined') return;

  // Escuchamos cambios en el estado de la conexión
  window.addEventListener('online', () => {
    connectionState.isOnline = true;
    // Procesamos la cola de solicitudes pendientes cuando volvemos a estar online
    showToast({
      title: "Conexión restablecida",
      description: "Se ha restablecido la conexión a Internet.",
      variant: "default",
    });
    processQueue();
  });

  window.addEventListener('offline', () => {
    connectionState.isOnline = false;
    showToast({
      title: "Sin conexión",
      description: "Se ha perdido la conexión a Internet. Algunas funciones podrían no estar disponibles.",
      variant: "destructive",
    });
  });

  // Procesamos la cola periódicamente por si hay solicitudes pendientes
  setInterval(processQueue, 10000);
}

/**
 * Procesa la cola de solicitudes pendientes
 */
function processQueue() {
  if (!connectionState.isOnline || requestQueue.length === 0) return;

  console.log(`Procesando cola de solicitudes pendientes: ${requestQueue.length} solicitudes`);

  // Hacemos una copia de la cola actual
  const currentQueue = [...requestQueue];

  // Limpiamos la cola
  requestQueue.length = 0;

  // Procesamos cada solicitud pendiente
  currentQueue.forEach(request => {
    // Implementación específica del procesamiento dependerá de la API
    console.log(`Reintentando solicitud a ${request.endpoint}`, request);

    // Aquí iría el código para reintentar la solicitud con la API
    // Por ejemplo, usando axios, fetch, etc.
    // Si es exitosa, llamamos a request.resolve con la respuesta
    // Si falla, y aún hay intentos disponibles, la volvemos a poner en la cola
    // Si no hay más intentos, llamamos a request.reject con el error
  });
}

/**
 * Añade una solicitud a la cola para procesarla cuando haya conexión
 */
export function queueRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  maxAttempts = 3
): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = `${method}-${endpoint}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: QueuedRequest = {
      id,
      endpoint,
      method,
      data,
      resolve,
      reject,
      maxAttempts,
      attempts: 0,
      abortController: new AbortController(),
    };

    requestQueue.push(request);

    // Si estamos online, intentamos procesar la cola inmediatamente
    if (connectionState.isOnline) {
      processQueue();
    } else {
      console.log(`Solicitud encolada: ${method} ${endpoint}`);
      showToast({
        title: "Solicitud pendiente",
        description: "La solicitud será procesada cuando se restablezca la conexión.",
        variant: "default",
      });
    }
  });
}

/**
 * Ejecuta una función con reintentos automáticos
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    backoffFactor = 2,
    retryableErrors = [408, 429, 500, 502, 503, 504],
    onRetry
  } = options;

  let attempt = 0;

  const execute = async (): Promise<T> => {
    try {
      attempt++;
      const result = await fn();

      // Éxito en la solicitud
      connectionState.lastSuccessTime = Date.now();
      connectionState.consecutiveFailures = 0;
      connectionState.hasBackendConnection = true;

      return result;
    } catch (error: any) {
      const status = error?.response?.status || 0;

      // Determinar si el error es reintentable
      const isRetryableError = retryableErrors.includes(status) ||
        (status === 0 && connectionState.isOnline); // Error de red pero estamos online

      // Si hemos alcanzado el número máximo de reintentos o no es un error reintentable
      if (attempt >= maxRetries || !isRetryableError) {
        // Si es un error de conectividad, actualizamos el estado
        if (status === 0 || status >= 500) {
          connectionState.consecutiveFailures++;

          if (connectionState.consecutiveFailures >= 3) {
            connectionState.hasBackendConnection = false;
            // Notificar al usuario si hay problemas de conexión con el backend
            if (connectionState.isOnline) {
              showToast({
                title: "Problemas de conexión",
                description: "No se puede conectar con el servidor. Intentando reconectar...",
                variant: "destructive",
              });
            }
          }
        }

        throw error;
      }

      // Calcular el tiempo de espera con backoff exponencial
      const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);

      // Añadimos algo de aleatoriedad para evitar la sincronización de reintentos
      const jitter = Math.random() * 0.3 * delay;
      const finalDelay = delay + jitter;

      // Llamar al callback de reintento si existe
      if (onRetry) {
        onRetry(attempt, error);
      }

      console.log(`Reintentando solicitud (${attempt}/${maxRetries}) después de ${Math.round(finalDelay)}ms`);

      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, finalDelay));

      // Reintentar
      return execute();
    }
  };

  return execute();
}

/**
 * Hook para usar en componentes React que proporciona las funciones de sincronización
 */
export function useSyncUtils() {
  const { toast } = useToast();

  // Actualizamos la función toast cuando el componente se monta
  if (typeof window !== 'undefined' && toast && !toastFn) {
    setToastFunction(toast);
  }

  return {
    connectionState,
    queueRequest,
    withRetry,
    isOnline: connectionState.isOnline,
    hasBackendConnection: connectionState.hasBackendConnection
  };
}

// Inicializar automáticamente los listeners si estamos en el navegador
if (typeof window !== 'undefined') {
  initConnectionListeners();
}
