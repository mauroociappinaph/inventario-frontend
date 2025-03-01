'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';
import { Skeleton } from './skeleton-loader';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  fallbackType?: 'spinner' | 'skeleton' | 'blur';
  minHeight?: string | number;
  label?: string;
}

export function LoadingState({
  isLoading,
  children,
  skeleton,
  spinnerSize = 'md',
  className,
  fallbackType = 'spinner',
  minHeight = '100px',
  label,
}: LoadingStateProps) {
  // Si no está cargando, mostrar los hijos
  if (!isLoading) {
    return <>{children}</>;
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

  // Determinar qué tipo de estado de carga mostrar
  switch (fallbackType) {
    case 'skeleton':
      // Esqueleto personalizado o esqueleto predeterminado
      return skeleton || (
        <div className={baseClasses} style={{ minHeight: getMinHeight() }}>
          <Skeleton
            variant="default"
            count={3}
            className="w-full"
            height={25}
          />
        </div>
      );

    case 'blur':
      // Mostrar los hijos pero con efecto borroso
      return (
        <div className={baseClasses} style={{ minHeight: getMinHeight() }}>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <LoadingSpinner
              size={spinnerSize}
              variant="primary"
              label={label}
              showLabel={!!label}
            />
          </div>
          <div className="blur-sm opacity-50 pointer-events-none">
            {children}
          </div>
        </div>
      );

    case 'spinner':
    default:
      // Mostrar un spinner centrado
      return (
        <div
          className={cn(baseClasses, 'flex items-center justify-center')}
          style={{ minHeight: getMinHeight() }}
        >
          <LoadingSpinner
            size={spinnerSize}
            variant="primary"
            label={label}
            showLabel={!!label}
          />
        </div>
      );
  }
}

export default LoadingState;
