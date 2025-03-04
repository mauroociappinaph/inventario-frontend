/** @type {import('next').NextConfig} */

// Importar aquí para evitar problemas con async/await o require
let BundleAnalyzerPlugin;
try {
  // Evitar errores si webpack-bundle-analyzer no está instalado
  BundleAnalyzerPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
} catch (e) {
  // Silenciar error
  console.log(e);
}

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
    styledComponents: true,
  },
  // Configuración del proxy de la API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*'
      }
    ]
  },
  // Añadir configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "placeholders.dev",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "random.imagecdn.app",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
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

  // Medir tamaño de bundles para optimización
  webpack: (config, { isServer }) => {
    // Asegurarse de que el analizador de bundle solo se carga si está instalado
    if (process.env.ANALYZE === "true" && BundleAnalyzerPlugin) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
