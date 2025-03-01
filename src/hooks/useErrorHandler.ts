import { useCallback } from 'react';
import { toast } from 'sonner'; // Asumiendo que se usa sonner para toasts
import { useErrorStore, ErrorSeverity, AppError } from '@/stores/errorStore';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  severity?: ErrorSeverity;
  source?: string;
}

const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  logToConsole: true,
  severity: 'error',
  source: 'app',
};

// Tipo para objetos de error genéricos
interface GenericErrorObject {
  message?: string;
  details?: string;
  stack?: string;
  code?: string | number;
  status?: string | number;
  [key: string]: unknown;
}

// Mapear severidades a tipos de toast disponibles
const mapSeverityToToastType = (severity: ErrorSeverity): 'success' | 'info' | 'warning' | 'error' => {
  if (severity === 'fatal') return 'error';
  return severity as 'success' | 'info' | 'warning' | 'error';
};

/**
 * Hook para manejar errores de forma centralizada
 */
export function useErrorHandler(defaultSource?: string) {
  const { addError, markErrorAsHandled } = useErrorStore(state => ({
    addError: state.addError,
    markErrorAsHandled: state.markErrorAsHandled,
  }));

  /**
   * Maneja un error y lo registra en el store
   */
  const handleError = useCallback((
    errorOrMessage: unknown,
    options?: ErrorHandlerOptions
  ) => {
    const opts = { ...defaultOptions, ...options };

    if (defaultSource) {
      opts.source = defaultSource;
    }

    // Normalizar el error
    let message = 'Error desconocido';
    let details: string | undefined = undefined; // Inicializar como undefined, no null
    let code: string | number | undefined;

    if (typeof errorOrMessage === 'string') {
      message = errorOrMessage;
    } else if (errorOrMessage instanceof Error) {
      message = errorOrMessage.message;
      details = errorOrMessage.stack || undefined; // Asegurar que sea string o undefined
    } else if (typeof errorOrMessage === 'object' && errorOrMessage !== null) {
      const errorObj = errorOrMessage as GenericErrorObject;
      message = errorObj.message || message;
      // Convertir null a undefined para evitar errores de tipo
      details = errorObj.details || errorObj.stack || undefined;
      code = errorObj.code || errorObj.status;
    }

    // Construir el error para el store
    const errorData: Omit<AppError, 'id' | 'timestamp' | 'handled'> = {
      message,
      details, // Ya está garantizado que es string o undefined
      code,
      severity: opts.severity || 'error',
      source: opts.source,
    };

    // Registrar el error en el store
    const errorId = addError(errorData);

    // Mostrar toast si es necesario
    if (opts.showToast) {
      const toastType = mapSeverityToToastType(opts.severity || 'error');
      toast[toastType](message, {
        description: details,
        id: errorId,
        onDismiss: () => markErrorAsHandled(errorId),
      });
    }

    // Loggear a la consola
    if (opts.logToConsole) {
      console.error(`[${opts.source}]`, message, errorOrMessage);
    }

    return errorId;
  }, [addError, markErrorAsHandled, defaultSource]);

  /**
   * Captura errores en funciones asíncronas
   */
  const captureAsync = useCallback(<T>(
    asyncFn: Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<T> => {
    return asyncFn.catch(error => {
      handleError(error, options);
      throw error; // Re-throw para permitir manejo adicional
    });
  }, [handleError]);

  /**
   * Para usar en funciones try/catch
   */
  const tryCatch = useCallback(<T>(
    fn: () => T,
    options?: ErrorHandlerOptions
  ): T | undefined => {
    try {
      return fn();
    } catch (error) {
      handleError(error, options);
      return undefined;
    }
  }, [handleError]);

  /**
   * Función para ejecutar código asíncrono con captura de errores
   */
  const runSafe = useCallback(async <T>(
    fn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error, options);
      return undefined;
    }
  }, [handleError]);

  return {
    handleError,
    captureAsync,
    tryCatch,
    runSafe,
  };
}

/**
 * Función auxiliar global para manejar errores sin acceso al hook
 */
export function reportError(error: unknown, options?: ErrorHandlerOptions) {
  const errorStore = useErrorStore.getState();
  const opts = { ...defaultOptions, ...options };

  let message = 'Error desconocido';
  let details: string | undefined = undefined; // Inicializar como undefined
  let code: string | number | undefined;

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
    details = error.stack || undefined; // Garantizar que sea string o undefined
  } else if (typeof error === 'object' && error !== null) {
    const errorObj = error as GenericErrorObject;
    message = errorObj.message || message;
    details = errorObj.stack || undefined;
    code = errorObj.code || errorObj.status;
  }

  const errorId = errorStore.addError({
    message,
    details,
    code,
    severity: opts.severity || 'error',
    source: opts.source,
  });

  if (opts.logToConsole) {
    console.error(`[${opts.source}]`, message, error);
  }

  return errorId;
}
