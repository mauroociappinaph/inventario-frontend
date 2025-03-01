import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard - Sistema de Gestión de Inventario",
  description: "Panel de control para gestionar el inventario de tu empresa",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Script para limpiar atributos que causan errores de hidratación */}
        <Script id="cleanup-attributes">
          {`
            function cleanupAttributes() {
              document.documentElement.removeAttribute('data-lt-installed');
              document.documentElement.removeAttribute('cz-shortcut-listen');
              document.body.removeAttribute('data-lt-installed');
              document.body.removeAttribute('cz-shortcut-listen');
            }

            // Ejecutar inmediatamente
            cleanupAttributes();

            // Ejecutar después de un breve retraso
            setTimeout(cleanupAttributes, 100);

            // Ejecutar periódicamente
            setInterval(cleanupAttributes, 1000);
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
