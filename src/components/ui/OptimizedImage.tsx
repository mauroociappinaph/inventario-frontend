import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTypeGuards } from '@/hooks/useTypeGuards';
import { Skeleton } from './skeleton'; // Asumiendo que existe un componente Skeleton

// Tipos de tamaños predefinidos
export type ImageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

// Formatos de imagen soportados
export type ImageFormat = 'default' | 'webp' | 'avif' | 'png' | 'jpg' | 'jpeg';

// Opciones adicionales para Avatar
interface ImageOptions {
  fallback?: string;
  alt?: string;
  className?: string;
  quality?: number;
  priority?: boolean;
  rounded?: boolean | 'full' | 'md' | 'lg' | 'sm';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  lazyLoad?: boolean;
  showPlaceholder?: boolean;
  placeholderColor?: string;
  blurDataURL?: string;
  format?: ImageFormat;
  onLoad?: () => void;
  onError?: () => void;
}

// Props del componente
interface OptimizedImageProps extends ImageOptions {
  src: string | null;
  size?: ImageSize;
}

/**
 * Mapeo de tamaños a dimensiones en píxeles
 */
const SIZE_MAP: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

/**
 * Componente de imagen optimizado que usa next/image
 * con soporte avanzado para fallbacks, lazy loading y formatos modernos
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = 'Imagen',
  size = 'md',
  fallback = '/placeholders/image-placeholder.png',
  className,
  quality = 80,
  priority = false,
  rounded = false,
  objectFit = 'cover',
  lazyLoad = true,
  showPlaceholder = true,
  placeholderColor = '#f3f4f6',
  blurDataURL,
  format = 'default',
  onLoad,
  onError,
}) => {
  const { ensureValue } = useTypeGuards();
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(src || fallback);

  // Manejar el tamaño
  const pixelSize = typeof size === 'string' ? SIZE_MAP[size] || SIZE_MAP.md : size;

  // Actualizar src cuando cambia la prop
  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(fallback);
    }
  }, [src, fallback]);

  // Manejar el src
  const processedSrc = React.useMemo(() => {
    // Si hay un error, usar fallback
    if (hasError) return fallback;

    // Si no hay src, usar fallback
    if (!imgSrc) return fallback;

    // Procesar según el formato solicitado si no es 'default'
    if (format !== 'default' && !hasError) {
      // Si ya es una URL completa, no modificar
      if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
        return imgSrc;
      }

      // Si es un path relativo, asegurarse de que tiene la extensión correcta
      const pathWithoutExtension = imgSrc.replace(/\.[^/.]+$/, '');
      return `${pathWithoutExtension}.${format}`;
    }

    // Normalizar path
    if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
      return imgSrc;
    }

    // Si comienza con /, es una ruta relativa al dominio
    if (imgSrc.startsWith('/')) {
      return imgSrc;
    }

    // De lo contrario, asumir que es una ruta relativa a la carpeta public
    return `/${imgSrc}`;
  }, [imgSrc, fallback, hasError, format]);

  // Determinar las clases de redondeo
  const roundedClasses = React.useMemo(() => {
    if (rounded === true || rounded === 'md') return 'rounded-md';
    if (rounded === 'full') return 'rounded-full';
    if (rounded === 'sm') return 'rounded-sm';
    if (rounded === 'lg') return 'rounded-lg';
    return '';
  }, [rounded]);

  // Manejar la carga de la imagen
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Manejar errores de carga
  const handleError = () => {
    setHasError(true);
    setImgSrc(fallback);
    setIsLoading(false);
    onError?.();
  };

  // Calcular blur data URL si no se proporciona
  const calculatedBlurDataURL = blurDataURL ||
    (showPlaceholder ? `data:image/svg+xml;base64,${Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${pixelSize} ${pixelSize}">
        <rect width="${pixelSize}" height="${pixelSize}" fill="${placeholderColor}"/>
      </svg>`
    ).toString('base64')}` : undefined);

  // Establecer estilos del contenedor
  const containerStyle = {
    width: pixelSize,
    height: pixelSize,
    backgroundColor: isLoading ? placeholderColor : 'transparent'
  };

  // Configurar el tamaño del objeto para la imagen
  const objectFitClass = {
    'cover': 'object-cover',
    'contain': 'object-contain',
    'fill': 'object-fill',
    'none': 'object-none'
  }[objectFit];

  return (
    <div
      className={cn(
        'overflow-hidden relative',
        roundedClasses,
        className
      )}
      style={containerStyle}
    >
      {isLoading && showPlaceholder && (
        <Skeleton className="absolute inset-0" />
      )}

      <Image
        src={processedSrc}
        alt={ensureValue(alt, 'Imagen')}
        width={pixelSize}
        height={pixelSize}
        quality={quality}
        priority={priority}
        loading={lazyLoad && !priority ? 'lazy' : undefined}
        className={cn(
          objectFitClass,
          'w-full h-full transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        placeholder={calculatedBlurDataURL ? 'blur' : undefined}
        blurDataURL={calculatedBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};
