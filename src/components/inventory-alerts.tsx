"use client"

import React, { useEffect } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { useNotification } from '@/contexts/notification-context'
import { Alert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { Product } from '@/stores/inventoryStore'

// Definimos umbrales para las alertas
const LOW_STOCK_THRESHOLD = 10
const HIGH_MOVEMENT_THRESHOLD = 15
const HIGH_GROWTH_THRESHOLD = 25 // en porcentaje

export interface InventoryAlertsProps {
  showCard?: boolean
}
export function InventoryAlerts({ showCard = true }: InventoryAlertsProps) {
  const inventory = useInventory()
  const notification = useNotification()
  const toast = useToast()

  const { data, isLoading, error } = inventory
  const lowStockProducts = React.useMemo(() => {
    if (!data || !data.products) return []
    return data.products.filter((product: Product) =>
      product.currentStock < LOW_STOCK_THRESHOLD
    )
  }, [data?.products])

  // Obtener productos con alto movimiento
  const highMovementProducts = React.useMemo(() => {
    if (!data?.products) return []
    return data.products.filter(product =>
      product.movements > HIGH_MOVEMENT_THRESHOLD
    )
  }, [data?.products])

  // Obtener productos con alto crecimiento
  const highGrowthProducts = React.useMemo(() => {
    if (!data?.trends) return []
    return data.trends.filter(trend =>
      trend.percentageChange > HIGH_GROWTH_THRESHOLD
    )
  }, [data?.trends])

  // Mostrar notificaciones cuando cambian los datos
  useEffect(() => {
    if (isLoading || error) return

    // Notificar sobre productos con stock bajo
    if (lowStockProducts.length > 0) {
      notification.warning(
        'Alerta de stock bajo',
        `${lowStockProducts.length} productos están por debajo del umbral mínimo de stock.`
      )

      // También mostrar un toast para la primera alerta
      if (lowStockProducts.length > 0) {
        toast.addToast({
          variant: 'warning',
          title: 'Stock bajo',
          description: `${lowStockProducts[0].name} tiene solo ${lowStockProducts[0].currentStock} unidades disponibles.`
        })
      }
    }

    // Notificar sobre productos con alto movimiento
    if (highMovementProducts.length > 0) {
      notification.info(
        'Alto movimiento detectado',
        `${highMovementProducts.length} productos muestran un movimiento superior al normal.`
      )
    }

    // Notificar sobre productos con alto crecimiento
    if (highGrowthProducts.length > 0) {
      notification.success(
        'Tendencia positiva',
        `${highGrowthProducts.length} productos muestran un crecimiento superior al ${HIGH_GROWTH_THRESHOLD}%.`
      )
    }
  }, [data, isLoading, error, notification, toast, lowStockProducts, highMovementProducts, highGrowthProducts])

  if (isLoading) return null

  // Si no hay alertas, no mostrar nada
  if (lowStockProducts.length === 0 && highMovementProducts.length === 0 && highGrowthProducts.length === 0) {
    return null
  }

  // Contenido de alertas
  const alertsContent = (
    <div className="space-y-4">
      {lowStockProducts.length > 0 && (
        <Alert variant="warning" title="Productos con stock bajo">
          <div className="mt-2 max-h-32 overflow-auto">
            <ul className="list-disc pl-5 space-y-1">
              {lowStockProducts.map((product) => (
                <li key={product.id}>
                  {product.name}: <span className="font-semibold">{product.currentStock}</span> unidades
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {highMovementProducts.length > 0 && (
        <Alert variant="info" title="Productos con alto movimiento">
          <div className="mt-2 max-h-32 overflow-auto">
            <ul className="list-disc pl-5 space-y-1">
              {highMovementProducts.map((product) => (
                <li key={product.id}>
                  {product.name}: <span className="font-semibold">{product.movements}</span> movimientos
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {highGrowthProducts.length > 0 && (
        <Alert variant="success" title="Productos con alto crecimiento">
          <div className="mt-2 max-h-32 overflow-auto">
            <ul className="list-disc pl-5 space-y-1">
              {highGrowthProducts.map((trend) => (
                <li key={trend.id}>
                  {trend.name}: <span className="font-semibold">+{trend.percentageChange}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}
    </div>
  )

  // Si no se requiere mostrar en una card, devolver solo el contenido
  if (!showCard) return alertsContent

  // Mostrar en una card
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-medium">Alertas automáticas</h3>
      </div>
      {alertsContent}
    </Card>
  )
}
