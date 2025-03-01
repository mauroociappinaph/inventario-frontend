'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transition?: {
    type?: 'fade' | 'slide' | 'scale' | 'none';
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
  };
}

export function PageTransition({
  children,
  className,
  transition = { type: 'fade', duration: 0.3 }
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const getTransitionStyle = () => {
    const { type, direction, duration = 0.3 } = transition;
    const transitionDuration = `${duration}s`;

    if (type === 'none') {
      return {};
    }

    const baseStyle = {
      transition: `opacity ${transitionDuration}, transform ${transitionDuration}`,
      opacity: isVisible ? 1 : 0,
    };

    switch (type) {
      case 'slide':
        const slideDistance = '20px';
        let transform = '';

        switch (direction) {
          case 'left':
            transform = `translateX(${isVisible ? '0' : `-${slideDistance}`})`;
            break;
          case 'right':
            transform = `translateX(${isVisible ? '0' : slideDistance})`;
            break;
          case 'up':
            transform = `translateY(${isVisible ? '0' : `-${slideDistance}`})`;
            break;
          case 'down':
          default:
            transform = `translateY(${isVisible ? '0' : slideDistance})`;
            break;
        }

        return { ...baseStyle, transform };

      case 'scale':
        return {
          ...baseStyle,
          transform: `scale(${isVisible ? 1 : 0.95})`,
        };

      case 'fade':
      default:
        return baseStyle;
    }
  };

  return (
    <div
      className={cn('w-full', className)}
      style={getTransitionStyle()}
    >
      {children}
    </div>
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
