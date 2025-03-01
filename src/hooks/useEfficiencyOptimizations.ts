import { useMemo, useCallback, useRef, useEffect } from 'react';

// Tipo genérico para funciones con tipos más específicos
type GenericFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> = (...args: TArgs) => TReturn;

/**
 * Hook para memoizar funciones
 * @param fn Función a memoizar
 * @param dependencies Dependencias que al cambiar recrearán la función
 */
export function useMemoizeFunction<T extends GenericFunction>(fn: T, dependencies: unknown[] = []) {
  return useCallback(fn, dependencies);
}

/**
 * Hook para memoizar un objeto o valor
 * @param factory Función que crea el objeto o valor
 * @param dependencies Dependencias que al cambiar recrearán el objeto
 */
export function useMemoizeObject<T>(factory: () => T, dependencies: unknown[] = []) {
  return useMemo(factory, dependencies);
}

/**
 * Hook para crear un mapa de búsqueda optimizado
 * @param items Array de elementos
 * @param keyFn Función para extraer la clave de cada elemento
 * @returns Un Map para acceso rápido por clave
 */
export function useCreateLookupMap<T, K>(items: T[], keyFn: (item: T) => K) {
  return useMemo(() => {
    const map = new Map<K, T>();
    items.forEach(item => {
      map.set(keyFn(item), item);
    });
    return map;
  }, [items, keyFn]);
}

/**
 * Hook para crear una función throttled
 * @param fn Función a throttle
 * @param delay Período en ms
 */
export function useThrottledFunction<T extends GenericFunction>(fn: T, delay: number) {
  const throttleRef = useRef<{lastCall: number, timerId: NodeJS.Timeout | null}>({
    lastCall: 0,
    timerId: null
  });

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const { lastCall, timerId } = throttleRef.current;

    if (now - lastCall >= delay) {
      if (timerId) {
        clearTimeout(timerId);
        throttleRef.current.timerId = null;
      }

      throttleRef.current.lastCall = now;
      return fn(...args);
    }

    if (!timerId) {
      throttleRef.current.timerId = setTimeout(() => {
        throttleRef.current.lastCall = Date.now();
        throttleRef.current.timerId = null;
        fn(...args);
      }, delay - (now - lastCall));
    }
  }, [fn, delay]);
}

/**
 * Hook para crear una función debounced
 * @param fn Función a debounce
 * @param delay Tiempo en ms
 */
export function useDebouncedFunction<T extends GenericFunction>(fn: T, delay: number) {
  const debounceRef = useRef<{timerId: NodeJS.Timeout | null}>({
    timerId: null
  });

  return useCallback((...args: Parameters<T>) => {
    if (debounceRef.current.timerId) {
      clearTimeout(debounceRef.current.timerId);
    }

    debounceRef.current.timerId = setTimeout(() => {
      debounceRef.current.timerId = null;
      fn(...args);
    }, delay);
  }, [fn, delay]);
}

/**
 * Hook para evitar actualizaciones innecesarias comparando valores profundamente
 * @param value Valor a comparar
 * @param isEqual Función opcional para comparar igualdad
 */
export function useDeeplyMemoizedValue<T>(value: T, isEqual?: (a: T, b: T) => boolean) {
  const ref = useRef<T>(value);

  // Función de comparación predeterminada
  const defaultIsEqual = (a: T, b: T): boolean => {
    if (a === b) return true;

    // Comparación profunda simple para objetos y arrays
    if (
      typeof a === 'object' && a !== null &&
      typeof b === 'object' && b !== null
    ) {
      const keysA = Object.keys(a as object);
      const keysB = Object.keys(b as object);

      if (keysA.length !== keysB.length) return false;

      return keysA.every(key => {
        // Usar casting con tipos seguros para evitar errores de tipo
        type ObjectWithKeys = Record<string, unknown>;
        const propA = (a as ObjectWithKeys)[key];
        const propB = (b as ObjectWithKeys)[key];

        // Asegurar que ambos valores son del mismo tipo antes de comparar
        return defaultIsEqual(propA as T, propB as T);
      });
    }

    return false;
  };

  const compare = isEqual || defaultIsEqual;

  if (!compare(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Hook para medir el rendimiento de un componente o función
 * @param label Etiqueta para identificar en la consola
 */
export function usePerformanceMeasure(label: string) {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      }
    };
  }, [label]);
}

/**
 * Hook principal que proporciona acceso a todos los hooks de optimización
 */
export const useEfficiencyOptimizations = () => {
  return {
    memoizeFunction: useMemoizeFunction,
    memoizeObject: useMemoizeObject,
    createLookupMap: useCreateLookupMap,
    createThrottledFunction: useThrottledFunction,
    createDebouncedFunction: useDebouncedFunction,
    useDeeplyMemoizedValue,
    usePerformanceMeasure
  };
};
