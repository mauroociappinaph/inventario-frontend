'use client';

import { PageTransition } from '@/components/layout/page-transition';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, BarChart2, BarChart3, Clock, Package, PackageCheck, ShieldCheck, TrendingUp, User } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.roles?.includes('admin');

  const dashboardPath = isAuthenticated
    ? (isAdmin ? "/dashboard" : "/user-dashboard")
    : "/login";

  const inventoryPath = isAuthenticated
    ? (isAdmin ? "/dashboard/inventory" : "/user-dashboard/inventory")
    : "/login";

  return (
    <PageTransition
      transition={{ type: 'fade', duration: 0.5 }}
      className="flex flex-col items-center min-h-[80vh] gap-8 px-4 py-10"
    >
      {/* Sección Hero */}
      <div className="text-center mb-8 max-w-3xl">
        <Badge className="mb-4" variant="outline">Versión 1.0</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-sky-700 dark:text-sky-300">
          Sistema de Gestión de Inventario
        </h1>
        <p className="text-lg mb-8 text-sky-600 dark:text-sky-400 max-w-2xl mx-auto">
          Administra todo tu inventario desde un solo lugar. Controla stock, productos y movimientos con una interfaz moderna y fácil de usar.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={"/login"}>
            <Button size="lg" className="gap-2 active:scale-95">
              Iniciar Sesión <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link href="/register">
              <Button size="lg" variant="outline" className="gap-2 active:scale-95">
                Registrarse <User className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="w-full max-w-6xl mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center text-sky-700 dark:text-sky-300">
          Optimiza tu negocio con datos en tiempo real
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Productos Gestionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+10,000</div>
              <div className="flex items-center mt-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Aumenta 15% mensual</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Ahorrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">40 hrs/mes</div>
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>Por usuario en promedio</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Precisión de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.8%</div>
              <div className="flex items-center mt-1 text-xs text-green-600">
                <PackageCheck className="h-3 w-3 mr-1" />
                <span>Reducción de errores</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">250%</div>
              <div className="flex items-center mt-1 text-xs text-green-600">
                <BarChart2 className="h-3 w-3 mr-1" />
                <span>En el primer año</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Características Principales */}
      <div className="w-full max-w-6xl mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center text-sky-700 dark:text-sky-300">
          Características Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="bg-sky-100 p-3 rounded-full w-fit dark:bg-sky-900">
                <Package className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <CardTitle className="mt-4">Gestión de Productos</CardTitle>
              <CardDescription>
                Administra todos tus productos, categorías y detalles en un solo lugar.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Organización por categorías
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Asignación de SKUs
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Imágenes y descripciones
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="bg-sky-100 p-3 rounded-full w-fit dark:bg-sky-900">
                <BarChart3 className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <CardTitle className="mt-4">Control de Inventario</CardTitle>
              <CardDescription>
                Monitorea tu stock en tiempo real y evita quiebres o excedentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Alertas de stock bajo
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Registro de movimientos
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Historial de cambios
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="bg-sky-100 p-3 rounded-full w-fit dark:bg-sky-900">
                <ShieldCheck className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <CardTitle className="mt-4">Seguridad y Acceso</CardTitle>
              <CardDescription>
                Define permisos y roles para cada usuario de tu sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Múltiples niveles de acceso
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Registro de actividad
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2"></div>
                  Autenticación segura
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mb-12">
        {/* Tarjeta de Dashboard */}
        <Link href={dashboardPath} className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900/50 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <BarChart3 className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Dashboard</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Visualiza estadísticas y métricas importantes
            </p>
          </div>
        </Link>

        {/* Tarjeta de Inventario */}
        <Link href={inventoryPath} className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900/50 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <Package className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">Gestión de Inventario</h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              Controla stock, entradas y salidas de productos
            </p>
          </div>
        </Link>

        {/* Tarjeta de Login o Perfil */}
        <Link href={isAuthenticated ? "/profile" : "/login"} className="block">
          <div className="group h-full flex flex-col items-center p-6 bg-white rounded-xl border border-sky-200 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:bg-sky-900/50 dark:border-sky-700 dark:hover:border-sky-600">
            <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 dark:bg-sky-800 dark:group-hover:bg-sky-700">
              <User className="h-8 w-8 text-sky-600 dark:text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-300">
              {isAuthenticated ? "Mi Perfil" : "Iniciar Sesión"}
            </h2>
            <p className="text-center text-sky-600 dark:text-sky-400">
              {isAuthenticated ? "Accede a la configuración de tu cuenta" : "Accede a tu cuenta para gestionar tu inventario"}
            </p>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="w-full text-center border-t pt-8 text-muted-foreground">
        <p>© 2023 Sistema de Gestión de Inventario. Todos los derechos reservados.</p>
      </div>
    </PageTransition>
  );
}

