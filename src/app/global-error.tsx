'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-red-100 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 border border-red-200 dark:border-red-900">
              <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">Error Crítico</h1>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ha ocurrido un error crítico en la aplicación. Por favor, intenta recargar la página.
              </p>

              {error.digest && (
                <div className="px-3 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded mb-4 inline-block">
                  Error ID: {error.digest}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={reset}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                >
                  Intentar nuevamente
                </button>

                <a href="/" className="block">
                  <button
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md font-medium transition-colors mt-3"
                  >
                    Volver al inicio
                  </button>
                </a>

                <div className="pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Si el problema persiste, por favor contacta al
                    soporte técnico o intenta más tarde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
