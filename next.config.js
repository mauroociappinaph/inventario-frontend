/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    styledComponents: true,
  },
  // Añadir configuración de imágenes
  images: {
    domains: [
      "localhost",
      "placeholders.dev",
      "placehold.co",
      "via.placeholder.com",
      "random.imagecdn.app",
      "picsum.photos",
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  // Optimización de código

  // Medir tamaño de bundles para optimización
  webpack: async (config, { isServer }) => {
    // Asegurarse de que el analizador de bundle solo se carga si está instalado
    if (process.env.ANALYZE === "true") {
      try {
        // Usar import dinámico para evitar el uso de require
        const { BundleAnalyzerPlugin } = await import(
          "webpack-bundle-analyzer"
        );
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "server",
            analyzerPort: isServer ? 8888 : 8889,
            openAnalyzer: true,
          })
        );
      } catch (error) {
        console.error(error);
        console.warn(
          "webpack-bundle-analyzer no está disponible. Instálalo con: npm install --save-dev webpack-bundle-analyzer"
        );
      }
    }

    return config;
  },
};

module.exports = nextConfig;
