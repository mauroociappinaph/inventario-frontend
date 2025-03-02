"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Package, BarChart2, TrendingUp, TrendingDown, ShoppingCart } from "lucide-react"
import { InventoryChart } from "@/components/inventory-chart"
import { useInventory } from "@/hooks/useInventory"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryOverview } from '@/components/dashboard/InventoryOverview'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { inventoryStats, inventoryStatsLoading, inventoryPredictions } = useInventory()

  useEffect(() => {
    // Simular carga de datos
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Administración</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de control administrativo
          </p>
        </div>
        <Button variant="outline">
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
                <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={inventoryStats.productGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatPercentWithSign(inventoryStats.productGrowth)}
                  </span>{" "}
                  respecto al mes anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bajo Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={inventoryStats.lowStockChange >= 0 ? "text-red-500" : "text-green-500"}>
                    {formatPercentWithSign(inventoryStats.lowStockChange)}
                  </span>{" "}
                  respecto al mes anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Movimientos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats.totalMovements}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={inventoryStats.movementGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatPercentWithSign(inventoryStats.movementGrowth)}
                  </span>{" "}
                  respecto al mes anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Valor de Inventario */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor de Inventario</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || inventoryStatsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(inventoryStats.inventoryValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={inventoryStats.valueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatPercentWithSign(inventoryStats.valueGrowth)}
                  </span>{" "}
                  respecto al mes anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
            <InventoryOverview data={inventoryStats} />
            <Card>
              <CardHeader>
                <CardTitle>Predicciones de Inventario</CardTitle>
                <CardDescription>Proyección para los próximos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="entradas">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="entradas">Entradas</TabsTrigger>
                    <TabsTrigger value="salidas">Salidas</TabsTrigger>
                    <TabsTrigger value="demanda">Demanda Est.</TabsTrigger>
                  </TabsList>
                  <TabsContent value="entradas" className="space-y-4">
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Entradas proyectadas</p>
                          <p className="text-sm text-muted-foreground">Próximos 30 días</p>
                        </div>
                        <div className="text-2xl font-bold">{inventoryPredictions.projectedEntries}</div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="salidas" className="space-y-4">
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Salidas proyectadas</p>
                          <p className="text-sm text-muted-foreground">Próximos 30 días</p>
                        </div>
                        <div className="text-2xl font-bold">{inventoryPredictions.projectedExits}</div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="demanda" className="space-y-4">
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Demanda estimada</p>
                          <p className="text-sm text-muted-foreground">Próximos 30 días</p>
                        </div>
                        <div className="text-2xl font-bold">{inventoryPredictions.estimatedDemand}</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Inventario</CardTitle>
            <CardDescription>
              Listado de productos con bajo stock o movimientos recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <InventoryTable />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
