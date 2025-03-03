'use client';

import { useThemeShortcut } from '@/hooks/useThemeShortcut';

export function ThemeShortcutClient() {
  // Aplicamos directamente los atajos de teclado
  useThemeShortcut();

  // Este componente no renderiza nada visualmente
  return null;
}
