'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  className?: string;
  transition?: {
    type?: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
    duration?: number;
  };
}

// Variantes predefinidas para diferentes tipos de animaciones
const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  rotate: {
    initial: { rotate: 5, opacity: 0, scale: 0.9 },
    animate: { rotate: 0, opacity: 1, scale: 1 },
    exit: { rotate: -5, opacity: 0, scale: 0.9 },
  },
  custom: {
    // Este es para cuando se quiere personalizar completamente
    initial: {},
    animate: {},
    exit: {},
  },
};

export function PageTransition({
  children,
  mode = 'wait',
  className = '',
  transition = { type: 'fade', duration: 0.3 },
}: PageTransitionProps) {
  const pathname = usePathname();
  const { type = 'fade', duration = 0.3 } = transition;

  // Aplicar la variante seleccionada
  const selectedVariant = variants[type] || variants.fade;

  return (
    <AnimatePresence mode={mode} initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={selectedVariant}
        transition={{
          duration,
          ease: 'easeInOut',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Componente de transición con Lazy Loading
export function LazyPageTransition(props: PageTransitionProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className={props.className}>{props.children}</div>;
  }

  return <PageTransition {...props} />;
}

export default PageTransition;
