import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UI_ACTIONS } from './actionTypes';

// Tipos
export type SidebarVariant = "default" | "compact" | "expanded";
export type ThemeMode = 'light' | 'dark' | 'system';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  subItems?: SidebarItem[];
  activateOnSubItems?: boolean;
  badge?: {
    count: number;
    color: string;
  };
}

export interface SidebarSection {
  id?: string;
  title?: string;
  items: SidebarItem[];
}

// Interfaz del store
interface UIState {
  // Estado
  sidebarVariant: SidebarVariant;
  activeItemId: string | undefined;
  expandedItems: Record<string, boolean>;
  isDarkTheme: boolean;
  themeMode: ThemeMode;
  mobileMenuOpen: boolean;
  loadingItems: Record<string, boolean>;
  currentPath: string;

  // Acciones
  setSidebarVariant: (variant: SidebarVariant) => void;
  toggleSidebarVariant: () => void;
  setActiveItemId: (id: string | undefined) => void;
  toggleExpandItem: (itemId: string) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
  setItemLoading: (itemId: string, isLoading: boolean) => void;
  setCurrentPath: (path: string) => void;

  // Navegación
  navigateTo: (path: string, itemId?: string) => void;

  // Helpers
  expandParentOfActiveItem: (sections: SidebarSection[]) => void;
}

// Crear store
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarVariant: "default",
      activeItemId: "dashboard",
      expandedItems: {},
      isDarkTheme: false,
      themeMode: 'light', // Predeterminado a light
      mobileMenuOpen: false,
      loadingItems: {},
      currentPath: "/",

      // Acciones
      setSidebarVariant: (variant) => {
        console.log(`Dispatching action: ${UI_ACTIONS.SET_SIDEBAR_VARIANT}`);
        set({ sidebarVariant: variant });
      },

      toggleSidebarVariant: () => {
        console.log(`Dispatching action: ${UI_ACTIONS.TOGGLE_SIDEBAR_VARIANT}`);
        set((state) => ({
          sidebarVariant: state.sidebarVariant === "default" ? "compact" : "default"
        }));
      },

      setActiveItemId: (id) => {
        console.log(`Dispatching action: ${UI_ACTIONS.SET_ACTIVE_ITEM_ID}`);
        set({ activeItemId: id });
      },

      toggleExpandItem: (itemId) => {
        console.log(`Dispatching action: ${UI_ACTIONS.TOGGLE_EXPAND_ITEM}`);
        set((state) => ({
          expandedItems: {
            ...state.expandedItems,
            [itemId]: !state.expandedItems[itemId]
          }
        }));
      },

      toggleTheme: () => {
        console.log(`Dispatching action: ${UI_ACTIONS.TOGGLE_THEME}`);
        const newTheme = !get().isDarkTheme;
        set({
          isDarkTheme: newTheme,
          themeMode: newTheme ? 'dark' : 'light'
        });
      },

      setThemeMode: (mode) => {
        console.log(`Dispatching action: Setting theme mode to ${mode}`);
        set({
          themeMode: mode,
          // Solo actualizamos isDarkTheme si no estamos en modo sistema
          ...(mode !== 'system' && { isDarkTheme: mode === 'dark' })
        });
      },

      setMobileMenuOpen: (isOpen) => {
        console.log(`Dispatching action: ${UI_ACTIONS.SET_MOBILE_MENU_OPEN}`);
        set({ mobileMenuOpen: isOpen });
      },

      toggleMobileMenu: () => {
        console.log(`Dispatching action: ${UI_ACTIONS.TOGGLE_MOBILE_MENU}`);
        set((state) => ({
          mobileMenuOpen: !state.mobileMenuOpen
        }));
      },

      setItemLoading: (itemId, isLoading) => {
        console.log(`Dispatching action: ${UI_ACTIONS.SET_ITEM_LOADING}`);
        set((state) => ({
          loadingItems: {
            ...state.loadingItems,
            [itemId]: isLoading
          }
        }));
      },

      setCurrentPath: (path) => {
        console.log(`Dispatching action: ${UI_ACTIONS.SET_CURRENT_PATH}`);
        set({ currentPath: path });
      },

      // Combinación de funcionalidades para navegación
      navigateTo: (path, itemId) => {
        console.log(`Dispatching action: ${UI_ACTIONS.NAVIGATE_TO}`);
        // Si se proporciona un ID, establecerlo como activo
        if (itemId) {
          set({ activeItemId: itemId });
        }

        // Establecer la ruta actual
        set({ currentPath: path });

        // En una implementación real, aquí se usaría el router
        // Este método será complementado por un hook personalizado
      },

      // Helper para expandir automáticamente el padre del item activo
      expandParentOfActiveItem: (sections) => {
        console.log(`Dispatching action: ${UI_ACTIONS.EXPAND_PARENT_OF_ACTIVE_ITEM}`);
        const activeId = get().activeItemId;
        if (!activeId) return;

        let needsUpdate = false;
        const newExpandedItems = { ...get().expandedItems };

        sections.forEach(section => {
          section.items.forEach(item => {
            if (
              item.subItems?.some(subItem => subItem.id === activeId) &&
              !get().expandedItems[item.id]
            ) {
              newExpandedItems[item.id] = true;
              needsUpdate = true;
            }
          });
        });

        if (needsUpdate) {
          set({ expandedItems: newExpandedItems });
        }
      }
    }),
    {
      name: 'ui-storage', // Nombre para localStorage
      partialize: (state) => ({
        // Solo persistir estas propiedades
        sidebarVariant: state.sidebarVariant,
        activeItemId: state.activeItemId,
        expandedItems: state.expandedItems,
        isDarkTheme: state.isDarkTheme,
      }),
    }
  )
);
