'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

interface ErrorFallbackProps {
  code?: number;
  title?: string;
  message?: string;
  homeLink?: string;
  backButton?: boolean;
}

export function ErrorFallback({
  code = 404,
  title = 'Página no encontrada',
  message = 'Lo sentimos, la página que estás buscando no existe o ha sido movida.',
  homeLink = '/',
  backButton = true,
}: ErrorFallbackProps) {
  // Determinar título y mensaje según el código de error
  let displayTitle = title;
  let displayMessage = message;

  if (code === 404) {
    displayTitle = title || 'Página no encontrada';
    displayMessage = message || 'Lo sentimos, la página que estás buscando no existe o ha sido movida.';
  } else if (code === 500) {
    displayTitle = title || 'Error del servidor';
    displayMessage = message || 'Lo sentimos, ha ocurrido un error interno en el servidor.';
  } else if (code === 403) {
    displayTitle = title || 'Acceso prohibido';
    displayMessage = message || 'No tienes permisos para acceder a esta página.';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={40} />
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-4">{code}</h1>
        <h2 className="text-2xl font-medium mb-3">{displayTitle}</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">{displayMessage}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {backButton && (
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver atrás
            </Button>
          )}

          <Button asChild className="flex items-center gap-2">
            <Link href={homeLink}>
              <Home size={16} />
              Ir al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
