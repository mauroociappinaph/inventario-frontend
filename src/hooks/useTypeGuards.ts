import { useCallback, useMemo } from 'react';
import { IconComponent } from '@/types/sidebar';

/**
 * Hook con utilidades avanzadas de type guards y validación
 * Para evitar errores de tipado y validar props opcionales
 */
export const useTypeGuards = () => {
  /**
   * Valida que un valor opcional exista antes de usarlo
   * @param value Valor a verificar
   * @param defaultValue Valor por defecto si es nulo o undefined
   */
  const ensureValue = useCallback(<T>(value: T | null | undefined, defaultValue: T): T => {
    return value !== null && value !== undefined ? value : defaultValue;
  }, []);

  /**
   * Valida un objeto con tipado estricto
   * @param value Valor a verificar
   * @param isRequired Si es obligatorio
   * @param defaultValue Valor por defecto
   */
  const ensureObject = useCallback(<T extends object>(
    value: T | null | undefined,
    isRequired: boolean = false,
    defaultValue: T = {} as T
  ): T => {
    if (value === null || value === undefined) {
      if (isRequired) {
        console.warn('Objeto requerido es null o undefined');
      }
      return defaultValue;
    }

    if (typeof value !== 'object') {
      console.warn(`Se esperaba un objeto, pero se recibió ${typeof value}`);
      return defaultValue;
    }

    return value;
  }, []);

  /**
   * Valida que un array exista y sea un array
   * @param value Array a validar
   * @param defaultValue Valor por defecto
   */
  const ensureArray = useCallback(<T>(
    value: T[] | null | undefined,
    defaultValue: T[] = []
  ): T[] => {
    if (!value) return defaultValue;
    if (!Array.isArray(value)) {
      console.warn('Se esperaba un array, pero se recibió', typeof value);
      return defaultValue;
    }
    return value;
  }, []);

  /**
   * Verificar si un objeto es de un tipo específico (type guard)
   * @param obj Objeto a verificar
   * @param properties Propiedades que debería tener el objeto
   */
  const isOfType = useCallback(<T extends object>(
    obj: unknown,
    properties: (keyof T)[]
  ): obj is T => {
    if (!obj || typeof obj !== 'object') return false;

    return properties.every(prop => prop in obj);
  }, []);

  /**
   * Verifica y valida un objeto contra un tipo específico
   * @param obj Objeto a verificar
   * @param properties Propiedades que debe tener
   * @param defaultValue Valor por defecto
   */
  const validateType = useCallback(<T extends object>(
    obj: unknown,
    properties: (keyof T)[],
    defaultValue: T
  ): T => {
    if (isOfType<T>(obj, properties)) {
      return obj;
    }

    if (process.env.NODE_ENV !== 'production') {
      const missingProps = properties.filter(prop => {
        return !obj || typeof obj !== 'object' || !(prop in obj);
      });

      if (missingProps.length > 0) {
        console.warn(
          `Objeto no válido. Faltan propiedades: ${missingProps.join(', ')}`
        );
      }
    }

    return defaultValue;
  }, [isOfType]);

  /**
   * Verifica si un valor es un componente de icono
   * @param value Valor a verificar
   */
  const isIconComponent = useCallback((value: unknown): value is IconComponent => {
    return typeof value === 'function' ||
           (typeof value === 'object' && value !== null && 'render' in value);
  }, []);

  /**
   * Valida y procesa un ícono de manera segura
   * @param icon Componente de icono
   * @param fallback Icono fallback
   */
  const safeIcon = useCallback((
    icon: unknown,
    fallback: IconComponent | null = null
  ): IconComponent | null => {
    if (!icon) return fallback;

    // Si ya es un componente de ícono, devolverlo
    if (isIconComponent(icon)) {
      return icon;
    }

    // Si es una cadena, podría ser una ruta a imagen o un nombre de ícono
    if (typeof icon === 'string') {
      // Aquí podrías mapear strings a íconos o simplemente devolver un fallback
      return fallback;
    }

    return fallback;
  }, [isIconComponent]);

  /**
   * Conjunto de validadores específicos para tipos comunes
   * Reutilizables a través de la aplicación
   */
  const validators = useMemo(() => ({
    /**
     * Valida un string
     */
    isValidString: (value: unknown, minLength = 0, maxLength = Infinity): value is string => {
      return typeof value === 'string' &&
             value.length >= minLength &&
             value.length <= maxLength;
    },

    /**
     * Valida un número
     */
    isValidNumber: (value: unknown, min = -Infinity, max = Infinity): value is number => {
      return typeof value === 'number' &&
             !isNaN(value) &&
             value >= min &&
             value <= max;
    },

    /**
     * Valida un booleano
     */
    isValidBoolean: (value: unknown): value is boolean => {
      return typeof value === 'boolean';
    },

    /**
     * Valida una URL
     */
    isValidUrl: (value: unknown): value is string => {
      if (typeof value !== 'string') return false;

      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Valida un email
     */
    isValidEmail: (value: unknown): value is string => {
      if (typeof value !== 'string') return false;

      // Expresión regular simple para validar un email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
  }), []);

  return {
    ensureValue,
    ensureObject,
    ensureArray,
    isOfType,
    validateType,
    isIconComponent,
    safeIcon,
    validators
  };
};
