import { useUIStore } from '@/stores/uiStore';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// Definir los tipos de tema disponibles
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Hook personalizado que sincroniza el tema entre next-themes y nuestro store de UI.
 * Añade soporte para modo "system" que sigue las preferencias del sistema operativo.
 */
export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isDarkTheme, toggleTheme, setThemeMode, themeMode } = useUIStore();
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Actualizar estado inicial
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    // Escuchar cambios
    const handler = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');

      // Si estamos en modo sistema, aplicar el cambio
      if (themeMode === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode, setTheme]);

  // Sincronizar el tema de la aplicación con next-themes cuando cambia en el store
  useEffect(() => {
    if (isDarkTheme && theme !== 'dark') {
      setTheme('dark');
    } else if (!isDarkTheme && theme !== 'light') {
      setTheme('light');
    }
  }, [isDarkTheme, theme, setTheme]);

  // Sincronizar el tema del store con next-themes cuando cambia externamente
  useEffect(() => {
    if (theme === 'dark' && !isDarkTheme) {
      toggleTheme();
    } else if (theme === 'light' && isDarkTheme) {
      toggleTheme();
    }
  }, [theme, isDarkTheme, toggleTheme]);

  // Función para cambiar el modo de tema
  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);

    if (mode === 'system') {
      // Aplicar preferencia del sistema
      setTheme(systemPreference);
    } else {
      // Aplicar modo específico
      setTheme(mode);
    }
  };

  return {
    isDarkTheme,
    toggleTheme,
    theme,
    setTheme,
    themeMode,
    systemPreference,
    changeThemeMode,
    isSystemDark: systemPreference === 'dark',
    // Para UI: indica qué tema se está mostrando realmente
    effectiveTheme: themeMode === 'system' ? systemPreference : theme
  };
}
