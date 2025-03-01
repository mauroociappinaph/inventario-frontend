/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // Permite producción con advertencias de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante la compilación
    ignoreBuildErrors: true,
  },
  compiler: {
    // Eliminar console.logs en producción
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Añadir configuración de imágenes
  images: {
    domains: ["hebbkx1anhila5yf.public.blob.vercel-storage.com"],
  },
  experimental: {
    // Opciones experimentales que pueden ayudar con problemas de hidratación
    optimizeCss: false,
    scrollRestoration: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Ignorar errores de hidratación en desarrollo
  onDemandEntries: {
    // periodo en ms en el que el servidor eliminará páginas no utilizadas
    maxInactiveAge: 60 * 60 * 1000,
    // número de páginas que se mantendrán en memoria
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
