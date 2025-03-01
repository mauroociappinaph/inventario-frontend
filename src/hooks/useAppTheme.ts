import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook personalizado que sincroniza el tema entre next-themes y nuestro store de UI.
 */
export function useAppTheme() {
  const { theme, setTheme } = useTheme();
  const { isDarkTheme, toggleTheme } = useUIStore();

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

  return {
    isDarkTheme,
    toggleTheme,
    theme,
    setTheme
  };
}
