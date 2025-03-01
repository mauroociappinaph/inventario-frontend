"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type SidebarVariant = "default" | "compact" | "expanded";

interface UIState {
  sidebarVariant: SidebarVariant;
  setSidebarVariant: (variant: SidebarVariant) => void;
  activeItemId: string | undefined;
  setActiveItemId: (id: string | undefined) => void;
}

const UIStateContext = createContext<UIState | undefined>(undefined);

export function useUIState() {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error("useUIState debe usarse dentro de un UIStateProvider");
  }
  return context;
}

interface UIStateProviderProps {
  children: ReactNode;
  defaultSidebarVariant?: SidebarVariant;
  defaultActiveItemId?: string;
}

export function UIStateProvider({
  children,
  defaultSidebarVariant = "default",
  defaultActiveItemId = "dashboard",
}: UIStateProviderProps) {
  // Estado para la variante del sidebar con persistencia en localStorage
  const [sidebarVariant, setSidebarVariantState] = useState<SidebarVariant>(defaultSidebarVariant);

  // Estado para el ítem activo con persistencia en localStorage
  const [activeItemId, setActiveItemIdState] = useState<string | undefined>(defaultActiveItemId);

  // Cargar estado desde localStorage al montar el componente
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    try {
      // Recuperar preferencia de sidebar
      const savedSidebarVariant = localStorage.getItem("sidebarVariant") as SidebarVariant | null;
      if (savedSidebarVariant) {
        setSidebarVariantState(savedSidebarVariant);
      }

      // Recuperar ítem activo
      const savedActiveItemId = localStorage.getItem("activeItemId");
      if (savedActiveItemId) {
        setActiveItemIdState(savedActiveItemId);
      }
    } catch (error) {
      console.error("Error cargando el estado desde localStorage:", error);
    }
  }, []);

  // Función para cambiar la variante del sidebar con persistencia
  const setSidebarVariant = (variant: SidebarVariant) => {
    setSidebarVariantState(variant);
    try {
      localStorage.setItem("sidebarVariant", variant);
    } catch (error) {
      console.error("Error guardando la variante de sidebar:", error);
    }
  };

  // Función para cambiar el ítem activo con persistencia
  const setActiveItemId = (id: string | undefined) => {
    setActiveItemIdState(id);
    try {
      if (id) {
        localStorage.setItem("activeItemId", id);
      }
    } catch (error) {
      console.error("Error guardando el ítem activo:", error);
    }
  };

  // Proveer el estado y las funciones al árbol de componentes
  return (
    <UIStateContext.Provider
      value={{
        sidebarVariant,
        setSidebarVariant,
        activeItemId,
        setActiveItemId,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
}
