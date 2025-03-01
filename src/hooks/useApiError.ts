'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { useToast } from '@/components/ui/use-toast';

interface UseApiErrorOptions {
  showToast?: boolean;
  defaultMessage?: string;
}

export function useApiError(options: UseApiErrorOptions = {}) {
  const { showToast = true, defaultMessage = 'Ha ocurrido un error al procesar la solicitud' } = options;
  const [error, setError] = useState<Error | AxiosError | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleError = useCallback((err: any) => {
    console.error('Error de API:', err);
    setError(err);

    if (showToast) {
      // Determinar el mensaje apropiado para mostrar en el toast
      let message = defaultMessage;
      let title = 'Error';
      let variant: 'default' | 'destructive' = 'destructive';

      if (err instanceof AxiosError && err.response) {
        // Errores HTTP con respuesta
        const status = err.response.status;

        if (status === 401) {
          title = 'No autorizado';
          message = 'Tu sesión ha expirado o no tienes permisos suficientes';
        } else if (status === 403) {
          title = 'Acceso denegado';
          message = 'No tienes permiso para realizar esta acción';
        } else if (status === 404) {
          title = 'No encontrado';
          message = 'El recurso solicitado no está disponible';
        } else if (status === 400) {
          title = 'Error en la solicitud';
          message = err.response.data?.message || 'Los datos enviados no son válidos';
        } else if (status >= 500) {
          title = 'Error del servidor';
          message = 'Ha ocurrido un problema en el servidor. Inténtalo de nuevo más tarde.';
        }

        // Si la API devuelve un mensaje específico, usarlo
        if (err.response.data?.message) {
          message = err.response.data.message;
        }
      } else if (err.message === 'Network Error') {
        title = 'Error de conexión';
        message = 'No se pudo conectar con el servidor. Verifica tu conexión a Internet.';
      }

      toast({
        title,
        description: message,
        variant
      });
    }

    setLoading(false);
  }, [toast, showToast, defaultMessage]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const executeRequest = useCallback(async <T,>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    resetError();

    try {
      const result = await apiCall();
      setLoading(false);
      return result;
    } catch (err: any) {
      handleError(err);
      return null;
    }
  }, [handleError, resetError]);

  return {
    error,
    loading,
    handleError,
    resetError,
    executeRequest
  };
}
