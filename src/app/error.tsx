'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  // Registrar el error en la consola (en producción podría enviarse a un servicio de monitoreo)
  useEffect(() => {
    console.error('Error en la aplicación:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-red-50 dark:to-red-950/20 p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <AlertCircle size={48} className="text-red-500 dark:text-red-400" />
            </div>
          </motion.div>

          <div className="bg-card shadow-lg rounded-lg p-8 pt-16 mt-8 border border-border">
            <h1 className="text-3xl font-bold text-foreground mb-2">¡Algo salió mal!</h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <p className="text-muted-foreground mb-6">
                Lo sentimos, hemos encontrado un error al procesar tu solicitud.
              </p>

              {error.digest && (
                <div className="px-3 py-1 text-xs font-mono bg-muted rounded mb-4 inline-block">
                  Error ID: {error.digest}
                </div>
              )}

              <div className="space-y-4">
                <Button
                  onClick={reset}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  Intentar nuevamente
                </Button>

                <Link href="/dashboard" className="block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full mt-3"
                  >
                    Volver al inicio
                  </Button>
                </Link>

                <div className="pt-4">
                  <Link
                    href="/support"
                    className="text-primary hover:underline text-sm"
                  >
                    Contactar a soporte técnico
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
