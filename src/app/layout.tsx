import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { NotificationProvider } from "@/contexts/notification-context";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Metadatos de la aplicación para SEO
export const metadata: Metadata = {
  title: "InvSystem",
  description: "Sistema de gestión de inventario",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className="light">
      <body
        className={cn('min-h-screen font-sans antialiased', inter.variable)}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ToastProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
