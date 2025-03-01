/**
 * Configuración centralizada del tema para Tailwind CSS
 * Este archivo define todos los tokens de diseño que se pueden usar en tailwind.config.js
 */

// Espaciado consistente
const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  xxl: "3rem", // 48px
};

// Colores del sistema
const colors = {
  // Colores de la marca
  primary: {
    DEFAULT: "#6d4a5c",
    light: "#8c6378",
    dark: "#523645",
    hover: "#7d5a6c",
    active: "#5d3a4c",
    foreground: "hsl(var(--primary-foreground))",
  },

  // Colores de interfaz
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",

  // Colores secundarios
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },

  // Estado de error
  destructive: {
    DEFAULT: "#e57373",
    light: "#ef9a9a",
    dark: "#ef5350",
    foreground: "hsl(var(--destructive-foreground))",
  },

  // Colores atenuados
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },

  // Colores de acento
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },

  // Elementos flotantes
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },

  // Tarjetas
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },

  // Gráficos
  chart: {
    1: "var(--chart-1)",
    2: "var(--chart-2)",
    3: "var(--chart-3)",
    4: "var(--chart-4)",
    5: "var(--chart-5)",
  },
};

// Sistema de tamaños de fuente
const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }],
  sm: ["0.875rem", { lineHeight: "1.25rem" }],
  base: ["1rem", { lineHeight: "1.5rem" }],
  lg: ["1.125rem", { lineHeight: "1.75rem" }],
  xl: ["1.25rem", { lineHeight: "1.75rem" }],
  "2xl": ["1.5rem", { lineHeight: "2rem" }],
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
};

// Sistema de bordes redondeados
const borderRadius = {
  none: "0",
  sm: "calc(var(--radius) - 4px)",
  DEFAULT: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
  full: "9999px",
};

// Transiciones consistentes
const transitionDuration = {
  fast: "150ms",
  DEFAULT: "200ms",
  slow: "300ms",
};

// Sombras estandarizadas
const boxShadow = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
  DEFAULT:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",
};

module.exports = {
  colors,
  spacing,
  fontSize,
  borderRadius,
  transitionDuration,
  boxShadow,
};
