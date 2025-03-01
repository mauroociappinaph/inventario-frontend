/**
 * Sistema de Diseño - Tokens
 *
 * Este archivo define los tokens fundamentales del sistema de diseño.
 * Sirve como fuente única de verdad para valores de diseño consistentes.
 */

// Colores del sistema (complementan los de Tailwind)
export const COLORS = {
  primary: {
    light: "oklch(0.7 0.12 var(--primary-hue))",
    DEFAULT: "oklch(0.6 0.15 var(--primary-hue))",
    dark: "oklch(0.5 0.15 var(--primary-hue))",
  },
  // Puedes definir más colores específicos aquí
};

// Espaciado estándar
export const SPACING = {
  xs: "0.25rem",  // 4px
  sm: "0.5rem",   // 8px
  md: "1rem",     // 16px
  lg: "1.5rem",   // 24px
  xl: "2rem",     // 32px
  xxl: "3rem",    // 48px
};

// Tipografía - Tamaños de fuente
export const FONT_SIZE = {
  xs: "0.75rem",    // 12px
  sm: "0.875rem",   // 14px
  md: "1rem",       // 16px
  lg: "1.125rem",   // 18px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  "3xl": "1.875rem",// 30px
  "4xl": "2.25rem", // 36px
};

// Sombras estandarizadas
export const SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

// Importamos nuestras constantes existentes para mantener consistencia
import { ICON_SIZES, TRANSITIONS, BORDERS } from "@/lib/constants";
export { ICON_SIZES, TRANSITIONS, BORDERS };

// Estilos de componentes reutilizables
export const COMPONENT_STYLES = {
  card: {
    container: `${BORDERS.card} p-6`,
    header: "mb-4",
    title: "text-xl font-semibold",
    content: "text-muted-foreground",
  },
  sidebar: {
    container: `${BORDERS.sidebar} ${TRANSITIONS.standard}`,
    item: `${TRANSITIONS.fast} px-3 py-2 rounded-md`,
    activeItem: "bg-primary/10 text-primary",
  },
  // Puedes definir más componentes aquí
};
