import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLoading } from '@/hooks/useLoading';
import { AnimatePresence, motion } from 'framer-motion';

interface LoadingOverlayProps {
  loadingKey?: string;
  message?: string;
  showDelay?: number; // milisegundos antes de mostrar el overlay
}

export function LoadingOverlay({
  loadingKey = 'global',
  message = 'Cargando...',
  showDelay = 300,
}: LoadingOverlayProps) {
  const { isLoading } = useLoading();
  const [showSpinner, setShowSpinner] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading(loadingKey)) {
      // Solo mostrar el spinner después de un retraso para evitar flashes en cargas rápidas
      timeoutId = setTimeout(() => setShowSpinner(true), showDelay);
    } else {
      setShowSpinner(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, loadingKey, showDelay]);

  return (
    <AnimatePresence>
      {showSpinner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center justify-center p-4 rounded-lg">
            <LoadingSpinner
              size="lg"
              variant="primary"
              label={message}
              showLabel={true}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingOverlay;
