import { useEffect } from 'react';
import { useAppTheme } from './useAppTheme';

/**
 * Hook para agregar atajos de teclado para cambiar el tema
 * - Shift + D: Cambiar a tema oscuro
 * - Shift + L: Cambiar a tema claro
 * - Shift + S: Cambiar a tema del sistema
 * - Shift + T: Alternar entre claro y oscuro
 */
export function useThemeShortcut() {
  const { changeThemeMode, toggleTheme } = useAppTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo actuar si Shift está presionado
      if (event.shiftKey) {
        // Evitar ejecutar si el usuario está escribiendo en un campo
        const activeElement = document.activeElement;
        const isInputActive = activeElement instanceof HTMLInputElement ||
                             activeElement instanceof HTMLTextAreaElement ||
                             activeElement?.getAttribute('contenteditable') === 'true';

        if (isInputActive) return;

        switch (event.key.toLowerCase()) {
          case 'd': // Shift + D para modo oscuro
            event.preventDefault();
            changeThemeMode('dark');
            showThemeNotification('Tema oscuro activado');
            break;

          case 'l': // Shift + L para modo claro
            event.preventDefault();
            changeThemeMode('light');
            showThemeNotification('Tema claro activado');
            break;

          case 's': // Shift + S para modo sistema
            event.preventDefault();
            changeThemeMode('system');
            showThemeNotification('Tema del sistema activado');
            break;

          case 't': // Shift + T para alternar
            event.preventDefault();
            toggleTheme();
            break;
        }
      }
    };

    // Mostrar notificación temporal
    const showThemeNotification = (message: string) => {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-popover text-popover-foreground px-4 py-2 rounded-md shadow-md z-[100] transition-opacity duration-300';
      notification.textContent = message;
      document.body.appendChild(notification);

      // Desvanecer después de 1.5 segundos
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 1500);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeThemeMode, toggleTheme]);

  return null;
}
