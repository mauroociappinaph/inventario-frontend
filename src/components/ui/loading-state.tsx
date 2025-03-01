'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';
import { Skeleton } from './skeleton-loader';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallbackType?: 'spinner' | 'skeleton' | 'blur' | 'none';
  skeleton?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg';
  minHeight?: string | number;
  label?: string;
}

export function LoadingState({
  isLoading,
  children,
  fallbackType = 'skeleton',
  skeleton,
  fallback,
  className,
  spinnerSize = 'md',
  minHeight = '100px',
  label,
}: LoadingStateProps) {
  // Si no está cargando, mostrar los hijos
  if (!isLoading) {
    return <>{children}</>;
  }

  // Si hay un fallback personalizado, usarlo
  if (fallback) {
    return <>{fallback}</>;
  }

  // Convertir minHeight a CSS válido
  const getMinHeight = () => {
    if (typeof minHeight === 'number') {
      return `${minHeight}px`;
    }
    return minHeight;
  };

  const baseClasses = cn(
    'relative transition-all duration-300 ease-in-out',
    className
  );

  // Diferentes tipos de estados de carga
  switch (fallbackType) {
    case 'spinner':
      return (
        <div className="flex items-center justify-center w-full h-40">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600 dark:border-sky-700 dark:border-t-sky-400"></div>
        </div>
      );
    case 'skeleton':
      if (skeleton) {
        return <>{skeleton}</>;
      }
      return <Skeleton count={5} className="h-10 mb-4" />;
    case 'blur':
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-sky-50/80 backdrop-blur-sm dark:bg-sky-900/80 z-10 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600 dark:border-sky-700 dark:border-t-sky-400"></div>
          </div>
          <div className="opacity-50">{children}</div>
        </div>
      );
    case 'none':
    default:
      return <>{children}</>;
  }
}

export default LoadingState;
