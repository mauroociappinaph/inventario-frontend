"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventory } from "@/hooks/useInventory"
import { cn } from "@/lib/utils"
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Bar, Line } from "react-chartjs-2"

// Registramos los componentes de Chart.js que vamos a utilizar
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Definimos el tipo para los datos de movimientos
interface MovementData {
  month: string
  entries: number
  exits: number
}

export function InventoryChart() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { stockMovements, inventoryStats, inventoryStatsLoading } = useInventory()
  const [chartData, setChartData] = useState<MovementData[]>([])

  useEffect(() => {
    // Preparar datos para el gráfico de barras de movimientos
    const prepareMovementData = () => {
      const last7Months: MovementData[] = []
      const now = new Date()

      // Generar datos para los últimos 7 meses
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleDateString('es-ES', { month: 'short' })
        const year = date.getFullYear()
        const monthLabel = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`

        // Filtrar los movimientos para este mes
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        // Obtener datos reales de los movimientos
        const movements = Array.isArray(stockMovements) ? stockMovements : [];
        const monthMovements = movements.filter(m => {
          const moveDate = new Date(m.date)
          return moveDate >= monthStart && moveDate <= monthEnd
        })

        const entries = monthMovements.filter(m => m.type === 'entrada').length
        const exits = monthMovements.filter(m => m.type === 'salida').length

        last7Months.push({
          month: monthLabel,
          entries,
          exits
        })
      }

      setChartData(last7Months)
    }

    prepareMovementData()
  }, [stockMovements])

  // Colores para los gráficos
  const colors = {
    entries: {
      primary: isDark ? 'rgba(52, 211, 153, 0.8)' : 'rgba(16, 185, 129, 0.8)',
      secondary: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.2)'
    },
    exits: {
      primary: isDark ? 'rgba(248, 113, 113, 0.8)' : 'rgba(239, 68, 68, 0.8)',
      secondary: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.2)'
    },
    text: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 24, 39, 0.8)',
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  }

  // Configuración del gráfico de movimientos
  const movementsChartConfig = {
    labels: chartData.map(d => d.month),
    datasets: [
      {
        label: 'Entradas',
        data: chartData.map(d => d.entries),
        backgroundColor: colors.entries.primary,
        borderRadius: 4
      },
      {
        label: 'Salidas',
        data: chartData.map(d => d.exits),
        backgroundColor: colors.exits.primary,
        borderRadius: 4
      }
    ]
  }

  // Configuración del gráfico de tendencias
  const trendChartConfig = {
    labels: ['Período Anterior', 'Período Actual'],
    datasets: [
      {
        label: 'Movimientos Totales',
        data: inventoryStats?.trends ? [
          inventoryStats.trends.totalMovements.previous,
          inventoryStats.trends.totalMovements.current
        ] : [0, 0],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Entradas',
        data: inventoryStats?.trends ? [
          inventoryStats.trends.entries.previous,
          inventoryStats.trends.entries.current
        ] : [0, 0],
        borderColor: colors.entries.primary,
        backgroundColor: colors.entries.secondary,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Salidas',
        data: inventoryStats?.trends ? [
          inventoryStats.trends.exits.previous,
          inventoryStats.trends.exits.current
        ] : [0, 0],
        borderColor: colors.exits.primary,
        backgroundColor: colors.exits.secondary,
        tension: 0.3,
        fill: true
      }
    ]
  }

  // Opciones comunes para los gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: colors.text,
          boxWidth: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: colors.grid
        },
        ticks: {
          color: colors.text
        }
      },
      y: {
        grid: {
          color: colors.grid
        },
        ticks: {
          color: colors.text
        }
      }
    }
  }

  // Calcular cambio porcentual para la visualización
  const getPercentChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="movimientos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="movimientos" className="space-y-4">
          <div className="h-[300px]">
            <Bar data={movementsChartConfig} options={chartOptions} />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Movimientos de inventario en los últimos 7 meses
          </div>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          {inventoryStatsLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium mb-1">Movimientos Totales</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {inventoryStats?.trends?.totalMovements.current || 0}
                    </span>
                    <span className={cn(
                      "ml-2 text-xs px-1.5 py-0.5 rounded",
                      (inventoryStats?.trends?.totalMovements.percentChange || 0) >= 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}>
                      {inventoryStats?.trends
                        ? getPercentChange(
                            inventoryStats.trends.totalMovements.current,
                            inventoryStats.trends.totalMovements.previous
                          )
                        : '+0%'
                      }
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium mb-1">Entradas</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {inventoryStats?.trends?.entries.current || 0}
                    </span>
                    <span className={cn(
                      "ml-2 text-xs px-1.5 py-0.5 rounded",
                      (inventoryStats?.trends?.entries.percentChange || 0) >= 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}>
                      {inventoryStats?.trends
                        ? getPercentChange(
                            inventoryStats.trends.entries.current,
                            inventoryStats.trends.entries.previous
                          )
                        : '+0%'
                      }
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium mb-1">Salidas</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {inventoryStats?.trends?.exits.current || 0}
                    </span>
                    <span className={cn(
                      "ml-2 text-xs px-1.5 py-0.5 rounded",
                      (inventoryStats?.trends?.exits.percentChange || 0) >= 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}>
                      {inventoryStats?.trends
                        ? getPercentChange(
                            inventoryStats.trends.exits.current,
                            inventoryStats.trends.exits.previous
                          )
                        : '+0%'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[220px]">
                <Line data={trendChartConfig} options={chartOptions} />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Comparación con el período anterior (últimos 30 días)
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

