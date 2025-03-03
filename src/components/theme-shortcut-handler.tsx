'use client';

import { useThemeShortcut } from '@/hooks/useThemeShortcut';

export default function ThemeShortcutHandler() {
  // Habilitar atajos de teclado para el tema
  useThemeShortcut();

  // Este componente no renderiza nada
  return null;
}
