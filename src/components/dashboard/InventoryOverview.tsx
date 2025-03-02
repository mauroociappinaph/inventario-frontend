"use client"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { InventoryChart } from "../inventory-chart"
import { InventoryTable } from "../inventory-table"
import { Notifications } from "../notifications"
import { MoreVertical, X } from "lucide-react"

type InventoryOverviewProps = {
  isLoading: boolean
  showWelcomeBanner: boolean
  setShowWelcomeBanner: (show: boolean) => void
  startTour: () => void
}

export function InventoryOverview({
  isLoading,
  showWelcomeBanner,
  setShowWelcomeBanner,
  startTour
}: InventoryOverviewProps) {
  return (
    <>
      {showWelcomeBanner && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg spacing-md mb-lg relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-sm right-sm transition-standard active:scale-95"
            onClick={() => setShowWelcomeBanner(false)}
            aria-label="Cerrar banner"
          >
            <X className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-medium mb-sm">¡Bienvenido a InvSystem!</h3>
          <p className="text-sm text-muted-foreground mb-md">
            Esta es tu nueva interfaz de gestión de inventario. ¿Te gustaría un recorrido rápido?
          </p>
          <div className="flex flex-wrap gap-sm">
            <Button size="sm" onClick={startTour} className="transition-standard active:scale-95">
              Iniciar recorrido
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowWelcomeBanner(false)} className="transition-standard active:scale-95">
              Omitir
            </Button>
          </div>
        </div>
      )}

      <div className="section-spacing">
        <h1 className="text-2xl font-bold mb-xs">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de nuevo, aquí tienes un resumen de tu inventario</p>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        {/* Inventory Movement Chart */}
        <Card className="lg:col-span-8 transition-standard">
          <CardHeader className="flex flex-row items-center justify-between card-padding">
            <CardTitle className="text-base font-medium">Movimiento de Inventario</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 transition-standard active:scale-95"
              aria-label="Opciones de gráfico"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="spacing-md pt-0">
            {isLoading ? (
              <div className="animate-pulse space-y-md">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-80 bg-muted rounded"></div>
              </div>
            ) : (
              <div className="h-[300px]">
                <InventoryChart />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Notifications */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-md">
          <Card className="transition-standard">
            <CardHeader className="flex flex-row items-center justify-between card-padding">
              <CardTitle className="text-base font-medium">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-sm card-padding pt-0">
              <Button size="sm" className="transition-standard active:scale-95">Nuevo Producto</Button>
              <Button size="sm" variant="outline" className="transition-standard active:scale-95">Exportar Datos</Button>
              <Button size="sm" variant="secondary" className="transition-standard active:scale-95">Generar Reporte</Button>
              <Button size="sm" variant="outline" className="transition-standard active:scale-95">Configurar Alertas</Button>
            </CardContent>
          </Card>

          <Card className="transition-standard">
            <CardHeader className="flex flex-row items-center justify-between card-padding">
              <CardTitle className="text-base font-medium">Notificaciones</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-standard"
                aria-label="Opciones de notificaciones"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="card-padding pt-0 max-h-[200px] overflow-auto">
              <Notifications />
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="lg:col-span-12 transition-standard">
          <CardHeader className="flex flex-row items-center justify-between card-padding">
            <CardTitle className="text-base font-medium">Detalle de Inventario</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 transition-standard"
              aria-label="Opciones de inventario"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="card-padding pt-0">
            <div className="flex flex-wrap gap-sm mb-md">
              <Input placeholder="Filtrar por nombre" className="max-w-[200px]" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="electronica">Electrónica</SelectItem>
                  <SelectItem value="ropa">Ropa</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="transition-standard active:scale-95">Aplicar Filtros</Button>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="animate-pulse space-y-sm">
                  <div className="h-8 bg-muted rounded w-full mb-sm"></div>
                  <div className="h-8 bg-muted/80 rounded w-full mb-sm"></div>
                  <div className="h-8 bg-muted/60 rounded w-full mb-sm"></div>
                  <div className="h-8 bg-muted/40 rounded w-full mb-sm"></div>
                </div>
              ) : (
                <InventoryTable />
              )}
            </div>
            <div className="flex flex-wrap gap-sm mt-md">
              <Button size="sm" className="bg-primary hover:bg-primary-hover transition-standard active:scale-95">
                Agregar Producto
              </Button>
              <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 transition-standard active:scale-95">
                Eliminar Seleccionados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
