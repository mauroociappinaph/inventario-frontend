"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUIState } from "@/providers/ui-state-provider";

interface NavigationContextType {
  navigateTo: (path: string, itemId?: string) => void;
  currentPath: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation debe usarse dentro de un NavigationProvider");
  }
  return context;
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setActiveItemId } = useUIState();
  const [currentPath, setCurrentPath] = useState(pathname);

  // Actualizar currentPath cuando cambie el pathname
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Función para navegar a una ruta y actualizar el estado global
  const navigateTo = (path: string, itemId?: string) => {
    router.push(path);

    // Si se proporciona un ID de elemento, actualizarlo en el estado global
    if (itemId) {
      setActiveItemId(itemId);
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        navigateTo,
        currentPath
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
