'use client';

import { useThemeShortcut } from '@/hooks/useThemeShortcut';

export function ClientThemeHandler() {
  // Activa los atajos de teclado para el tema
  useThemeShortcut();

  // Este componente no renderiza nada visualmente
  return null;
}
