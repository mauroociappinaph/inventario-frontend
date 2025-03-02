"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart, AlertTriangle, Clock, Settings, TrendingUp, TrendingDown, BarChart2, Home, CircleDollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useInventory } from "@/hooks/useInventory"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { InventoryChart } from "@/components/inventory-chart"

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { inventoryStats, inventoryStatsLoading } = useInventory()

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

      {/* Sección de Gráficos y Alertas */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
        {isLoading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Gráfico de Movimientos */}
            <Card>
              <CardHeader>
                <CardTitle>Movimiento de Inventario</CardTitle>
                <CardDescription>Entradas y salidas de los últimos meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <InventoryChart />
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Inventario */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Inventario</CardTitle>
                <CardDescription>Productos que requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                      <div>
                        <p className="font-medium">Producto A</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Stock bajo: 3 unidades</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Ver</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                      <div>
                        <p className="font-medium">Producto B</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Stock bajo: 2 unidades</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Ver</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                      <div>
                        <p className="font-medium">Producto C</p>
                        <p className="text-sm text-red-700 dark:text-red-400">Sin stock</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Ver</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Entrada de producto</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">10 unidades de Producto X</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30">Entrada</Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hoy, 14:30</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">Salida de producto</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">5 unidades de Producto Y</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30">Salida</Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Ayer, 09:15</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Ajuste de inventario</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">3 unidades de Producto Z</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">Ajuste</Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hace 2 días</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
