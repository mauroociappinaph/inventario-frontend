'use client';

import React from 'react';
import { AxiosError } from 'axios';
import { ErrorMessage } from './error-message';
import { Button } from './button';
import { RefreshCw } from 'lucide-react';

interface ApiErrorProps {
  error: Error | AxiosError | null;
  resetError?: () => void;
  retry?: () => void;
  fallbackMessage?: string;
  className?: string;
}

export function ApiError({
  error,
  resetError,
  retry,
  fallbackMessage = 'No se pudo conectar con el servidor',
  className,
}: ApiErrorProps) {
  if (!error) return null;

  // Determinar si es un error de Axios para extraer detalles específicos
  const isAxiosError = error instanceof AxiosError;

  // Obtener el código de estado HTTP si es un error de Axios
  const statusCode = isAxiosError && error.response ? error.response.status : null;

  // Obtener el mensaje del error (desde la respuesta de la API o del error)
  let errorMessage = error.message;
  if (isAxiosError && error.response?.data) {
    const data = error.response.data;
    errorMessage = typeof data === 'string'
      ? data
      : data.message || data.error || JSON.stringify(data);
  }

  // Título específico según el tipo de error
  let title = 'Error de servidor';
  if (statusCode) {
    if (statusCode === 404) title = 'Recurso no encontrado';
    else if (statusCode === 401) title = 'No autorizado';
    else if (statusCode === 403) title = 'Acceso prohibido';
    else if (statusCode === 400) title = 'Solicitud incorrecta';
    else if (statusCode >= 500) title = 'Error del servidor';
  } else if (!navigator.onLine) {
    title = 'Sin conexión a Internet';
    errorMessage = 'Comprueba tu conexión a Internet e intenta nuevamente.';
  } else if (error.message === 'Network Error') {
    title = 'Error de red';
    errorMessage = fallbackMessage;
  }

  return (
    <div className={className}>
      <ErrorMessage
        title={title}
        message={errorMessage}
        severity={statusCode && statusCode >= 500 ? 'error' : 'warning'}
      />

      {(resetError || retry) && (
        <div className="mt-4 flex justify-center">
          {resetError && (
            <Button
              onClick={resetError}
              variant="ghost"
              size="sm"
              className="mr-2"
            >
              Cerrar
            </Button>
          )}

          {retry && (
            <Button
              onClick={retry}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Intentar nuevamente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
