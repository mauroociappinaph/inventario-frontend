"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Home,
  Star,
  BarChart2,
  MessageSquare,
  Settings,
  Bell,
  Sun,
  Moon,
  Users,
  ShoppingCart,
  Command,
  X,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { InventoryChart } from "./inventory-chart"
import { EnhancedSidebar, SidebarUserInfo } from "./enhanced-sidebar"
import { SidebarSection } from "@/stores/uiStore"
import { cn } from "../lib/utils"
import { useUIStore } from "@/stores/uiStore"
import { useAppNavigation } from "@/hooks/useAppNavigation"
import { useAppTheme } from "@/hooks/useAppTheme"
import ActionSearchBar from "./actionSearchBar"
import { useInventory } from "@/hooks/useInventory"
import { Skeleton } from "./ui/skeleton"
import { Badge } from "./ui/badge"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)

  // Usar nuestros stores centralizados
  const { sidebarVariant, activeItemId } = useUIStore()
  const { isDarkTheme, toggleTheme } = useAppTheme()
  const { navigateTo } = useAppNavigation()

  // Obtener datos de inventario incluyendo estadísticas
  const {
    inventoryStats,
    inventoryStatsLoading
  } = useInventory();

  // Simulamos que los datos se cargan después de 2 segundos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        setIsLoading(true)

        // Simulación de carga de datos
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
        console.error("Error cargando datos del dashboard:", err)
      }
    }

    fetchData()
  }, [])

  const startTour = () => {
    console.log("Iniciando tour")
  }

  // Datos del usuario para el sidebar
  const userInfo: SidebarUserInfo = {
    name: "Usuario Demo",
    role: "Administrador",
    initials: "UD",
  }

  // Manejar clicks de los subitems con useCallback para evitar re-renderizados
  const handleProductList = useCallback(() => {
    navigateTo("/dashboard/products", "product-list")
  }, [navigateTo])

  const handleProductCategories = useCallback(() => {
    navigateTo("/dashboard/products/categories", "product-categories")
  }, [navigateTo])

  const handleProductInventory = useCallback(() => {
    navigateTo("/dashboard/inventory", "product-inventory")
  }, [navigateTo])

  const handleUserList = useCallback(() => {
    navigateTo("/dashboard/users", "user-list")
  }, [navigateTo])

  const handleUserRoles = useCallback(() => {
    navigateTo("/dashboard/users/roles", "user-roles")
  }, [navigateTo])

  // Definición memoizada de las secciones y elementos del sidebar
  const sidebarSections = useCallback(
    (): SidebarSection[] => [
      {
        id: "main",
        title: "Principal",
        items: [
          {
            id: "dashboard",
            icon: <Home className="h-4 w-4" />,
            label: "Dashboard",
            href: "/dashboard",
            badge: { count: 2, color: "bg-primary text-primary-foreground" },
          },
          {
            id: "stats",
            icon: <BarChart2 className="h-4 w-4" />,
            label: "Estadísticas",
            href: "/dashboard/stats",
          },
          {
            id: "products",
            icon: <Star className="h-4 w-4" />,
            label: "Productos",
            subItems: [
              { id: "product-list", label: "Listado", onClick: handleProductList },
              { id: "product-categories", label: "Categorías", onClick: handleProductCategories },
              { id: "product-inventory", label: "Inventario", onClick: handleProductInventory },
            ],
          },
          {
            id: "orders",
            icon: <ShoppingCart className="h-4 w-4" />,
            label: "Pedidos",
            href: "/dashboard/orders",
          },
          {
            id: "users",
            icon: <Users className="h-4 w-4" />,
            label: "Usuarios",
            badge: { count: 5, color: "bg-blue-500 text-white" },
            subItems: [
              { id: "user-list", label: "Listado", onClick: handleUserList },
              { id: "user-roles", label: "Roles y Permisos", onClick: handleUserRoles },
            ],
          },
        ],
      },
      {
        id: "system",
        title: "Sistema",
        items: [
          {
            id: "settings",
            icon: <Settings className="h-4 w-4" />,
            label: "Configuración",
            href: "/dashboard/settings",
          },
          {
            id: "help",
            icon: <MessageSquare className="h-4 w-4" />,
            label: "Ayuda",
            href: "/dashboard/help",
          },
        ],
      },
    ],
    [handleProductList, handleProductCategories, handleProductInventory, handleUserList, handleUserRoles]
  )

  // Formateador para porcentajes con signo
  const formatPercentWithSign = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  return (
    <div className={cn("flex h-screen overflow-hidden", isDarkTheme ? "dark" : "")}>
      {/* Sidebar para desktop (siempre visible) */}
      <div>
        <EnhancedSidebar
          variant={sidebarVariant as "default" | "compact"}
          sections={sidebarSections()}
          userInfo={userInfo}
          selectedItemId={activeItemId}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <header className="border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            {/* Logo o título del dashboard */}
            <div className="font-semibold text-lg mr-4 flex items-center">
              <Command className="h-5 w-5 mr-2" />
              <span>Inventario Pro</span>
            </div>

            {/* Barra de búsqueda */}
            <div className="w-full max-w-md">
              <ActionSearchBar />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Botón de tema */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notificaciones */}
            <Button variant="ghost" size="icon" aria-label="Ver notificaciones">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Avatar del usuario */}
            <Avatar className="h-8 w-8">
              <AvatarFallback>UD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Contenido del dashboard */}
        <main className="flex-1 overflow-auto p-6">
          {/* Banner de bienvenida */}
          {showWelcomeBanner && (
            <div className="rounded-lg border bg-card text-card-foreground shadow mb-6 relative">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-primary">¡Bienvenido al Dashboard!</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowWelcomeBanner(false)}
                    aria-label="Cerrar mensaje de bienvenida"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">
                  Este es tu nuevo panel de control. Puedes personalizar esta vista según tus necesidades.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={startTour}>
                  Comenzar Tour
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-3 gap-6">
              {/* Esqueletos de carga */}
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-40">
                  <CardHeader className="p-4">
                    <Skeleton className="h-4 w-[200px]" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
              <h2 className="text-lg font-semibold text-destructive mb-2">Error al cargar los datos</h2>
              <p className="text-destructive/90 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sección de estadísticas clave */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tarjeta 1: Total de Productos */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {inventoryStatsLoading ? (
                      <Skeleton className="h-8 w-[100px]" />
                    ) : (
                      <div className="text-2xl font-bold">{inventoryStats?.totalProducts || 0}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {inventoryStats?.isFromApi ? "Datos en tiempo real" : "Datos calculados localmente"}
                    </p>
                  </CardContent>
                </Card>

                {/* Tarjeta 2: Productos con Stock Bajo */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    {inventoryStatsLoading ? (
                      <Skeleton className="h-8 w-[100px]" />
                    ) : (
                      <div className="text-2xl font-bold">{inventoryStats?.lowStockCount || 0}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Estado general: {inventoryStats?.stockHealth || "Desconocido"}
                    </p>
                  </CardContent>
                </Card>

                {/* Tarjeta 3: Movimientos de Inventario (Tendencia) */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tendencia de Movimientos</CardTitle>
                    {inventoryStats?.trends?.totalMovements?.percentChange !== undefined && (
                      inventoryStats.trends.totalMovements.percentChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )
                    )}
                  </CardHeader>
                  <CardContent>
                    {inventoryStatsLoading || !inventoryStats?.trends ? (
                      <Skeleton className="h-8 w-[100px]" />
                    ) : (
                      <div className="flex items-center">
                        <div className="text-2xl font-bold">{inventoryStats.trends.totalMovements.current}</div>
                        <Badge className={cn(
                          "ml-2",
                          inventoryStats.trends.totalMovements.percentChange >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}>
                          {formatPercentWithSign(inventoryStats.trends.totalMovements.percentChange)}
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Comparado con periodo anterior
                    </p>
                  </CardContent>
                </Card>

                {/* Tarjeta 4: Valor del Inventario */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {inventoryStatsLoading ? (
                      <Skeleton className="h-8 w-[100px]" />
                    ) : (
                      <div className="text-2xl font-bold">
                        ${inventoryStats?.totalStock?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Calculado en base a precio x stock
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Predicciones y Gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfico de Movimientos de Inventario */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Movimientos de Inventario</CardTitle>
                    <CardDescription>Entradas y salidas en los últimos meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InventoryChart />
                  </CardContent>
                </Card>

                {/* Predicciones de Reabastecimiento */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Productos que Requieren Atención</CardTitle>
                    <CardDescription>Basado en análisis de uso histórico</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-72 overflow-y-auto">
                    {inventoryStatsLoading || !inventoryStats?.predictions ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : inventoryStats.predictions.upcomingReorders?.length === 0 ? (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No hay productos que necesiten reabastecimiento próximamente</p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {inventoryStats.predictions.upcomingReorders?.map((product: {
                          productName: string;
                          daysUntilReorder: number;
                          currentStock: number;
                        }, index: number) => (
                          <li key={index} className="rounded-lg border p-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{product.productName}</h4>
                              <div className="text-sm text-muted-foreground flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{Math.ceil(product.daysUntilReorder)} días hasta reabastecimiento</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-amber-50">
                                Stock: {product.currentStock}
                              </Badge>
                              <Button size="sm" variant="ghost">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">Ver todos los productos</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
