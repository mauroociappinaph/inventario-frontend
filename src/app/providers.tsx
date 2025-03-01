'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { LoadingProvider } from '@/hooks/useLoading';
import { ToastViewport, ToastProvider } from '@/components/ui/toast';
import LoadingOverlay from '@/components/layout/loading-overlay';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LoadingProvider>
        <ToastProvider>
          {children}
          <LoadingOverlay />
          <ToastViewport />
        </ToastProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default Providers;
