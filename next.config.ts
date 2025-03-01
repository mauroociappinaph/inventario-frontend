/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    // Eliminar console.logs en producción
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    // Opciones experimentales que pueden ayudar con problemas de hidratación
    optimizeCss: false,
    scrollRestoration: true,
    serverActions: {
      bodySizeLimit: '2mb',
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

export default nextConfig;
