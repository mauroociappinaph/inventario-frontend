/**
 * Sistema de caché para consultas API
 *
 * Esta utilidad proporciona funcionalidad para almacenar respuestas de API
 * y recuperarlas sin necesidad de realizar nuevas solicitudes al servidor.
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  /** Tiempo de expiración en milisegundos */
  ttl?: number;
  /** Clave personalizada para sobrescribir la clave generada automáticamente */
  customKey?: string;
  /** Si es true, devuelve datos en caché mientras revalida en segundo plano */
  staleWhileRevalidate?: boolean;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutos por defecto
    this.cache = new Map();
    this.defaultTTL = defaultTTL;

    // Limpieza periódica de caché
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanExpiredCache(), 60 * 1000); // Limpiar cada minuto
    }
  }

  /**
   * Genera una clave para la caché basada en el endpoint y los parámetros
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;

    // Ordenamos las claves para asegurar consistencia
    const sortedParams = Object.keys(params).sort().reduce((acc: Record<string, any>, key: string) => {
      acc[key] = params[key];
      return acc;
    }, {});

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Limpia las entradas expiradas de la caché
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtiene un elemento de la caché si existe y no ha expirado
   */
  get<T>(endpoint: string, params?: Record<string, any>, options?: CacheOptions): T | null {
    const key = options?.customKey || this.generateKey(endpoint, params);
    const item = this.cache.get(key);

    if (!item) return null;

    const now = Date.now();

    // Si ha expirado y no se permite usar datos obsoletos, devolver null
    if (item.expiresAt < now && !options?.staleWhileRevalidate) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Almacena un elemento en la caché
   */
  set<T>(endpoint: string, data: T, params?: Record<string, any>, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTTL;
    const now = Date.now();
    const key = options?.customKey || this.generateKey(endpoint, params);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  /**
   * Elimina un elemento específico de la caché
   */
  invalidate(endpoint: string, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params);
    this.cache.delete(key);
  }

  /**
   * Elimina todos los elementos de la caché que coincidan con un patrón de endpoint
   */
  invalidateByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Elimina toda la caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Ejecuta una función con caché
   * Si hay datos en caché, los devuelve; de lo contrario, ejecuta la función y almacena el resultado
   */
  async withCache<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    params?: Record<string, any>,
    options?: CacheOptions
  ): Promise<T> {
    const cachedData = this.get<T>(endpoint, params, options);

    if (cachedData !== null) {
      // Si tenemos datos en caché pero podría estar obsoleto, refrescar en segundo plano
      if (options?.staleWhileRevalidate) {
        const key = options?.customKey || this.generateKey(endpoint, params);
        const item = this.cache.get(key);

        if (item && item.expiresAt < Date.now()) {
          // Actualizar en segundo plano sin bloquear
          this.revalidateInBackground(endpoint, fetchFn, params, options);
        }
      }

      return cachedData;
    }

    // No hay caché válida, ejecutar la función
    const result = await fetchFn();
    this.set(endpoint, result, params, options);
    return result;
  }

  /**
   * Revalida los datos en segundo plano sin bloquear
   */
  private async revalidateInBackground<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    params?: Record<string, any>,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const result = await fetchFn();
      this.set(endpoint, result, params, options);
    } catch (error) {
      console.error(`Error al revalidar en segundo plano: ${endpoint}`, error);
      // No hacemos nada, mantenemos los datos obsoletos
    }
  }
}

// Exportamos una instancia global para toda la aplicación
export const apiCache = new ApiCache();

// Exportamos tipos y la clase para uso personalizado
export { ApiCache };
export type { CacheItem, CacheOptions };

