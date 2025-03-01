"use client"

import { CloudUpload } from "lucide-react"

export function Notifications() {
  return (
    <div className="space-y-4">
      <div className="text-rose-400 space-y-1">
        <h3 className="font-medium">Alerta de Stock</h3>
        <p className="text-sm text-muted-foreground">
          El producto "Laptops HP" está por debajo del nivel mínimo de stock.
        </p>
      </div>

      <div className="text-rose-400 space-y-1">
        <h3 className="font-medium">Pedido Recibido</h3>
        <p className="text-sm text-muted-foreground">
          Se ha recibido un nuevo pedido de 50 unidades de "Monitores Dell".
        </p>
      </div>

      <div className="text-rose-400 space-y-1">
        <h3 className="font-medium">Actualización de Precios</h3>
        <p className="text-sm text-muted-foreground">Los precios de los "Teclados Mecánicos" han sido actualizados.</p>
      </div>

      <div className="text-rose-400 space-y-1">
        <h3 className="font-medium">Mantenimiento Programado</h3>
        <p className="text-sm text-muted-foreground">El sistema estará en mantenimiento el domingo a las 02:00 AM.</p>
      </div>

      <div className="mt-6 bg-rose-200 rounded-md p-4 flex flex-col items-center justify-center">
        <CloudUpload className="h-10 w-10 text-rose-400 mb-2" />
        <div className="text-sm text-rose-600 text-center">22/50GB</div>
      </div>
    </div>
  )
}

