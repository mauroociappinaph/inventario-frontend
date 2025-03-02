import React, { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLoading } from '@/hooks/useLoading';
import { AnimatePresence, motion } from 'framer-motion';

interface LoadingOverlayProps {
  loadingKey?: string;
  message?: string;
  showDelay?: number; // milisegundos antes de mostrar el overlay
  maxDuration?: number; // duración máxima del overlay en ms (seguridad)
}

export function LoadingOverlay({
  loadingKey = 'global',
  message = 'Cargando...',
  showDelay = 300,
  maxDuration = 15000, // 15 segundos como máximo por defecto
}: LoadingOverlayProps) {
  const { isLoading, stopLoading, resetAllLoadingStates } = useLoading();
  const [showSpinner, setShowSpinner] = React.useState(false);

  // Mecanismo de seguridad para evitar overlays permanentes
  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout | undefined;
    let safetyTimeout: NodeJS.Timeout | undefined;

    if (isLoading(loadingKey)) {
      // Solo mostrar el spinner después de un retraso para evitar flashes en cargas rápidas
      loadingTimeout = setTimeout(() => setShowSpinner(true), showDelay);

      // Mecanismo de seguridad: si el overlay permanece visible por más del tiempo máximo, forzar su cierre
      safetyTimeout = setTimeout(() => {
        console.warn(`LoadingOverlay para "${loadingKey}" forzado a cerrar después de ${maxDuration}ms`);
        resetAllLoadingStates();
        setShowSpinner(false);
      }, maxDuration);
    } else {
      setShowSpinner(false);
    }

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      if (safetyTimeout) clearTimeout(safetyTimeout);
    };
  }, [isLoading, loadingKey, showDelay, maxDuration, resetAllLoadingStates]);

  // Función para forzar el cierre del overlay manualmente
  const forceClose = () => {
    // Solo habilitado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Overlay cerrado manualmente');
      resetAllLoadingStates();
      setShowSpinner(false);
    }
  };

  // Si no estamos mostrando el spinner, no renderizar nada
  if (!showSpinner) return null;

  return (
    <AnimatePresence>
      {showSpinner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-visible={showSpinner.toString()}
          onClick={process.env.NODE_ENV === 'development' ? forceClose : undefined}
        >
          <div className="flex flex-col items-center justify-center p-4 rounded-lg">
            <LoadingSpinner
              size="lg"
              variant="primary"
              label={message}
              showLabel={true}
            />
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-2 text-xs text-muted-foreground cursor-pointer">
                (Haz clic para forzar cierre - solo en desarrollo)
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingOverlay;
