"use client"

import { InventoryChart } from "@/components/inventory-chart"
import { RoiPanel } from "@/components/roi-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useInventory } from "@/hooks/useInventory"
import { useInventoryStore } from "@/store/useInventoryStore"
import { AlertTriangle, BarChart2, CircleDollarSign, Package, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { inventoryStats, inventoryStatsLoading } = useInventory()
  const { stockMovements } = useInventoryStore()

  // Ordenar movimientos de inventario por fecha (más reciente primero)
  const sortedMovements = useMemo(() => {
    const movements = Array.isArray(stockMovements) ? stockMovements : [];
    return movements
      .sort((a, b) => {
        if (!a?.date || !b?.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, 3); // Solo mostrar los 3 más recientes
  }, [stockMovements]);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Formatear porcentaje con signo
  const formatPercentWithSign = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Usuario</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de control, {user?.name || 'Usuario'}
          </p>
        </div>
        <Button variant="outline">
          <BarChart2 className="h-4 w-4 mr-2" />
          Generar Reporte
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Productos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inventoryStats?.trends?.totalMovements?.percentChange !== undefined && (
                    <span className={inventoryStats.trends.totalMovements.percentChange >= 0 ? "text-green-500" : "text-red-500"}>
                      {formatPercentWithSign(inventoryStats.trends.totalMovements.percentChange)} este mes
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Productos con stock bajo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats?.lowStockCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inventoryStats?.lowStockCount !== undefined && inventoryStats?.totalProducts !== undefined && (
                    <span className="text-amber-500">
                      {((inventoryStats.lowStockCount / inventoryStats.totalProducts) * 100).toFixed(1)}% del total
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Movimientos totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading || !inventoryStats?.trends ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats.trends.totalMovements.current}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inventoryStats?.trends?.totalMovements?.percentChange !== undefined && (
                    <span className={inventoryStats.trends.totalMovements.percentChange >= 0 ? "text-green-500" : "text-red-500"}>
                      {formatPercentWithSign(inventoryStats.trends.totalMovements.percentChange)} vs. anterior
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Valor total de inventario */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(inventoryStats?.totalStock || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-gray-500">Último cálculo</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de tarjetas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* ROI Promedio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {inventoryStats?.roi?.avgRoi ? `${inventoryStats.roi.avgRoi.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-green-500 mt-1">
                  Retorno sobre inversión
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas de salud de inventario */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salud del Inventario</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {inventoryStats?.stockHealth || 'Normal'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inventoryStats?.lowStockCount || 0} productos con stock bajo
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sección de Gráficos y Alertas */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Análisis de Inventario</CardTitle>
            <CardDescription>
              Movimientos y tendencias del último mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryChart />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Indicadores de Rendimiento</CardTitle>
            <CardDescription>
              Estadísticas y métricas importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="alertas">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="alertas">Alertas</TabsTrigger>
                <TabsTrigger value="predicciones">Predicciones</TabsTrigger>
                <TabsTrigger value="roi">ROI</TabsTrigger>
              </TabsList>

              <TabsContent value="alertas" className="space-y-4">
                {/* Contenido de la pestaña de alertas */}
                {isLoading || inventoryStatsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {inventoryStats?.lowStockCount ? (
                      <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-md">
                        <AlertTriangle className="h-5 w-5 mr-3 text-amber-500" />
                        <div>
                          <p className="font-medium">Stock bajo en {inventoryStats.lowStockCount} productos</p>
                          <p className="text-xs mt-1">Revisa el inventario para realizar pedidos</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center p-3 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-md">
                        <Package className="h-5 w-5 mr-3 text-green-500" />
                        <div>
                          <p className="font-medium">Niveles de stock adecuados</p>
                          <p className="text-xs mt-1">Todos los productos tienen stock suficiente</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="predicciones" className="space-y-4">
                {/* Contenido de la pestaña de predicciones */}
                {isLoading || inventoryStatsLoading || !inventoryStats?.predictions ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Productos que necesitarán reposición pronto:</h4>
                      <div className="space-y-3">
                        {inventoryStats.predictions.upcomingReorders.map((product, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <p className="font-medium">{product.productName}</p>
                              <p className="text-xs text-muted-foreground">Stock actual: {product.currentStock}</p>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 hover:bg-amber-100">
                              {product.daysUntilReorder} días
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="roi" className="space-y-4">
                {/* Contenido de la pestaña de ROI */}
                {isLoading || inventoryStatsLoading || !inventoryStats?.roi ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Productos con mejor ROI:</h4>
                      <div className="space-y-3">
                        {(inventoryStats.roi.topRoiProducts || []).map((product, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <p className="font-medium">{product.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                Ventas: {product.totalSalidas} unidades
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 hover:bg-green-100">
                              ROI: {product.roi.toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        El ROI (Retorno sobre Inversión) muestra la rentabilidad de cada producto en relación a su costo.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Panel de ROI detallado */}
      <div className="mb-6">
        <RoiPanel />
      </div>

      {/* Pestañas para diferentes vistas */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>
              Los últimos cambios en tu inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sortedMovements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay movimientos registrados.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMovements.map((movement, index) => (
                  <div key={movement.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        movement.type === "entrada"
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-red-100 dark:bg-red-900"
                      }`}>
                        <Package className={`h-5 w-5 ${
                          movement.type === "entrada"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{movement.type === "entrada" ? "Entrada" : "Salida"} de producto</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {movement.quantity} unidades de {movement.productName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge
                        variant="outline"
                        className={movement.type === "entrada"
                          ? "bg-green-50 dark:bg-green-900/30"
                          : "bg-red-50 dark:bg-red-900/30"
                        }
                      >
                        {movement.type === "entrada" ? "Entrada" : "Salida"}
                      </Badge>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(movement.date).toLocaleDateString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
