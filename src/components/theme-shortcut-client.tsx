'use client';

import dynamic from 'next/dynamic';

// Importamos dinámicamente el componente ThemeShortcutHandler con ssr: false
const ThemeShortcutHandler = dynamic(
  () => import('./theme-shortcut-handler'),
  { ssr: false }
);

export function ThemeShortcutClient() {
  return <ThemeShortcutHandler />;
}
