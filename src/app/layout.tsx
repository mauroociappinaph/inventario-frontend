import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema de Control de Inventario",
  description: "Sistema de Control de Inventario para bares y restaurantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Script id="hydration-fix" strategy="afterInteractive">
          {`
            // Script para eliminar atributos problemáticos añadidos por extensiones
            function cleanupAttributes() {
              const html = document.documentElement;
              if (html.hasAttribute("data-lt-installed")) {
                html.removeAttribute("data-lt-installed");
              }

              const body = document.body;
              if (body.hasAttribute("cz-shortcut-listen")) {
                body.removeAttribute("cz-shortcut-listen");
              }
            }

            // Ejecutar inmediatamente
            cleanupAttributes();

            // Ejecutar después de un breve retraso
            setTimeout(cleanupAttributes, 100);

            // Ejecutar periódicamente
            setInterval(cleanupAttributes, 1000);
          `}
        </Script>
      </body>
    </html>
  );
}
