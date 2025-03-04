'use client';

import LoadingOverlay from '@/components/layout/loading-overlay';
import NoSSR from '@/components/no-ssr';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { AuthProvider } from '@/context/auth-context';
import { LoadingProvider, useLoading } from '@/hooks/useLoading';
import { initAutoRenew } from '@/lib/api/auto-renew';
import { ThemeProvider } from 'next-themes';
import React, { useEffect, useState } from 'react';

// Componente dedicado para el botón de reseteo
function ResetButton() {
  const { resetAllLoadingStates } = useLoading();

  const handleReset = () => {
    resetAllLoadingStates();
    console.log('Estado de carga reseteado por botón de emergencia');
    // Recargar la página después de un tiempo
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[1000]">
      <button
        className="bg-red-500 text-white px-2 py-1 text-xs rounded-md shadow-md opacity-50 hover:opacity-100 transition-opacity"
        onClick={handleReset}
      >
        Reset UI
      </button>
    </div>
  );
}

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

// Componente para inicializar la renovación automática de tokens
function AutoRenew() {
  useEffect(() => {
    // Solo inicializar en el cliente
    if (typeof window !== 'undefined') {
      console.log('Inicializando sistema de renovación automática de tokens');
      initAutoRenew();
    }

    // No es necesario cleanup ya que esto debe ejecutarse durante toda la vida de la aplicación
  }, []);

  return null; // Este componente no renderiza nada
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
              {process.env.NODE_ENV === 'development' && <ResetButton />}
              <ToastViewport />
              <AutoRenew />
            </ToastProvider>
          </AuthProvider>
        </LoadingProvider>
      </ClientThemeProvider>
    </NoSSR>
  );
}

export default Providers;
