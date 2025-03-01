import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/ui/navbar';

const inter = Inter({ subsets: ['latin'] });

// Metadatos de la aplicación para SEO
export const metadata: Metadata = {
  title: 'Sistema de Gestión de Inventario',
  description: 'Sistema de gestión de inventario corporativo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-100`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 p-4">
              {children}
            </main>
            <footer className="py-4 px-6 bg-sky-100 border-t border-sky-200 text-sky-700 text-center text-sm dark:bg-sky-900 dark:border-sky-800 dark:text-sky-300">
              © {new Date().getFullYear()} InvSystem - Sistema de Gestión de Inventario
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
