"use client"

import authService from "@/lib/api/auth-service"
import { dashboardService, type InventoryStats, type ProductStats } from "@/lib/api/dashboard-service"
import inventoryService from "@/lib/api/inventory-service"
import axios, { AxiosError } from "axios"
import { AlertCircle, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CircularProgress } from "../circular-progress"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

type StatsProps = {
  isLoading: boolean
  error: string | null
}

export function DashboardStats({ isLoading: initialLoading, error: initialError }: StatsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading)
  const [error, setError] = useState<string | null>(initialError)
  const [productStats, setProductStats] = useState<ProductStats | null>(null)
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null)
  const [needsLogin, setNeedsLogin] = useState<boolean>(false)
  const [noUserData, setNoUserData] = useState<boolean>(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)

        // Verificar autenticación antes de intentar cargar datos
        if (!authService.isAuthenticated()) {
          console.warn("Usuario no autenticado, redirigiendo al login")
          setNeedsLogin(true)
          setError("Necesitas iniciar sesión para ver las estadísticas completas")
          return; // Detener la ejecución si no hay autenticación
        }

        setNeedsLogin(false)

        // Intenta obtener las estadísticas filtradas por usuario
        const inventoryUserStats = await inventoryService.getStatistics();
        console.log('📊 [DashboardStats] Estadísticas de usuario recibidas:', inventoryUserStats);

        // Verificar si no hay movimientos de usuario
        const hasUserMovements =
          inventoryUserStats?.movement?.totalMovements > 0 ||
          inventoryUserStats?.movement?.entriesCount > 0 ||
          inventoryUserStats?.movement?.exitsCount > 0;

        if (!hasUserMovements) {
          console.log('ℹ️ [DashboardStats] No se encontraron movimientos para el usuario actual');
          setNoUserData(true);
        } else {
          setNoUserData(false);
        }

        // De todas formas, obtiene las estadísticas generales para mostrar algo
        const data = await dashboardService.getDashboardStats()
        setProductStats(data.products)
        setInventoryStats(inventoryUserStats || data.inventory)
      } catch (err: unknown) {
        console.error("Error al cargar estadísticas:", err)

        // Verificar si es un error de autenticación
        if (err instanceof Error && err.message?.includes('autenticación')) {
          setNeedsLogin(true)
          setError("Necesitas iniciar sesión para ver las estadísticas completas")
        } else if (axios.isAxiosError(err)) {
          // Error de axios
          const axiosError = err as AxiosError
          console.log("Detalles completos del error:", {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers,
            url: axiosError.config?.url
          })

          if (axiosError.response && (axiosError.response.status === 401 || axiosError.response.status === 403)) {
            setNeedsLogin(true)
            setError("Necesitas iniciar sesión para ver las estadísticas completas")
          } else if (axiosError.response && axiosError.response.status === 400) {
            setError(`Error en la solicitud: Formato incorrecto o datos inválidos (${axiosError.message})`)
          } else {
            setError(`Error al cargar los datos: ${axiosError.message}`)
          }
        } else {
          setError("Error al cargar los datos del dashboard")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Si el usuario necesita iniciar sesión
  if (needsLogin) {
    return (
      <Card className="col-span-full border-warning bg-warning/10 transition-standard">
        <CardContent className="card-padding flex items-center gap-md">
          <div className="rounded-full p-2 bg-warning/20 text-warning">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Se requiere autenticación</h3>
            <p className="text-sm opacity-70">{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => router.push('/login')}
            >
              Iniciar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full border-destructive bg-destructive/10 transition-standard">
        <CardContent className="card-padding flex items-center gap-md">
          <div className="rounded-full p-2 bg-destructive/20 text-destructive">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Error al cargar los datos</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <button
            className="ml-auto px-3 py-1.5 border border-destructive text-destructive text-sm rounded-md hover:bg-destructive/10 transition-standard"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !productStats) {
    return (
      <>
        <Card className="transition-standard animate-pulse">
          <CardHeader className="card-header">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted/80 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="card-content">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-muted/60 rounded"></div>
          </CardContent>
        </Card>
        <Card className="transition-standard animate-pulse">
          <CardHeader className="card-header">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          </CardHeader>
          <CardContent className="card-content">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-muted/60 rounded"></div>
          </CardContent>
        </Card>
        <Card className="transition-standard animate-pulse">
          <CardHeader className="card-header">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          </CardHeader>
          <CardContent className="card-content">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-muted/60 rounded"></div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      {noUserData && (
        <div className="col-span-3 mb-4">
          <Alert variant="info" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Estadísticas personales</AlertTitle>
            <AlertDescription className="text-blue-700">
              No tienes movimientos de inventario registrados. Las estadísticas muestran datos generales del sistema.
              Crea movimientos de entrada o salida para ver tus estadísticas personales.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Total Products */}
      <Card className="transition-standard">
        <CardHeader className="card-header">
          <CardTitle className="text-base font-medium">
            {noUserData ? 'Productos Registrados' : 'Mis Productos Registrados'}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {noUserData ? 'Total en el sistema' : 'Gestionados por ti'}
          </div>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {productStats?.summary?.totalProducts ? productStats.summary.totalProducts.toLocaleString() : '0'}
              </div>
              <div className="flex gap-sm mt-xs">
                <div className={`text-sm flex items-center ${(productStats?.summary?.percentageChange || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {(productStats?.summary?.percentageChange || 0) >= 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    )}
                  </svg>
                  <span>{Math.abs(productStats?.summary?.percentageChange || 0)}%</span>
                </div>
                <div className="text-xs text-muted-foreground">este mes</div>
              </div>
            </div>
            <div className="w-20 h-20 flex-shrink-0">
              <CircularProgress
                value={productStats?.summary?.percentActiveProducts || 80}
                color="var(--primary)"
                size="xl"
              />
              <div className="text-xs text-center mt-xs">Activos</div>
            </div>
          </div>
          <div className="h-10 mt-sm">
            {/* Gráfico de tendencia usando datos reales si están disponibles */}
            <div className="flex items-end h-full gap-[2px]">
              {(productStats?.stockTrend || Array(13).fill(0).map(() => 40 + Math.random() * 40)).map((item, index) => {
                // Si tenemos datos reales, usar el valor normalizado
                const value = typeof item === 'object' && productStats?.stockTrend
                  ? (item.totalStock / Math.max(...productStats.stockTrend.map(t => t.totalStock)) * 100)
                  : item;

                return (
                  <div
                    key={index}
                    className="flex-1 bg-primary/20 rounded-sm transition-standard"
                    style={{ height: `${value}%` }}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Level */}
      <Card className="transition-standard">
        <CardHeader className="card-header">
          <CardTitle className="text-base font-medium">Nivel de Stock</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{productStats?.summary?.stockLevel ? productStats.summary.stockLevel.toLocaleString() : '0'}</div>
              <div className="text-sm flex items-center mt-xs space-x-2">
                <div className="text-amber-500 flex items-center">
                  <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{productStats?.summary?.productsWithLowStock || 0} con stock bajo</span>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 flex-shrink-0">
              <CircularProgress
                value={75}
                color="var(--amber-500)"
                size="lg"
              />
            </div>
          </div>

          {/* Categorías de productos */}
          {productStats?.categories && productStats.categories.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">Distribución por Categoría</div>
              <div className="space-y-2">
                {productStats.categories.slice(0, 3).map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-xs">{category.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium">{category.count}</div>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Statistics */}
      <Card className="transition-standard">
        <CardHeader className="card-header">
          <CardTitle className="text-base font-medium">
            {noUserData ? 'Estadísticas de Inventario' : 'Mis Estadísticas de Inventario'}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {noUserData ? 'Visión general del sistema' : 'Basado en tus movimientos'}
          </div>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {inventoryStats?.movement?.totalMovements || 0}
              </div>
              <div className="text-sm text-muted-foreground">Movimientos totales</div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Entradas</div>
                  <div className="text-xl">
                    {inventoryStats?.movement?.entriesCount || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Salidas</div>
                  <div className="text-xl">
                    {inventoryStats?.movement?.exitsCount || 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 flex-shrink-0">
              <CircularProgress
                value={inventoryStats?.general?.activeProducts && inventoryStats?.general?.totalProducts
                  ? (inventoryStats.general.activeProducts / inventoryStats.general.totalProducts) * 100
                  : 0}
                color="var(--primary)"
                size="lg"
              />
            </div>
          </div>

          {noUserData && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-amber-700 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>No tienes movimientos registrados</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card className="transition-standard">
        <CardHeader className="card-header">
          <CardTitle className="text-base font-medium">Valor de Inventario</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">${productStats?.summary?.revenue ? productStats.summary.revenue.toLocaleString() : '0'}</div>
              <div className="text-sm flex items-center mt-xs">
                <span className="text-muted-foreground">Precio promedio: ${productStats?.summary?.avgPrice ? productStats.summary.avgPrice.toFixed(2) : '0.00'}</span>
              </div>
            </div>
            <div className="w-16 h-16 flex-shrink-0">
              <CircularProgress
                value={65}
                color="var(--chart-1)"
                size="lg"
              />
            </div>
          </div>

          {/* Productos más caros */}
          {productStats?.topExpensiveProducts && productStats.topExpensiveProducts.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">Productos más Valorados</div>
              <div className="space-y-2">
                {productStats.topExpensiveProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-xs truncate max-w-[150px]">{product.name}</div>
                    <div className="text-xs font-medium">${product.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarjeta adicional para mostrar productos más movidos */}
      {inventoryStats?.topMovedProducts && inventoryStats.topMovedProducts.length > 0 && (
        <Card className="col-span-full mt-4">
          <CardHeader className="card-header">
            <CardTitle className="text-base font-medium">Productos más Movidos</CardTitle>
            <div className="text-xs text-muted-foreground">
              En los últimos 30 días
            </div>
          </CardHeader>
          <CardContent className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {inventoryStats.topMovedProducts.map((product, index) => (
                <div key={index} className="p-3 bg-muted/20 rounded-md">
                  <div className="text-sm font-medium truncate">{product.productName}</div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span>Total: <strong>{product.totalQuantity}</strong></span>
                    <span className="text-emerald-500">+{product.entriesCount}</span>
                    <span className="text-rose-500">-{product.exitsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
