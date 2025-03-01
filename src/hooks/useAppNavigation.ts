import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook personalizado que combina el manejo de estado de UI con el router de Next.js
 * para proporcionar funcionalidades de navegación integradas.
 */
export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    navigateTo: storeNavigateTo,
    setCurrentPath,
    setActiveItemId,
    currentPath,
    activeItemId
  } = useUIStore();

  // Actualizar la ruta actual en el store cuando cambia el pathname
  useEffect(() => {
    if (pathname && pathname !== currentPath) {
      setCurrentPath(pathname);
    }
  }, [pathname, currentPath, setCurrentPath]);

  // Función de navegación que combina Zustand con el router de Next.js
  const navigateTo = (path: string, itemId?: string) => {
    // Actualizar el estado en Zustand
    if (itemId) {
      setActiveItemId(itemId);
    }

    // Actualizar la ruta en Zustand
    setCurrentPath(path);

    // Usar el router de Next.js para la navegación real
    router.push(path);
  };

  return {
    navigateTo,
    currentPath,
    activeItemId,
    router
  };
}
