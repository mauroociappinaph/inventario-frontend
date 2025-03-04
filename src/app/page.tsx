'use client';

import { PageTransition } from '@/components/layout/page-transition';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { InventoryStats, dashboardService } from '@/lib/api/dashboard-service';
import { ArrowRight, BarChart2, BarChart3, Clock, Package, PackageCheck, TrendingUp, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);

  // Obtener estadísticas básicas al cargar la página
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Si estamos autenticados, obtener datos reales
        if (isAuthenticated) {
          // Verificación adicional de token para evitar errores 401
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.log('Token no disponible. Usando datos simulados...');
            const simulatedStats = dashboardService.getSimulatedInventoryStats();
            setInventoryStats(simulatedStats);
            return;
          }

          console.log('Solicitando estadísticas reales con token...');
          const stats = await dashboardService.getInventoryStats();
          setInventoryStats(stats);
        } else {
          // Si no estamos autenticados, usar datos simulados
          console.log('Usuario no autenticado. Usando datos simulados...');
          const simulatedStats = dashboardService.getSimulatedInventoryStats();
          setInventoryStats(simulatedStats);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        // En caso de error (incluyendo 401), mostrar datos simulados
        console.log('Error en la petición. Usando datos simulados como fallback...');
        const simulatedStats = dashboardService.getSimulatedInventoryStats();
        setInventoryStats(simulatedStats);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Para la landing page, siempre mostrar 250% como ROI (valor fijo, solo informativo)
  // Para usuarios autenticados, el valor real se mostrará en su dashboard
  const roiValue = 250; // Valor fijo para la landing page

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
              <div className="text-2xl font-bold">{roiValue}%</div>
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

        </div>
      </div>





    </PageTransition>
  );
}

