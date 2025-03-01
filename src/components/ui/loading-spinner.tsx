import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  label?: string;
  showLabel?: boolean;
  centered?: boolean;
  fullscreen?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4 border-2',
  sm: 'w-6 h-6 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

const variantClasses = {
  primary: 'border-primary border-t-transparent',
  secondary: 'border-secondary border-t-transparent',
  success: 'border-green-500 border-t-transparent',
  danger: 'border-red-500 border-t-transparent',
  warning: 'border-yellow-500 border-t-transparent',
  info: 'border-blue-500 border-t-transparent',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  label = 'Cargando...',
  showLabel = false,
  centered = false,
  fullscreen = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    fullscreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
    centered && 'w-full h-full',
    className
  );

  const spinnerClasses = cn(
    'animate-spin rounded-full',
    sizeClasses[size],
    variantClasses[variant]
  );

  const labelClasses = cn(
    'mt-2 text-sm font-medium',
    {
      'text-primary': variant === 'primary',
      'text-secondary': variant === 'secondary',
      'text-green-500': variant === 'success',
      'text-red-500': variant === 'danger',
      'text-yellow-500': variant === 'warning',
      'text-blue-500': variant === 'info',
    }
  );

  return (
    <div className={containerClasses} {...props}>
      <div className={spinnerClasses} />
      {showLabel && <span className={labelClasses}>{label}</span>}
    </div>
  );
}

export default LoadingSpinner;
