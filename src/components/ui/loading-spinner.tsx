"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  label?: string;
  showLabel?: boolean;
  className?: string;
  labelClassName?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  label = 'Cargando...',
  showLabel = false,
  className,
  labelClassName
}: LoadingSpinnerProps) {
  // Determinar el tamaño del spinner
  const sizeClasses = {
    xs: 'h-3 w-3 border-[2px]',
    sm: 'h-4 w-4 border-[2px]',
    md: 'h-6 w-6 border-[3px]',
    lg: 'h-8 w-8 border-[3px]',
    xl: 'h-12 w-12 border-[4px]'
  };

  // Determinar colores según la variante
  const variantClasses = {
    primary: 'border-sky-200 border-t-sky-600 dark:border-sky-700 dark:border-t-sky-400',
    secondary: 'border-sky-100 border-t-sky-300 dark:border-sky-800 dark:border-t-sky-600',
    white: 'border-white/40 border-t-white'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium text-sky-700 dark:text-sky-300',
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;
