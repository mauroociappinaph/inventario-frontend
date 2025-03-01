import { create } from 'zustand';
import { ERROR_ACTIONS } from './actionTypes';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

export interface AppError {
  id: string;
  message: string;
  details?: string | null;
  code?: string | number;
  severity: ErrorSeverity;
  timestamp: number;
  source?: string;
  handled: boolean;
}

interface ErrorState {
  // Estado
  errors: AppError[];
  lastError: AppError | null;

  // Acciones
  addError: (error: Omit<AppError, 'id' | 'timestamp' | 'handled'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  markErrorAsHandled: (id: string) => void;

  // Helpers
  getErrorById: (id: string) => AppError | undefined;
  hasActiveErrors: (severity?: ErrorSeverity) => boolean;
}

// Generar ID único para errores
const generateErrorId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useErrorStore = create<ErrorState>((set, get) => ({
  // Estado inicial
  errors: [],
  lastError: null,

  // Añadir un nuevo error
  addError: (error) => {
    console.log(`Dispatching action: ${ERROR_ACTIONS.ADD_ERROR}`);

    const newError: AppError = {
      ...error,
      id: generateErrorId(),
      timestamp: Date.now(),
      handled: false,
    };

    set((state) => ({
      errors: [...state.errors, newError],
      lastError: newError,
    }));

    // Devolver el ID para referencia
    return newError.id;
  },

  // Eliminar un error por ID
  removeError: (id) => {
    console.log(`Dispatching action: ${ERROR_ACTIONS.REMOVE_ERROR}`);

    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
      lastError: state.lastError?.id === id ? null : state.lastError,
    }));
  },

  // Limpiar todos los errores
  clearErrors: () => {
    console.log(`Dispatching action: ${ERROR_ACTIONS.CLEAR_ERRORS}`);

    set({
      errors: [],
      lastError: null,
    });
  },

  // Marcar un error como manejado
  markErrorAsHandled: (id) => {
    console.log(`Dispatching action: ${ERROR_ACTIONS.MARK_ERROR_AS_HANDLED}`);

    set((state) => ({
      errors: state.errors.map((error) =>
        error.id === id ? { ...error, handled: true } : error
      ),
    }));
  },

  // Obtener un error por ID
  getErrorById: (id) => {
    return get().errors.find((error) => error.id === id);
  },

  // Verificar si hay errores activos de cierta severidad
  hasActiveErrors: (severity) => {
    if (severity) {
      return get().errors.some(
        (error) => !error.handled && error.severity === severity
      );
    }
    return get().errors.some((error) => !error.handled);
  },
}));

// Selectores para mejorar el rendimiento
export const useErrorActions = () => useErrorStore((state) => ({
  addError: state.addError,
  removeError: state.removeError,
  clearErrors: state.clearErrors,
  markErrorAsHandled: state.markErrorAsHandled,
}));

export const useErrorState = () => useErrorStore((state) => ({
  errors: state.errors,
  lastError: state.lastError,
  hasActiveErrors: state.hasActiveErrors,
  getErrorById: state.getErrorById,
}));
