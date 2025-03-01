import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variante del skeleton
   */
  variant?: 'rectangular' | 'circular' | 'text' | 'button';

  /**
   * Tamaño predefinido (solo para variantes text y button)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Indica si el skeleton debe animar su opacidad
   */
  animate?: boolean;

  /**
   * Altura para variante rectangular
   */
  height?: number | string;

  /**
   * Ancho para variante rectangular
   */
  width?: number | string;

  /**
   * Si la variante circular, este es el diámetro
   */
  diameter?: number | string;
}

/**
 * Componente Skeleton para mostrar estados de carga
 * Usado como placeholder mientras se cargan datos o imágenes
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  size = 'md',
  animate = true,
  height,
  width,
  diameter,
  ...props
}) => {
  // Mapeo de tamaños según la variante
  const sizeMap = {
    text: {
      xs: { height: '1rem', width: '80%' },
      sm: { height: '1.25rem', width: '85%' },
      md: { height: '1.5rem', width: '90%' },
      lg: { height: '1.75rem', width: '95%' },
      xl: { height: '2rem', width: '100%' },
    },
    button: {
      xs: { height: '1.5rem', width: '4rem' },
      sm: { height: '2rem', width: '6rem' },
      md: { height: '2.5rem', width: '8rem' },
      lg: { height: '3rem', width: '10rem' },
      xl: { height: '3.5rem', width: '12rem' },
    },
    circular: {
      xs: { diameter: '1.5rem' },
      sm: { diameter: '2rem' },
      md: { diameter: '3rem' },
      lg: { diameter: '4rem' },
      xl: { diameter: '6rem' },
    },
    rectangular: {
      xs: { height: '2rem', width: '100%' },
      sm: { height: '4rem', width: '100%' },
      md: { height: '6rem', width: '100%' },
      lg: { height: '10rem', width: '100%' },
      xl: { height: '16rem', width: '100%' },
    },
  };

  // Obtener dimensiones según variante y tamaño
  let dimensions: { [key: string]: string | number } = {};

  if (variant === 'circular') {
    const diam = diameter || sizeMap.circular[size].diameter;
    dimensions = {
      width: diam,
      height: diam,
      borderRadius: '50%'
    };
  } else if (variant === 'text' || variant === 'button') {
    dimensions = {
      height: height || sizeMap[variant][size].height,
      width: width || sizeMap[variant][size].width,
      borderRadius: variant === 'button' ? '0.375rem' : '0.25rem'
    };
  } else {
    // Rectangular
    dimensions = {
      height: height || sizeMap.rectangular[size].height,
      width: width || sizeMap.rectangular[size].width,
      borderRadius: '0.25rem'
    };
  }

  return (
    <div
      className={cn(
        'skeleton bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        className
      )}
      style={dimensions}
      {...props}
    />
  );
};

/**
 * Componente para mostrar un grupo de skeletons simulando contenido
 */
export const SkeletonGroup: React.FC<{
  count?: number;
  gap?: number;
  variant?: 'paragraph' | 'card' | 'list' | 'table';
  className?: string;
}> = ({ count = 3, gap = 4, variant = 'paragraph', className }) => {
  if (variant === 'paragraph') {
    return (
      <div className={cn('space-y-2', className)} style={{ gap: `${gap}px` }}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={`${Math.max(60, 100 - (i * 10))}%`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn('border rounded-lg p-4 shadow-sm', className)}
      >
        <Skeleton variant="rectangular" height={160} className="mb-4" />
        <Skeleton variant="text" width="70%" className="mb-2" />
        <Skeleton variant="text" width="90%" className="mb-4" />
        <div className="flex justify-between">
          <Skeleton variant="button" size="sm" />
          <Skeleton variant="circular" size="sm" />
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={cn('space-y-3', className)}
        style={{ gap: `${gap}px` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton variant="circular" size="sm" className="mr-3" />
            <div className="flex-1">
              <Skeleton variant="text" width="40%" className="mb-1" />
              <Skeleton variant="text" width="80%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 px-2">
              <Skeleton variant="text" size="sm" width="80%" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex-1 px-2">
                  <Skeleton variant="text" size="sm" width="90%" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
