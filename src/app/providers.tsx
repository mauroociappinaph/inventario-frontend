'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { LoadingProvider } from '@/hooks/useLoading';
import { ToastViewport, ToastProvider } from '@/components/ui/toast';
import LoadingOverlay from '@/components/layout/loading-overlay';
import { AuthProvider } from '@/context/auth-context';
import NoSSR from '@/components/no-ssr';

// Componente dedicado para el proveedor de tema con supresión de errores de hidratación
function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Solo renderizar el contenido completo cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Durante la renderización del servidor o primera renderización en el cliente,
  // renderizar un HTML mínimo para evitar discrepancias de hidratación
  if (!mounted) {
    // Devolver un div vacío con el mismo className que se espera en el cliente
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NoSSR>
      <ClientThemeProvider>
        <LoadingProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <LoadingOverlay />
              <ToastViewport />
            </ToastProvider>
          </AuthProvider>
        </LoadingProvider>
      </ClientThemeProvider>
    </NoSSR>
  );
}

export default Providers;
