'use client';

import Link from "next/link"
import { Package, Database, BarChart3, Settings, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageTransition } from '@/components/layout/page-transition'

export default function Home() {
  return (
    <PageTransition
      transition={{ type: 'fade', duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-sky-700 dark:text-sky-300">
          InvSystem
        </h1>
        <p className="text-lg max-w-2xl text-sky-600 dark:text-sky-400">
          Sistema de gestión de inventario
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Tarjeta de Inventario */}
        <Link href="/inventory" className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <Package className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Inventario</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Gestiona tus productos, stock y categorías
            </p>
          </div>
        </Link>

        {/* Tarjeta de Dashboard */}
        <Link href="/dashboard" className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <BarChart3 className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Dashboard</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Visualiza estadísticas y métricas importantes
            </p>
          </div>
        </Link>

        {/* Tarjeta de Configuración */}
        <Link href="/settings" className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <Settings className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Configuración</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Personaliza las opciones del sistema
            </p>
          </div>
        </Link>

        {/* Tarjeta de Base de Datos */}
        <Link href="/database" className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <Database className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Base de Datos</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Administra los datos del sistema
            </p>
          </div>
        </Link>

        {/* Tarjeta de Usuarios */}
        <Link href="/login" className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <User className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Login</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Inicia sesión en el sistema
            </p>
          </div>
        </Link>

        {/* Tarjeta de Documentación */}
        <Link href="/register" className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <FileText className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Registro</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Regístrate en el sistema
            </p>
          </div>
        </Link>
      </div>
    </PageTransition>
  );
}

