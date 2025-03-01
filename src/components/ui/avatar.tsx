"use client"

import React, { useState, useEffect } from 'react';
import { OptimizedImage, ImageSize } from './OptimizedImage';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';
import { useTypeGuards } from '@/hooks/useTypeGuards';
import { useEfficiencyOptimizations } from '@/hooks/useEfficiencyOptimizations';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: ImageSize;
  initials?: string;
  fallback?: string;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  statusPosition?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  loading?: boolean;
  showSkeleton?: boolean;
  onClick?: () => void;
}

// Función auxiliar fuera del componente para procesar iniciales
const getInitials = (text?: string, isEmail?: (value: string) => boolean): string => {
  if (!text) return '';

  // Si es un email, extraer iniciales de la parte local
  if (isEmail && isEmail(text)) {
    const localPart = text.split('@')[0];
    return localPart.substring(0, 2).toUpperCase();
  }

  // Si es un nombre completo, extraer iniciales de las palabras
  if (text.includes(' ')) {
    const parts = text.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
  }

  // Por defecto, tomar las primeras 2 letras
  return text.substring(0, 2).toUpperCase();
};

/**
 * Componente Avatar optimizado que muestra:
 * - Imagen si está disponible
 * - Iniciales como fallback
 * - Imagen genérica como último recurso
 * - Indicador de estado opcional
 * - Skeleton durante la carga
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  initials,
  fallback = '/placeholders/avatar-placeholder.png',
  className,
  status = 'none',
  statusPosition = 'bottom-right',
  loading = false,
  showSkeleton = true,
  onClick,
}) => {
  const { validators } = useTypeGuards();
  const { memoizeObject } = useEfficiencyOptimizations();

  const [isLoading, setIsLoading] = useState(loading);
  const [hasError, setHasError] = useState(false);

  // Si tenemos iniciales y no hay src, mostramos iniciales
  const showInitials = !src && initials && !hasError;

  // Actualizar el estado de carga cuando cambia la prop
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Memoizar los tamaños para evitar recálculos
  const sizeMap = memoizeObject(() => ({
    xs: { size: 24, fontSize: 'text-[10px]' },
    sm: { size: 32, fontSize: 'text-xs' },
    md: { size: 48, fontSize: 'text-sm' },
    lg: { size: 64, fontSize: 'text-base' },
    xl: { size: 96, fontSize: 'text-lg' },
  }), []);

  // Obtener tamaño y clase de fuente
  const sizeInfo = typeof size === 'string' ? sizeMap[size] || sizeMap.md : { size, fontSize: 'text-sm' };

  // Estado del usuario memoizado
  const statusClass = memoizeObject(() => ({
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    none: '',
  }), [])[status];

  // Posición del indicador de estado memoizada
  const statusPositionClass = memoizeObject(() => ({
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-left': 'top-0 left-0',
  }), [])[statusPosition];

  // Función para manejar la carga de la imagen
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Función para manejar errores de carga
  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Calcular iniciales usando la función auxiliar
  const validInitials = React.useMemo(() => {
    return getInitials(initials, validators.isValidEmail);
  }, [initials, validators.isValidEmail]);

  // Componente para mostrar el indicador de estado
  const StatusIndicator = React.useMemo(() => {
    if (status === 'none') return null;

    return (
      <span
        className={cn(
          'absolute border-2 border-background rounded-full',
          statusClass,
          statusPositionClass
        )}
        style={{
          width: Math.max(8, sizeInfo.size * 0.2),
          height: Math.max(8, sizeInfo.size * 0.2)
        }}
      />
    );
  }, [status, statusClass, statusPositionClass, sizeInfo.size]);

  // Si está cargando y debemos mostrar skeleton
  if (isLoading && showSkeleton) {
    return (
      <div className="relative inline-block">
        <Skeleton
          variant="circular"
          diameter={sizeInfo.size}
          className={className}
        />
        {StatusIndicator}
      </div>
    );
  }

  // Si mostramos iniciales
  if (showInitials) {
    return (
      <div
        className="relative inline-block cursor-pointer"
        onClick={onClick}
      >
        <div
          className={cn(
            'flex items-center justify-center bg-primary text-primary-foreground font-medium rounded-full',
            sizeInfo.fontSize,
            onClick && 'hover:opacity-90 transition-opacity',
            className
          )}
          style={{ width: sizeInfo.size, height: sizeInfo.size }}
        >
          {validInitials}
        </div>

        {StatusIndicator}
      </div>
    );
  }

  // Si mostramos imagen
  return (
    <div
      className="relative inline-block"
      onClick={onClick}
    >
      <OptimizedImage
        src={src ?? null}
        alt={alt || 'Avatar'}
        size={size}
        fallback={fallback}
        className={cn(onClick && 'cursor-pointer hover:opacity-90 transition-opacity', className)}
        rounded="full"
        onLoad={handleImageLoad}
        onError={handleImageError}
        showPlaceholder={showSkeleton}
      />

      {StatusIndicator}
    </div>
  );
};
