"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

interface InventoryItem {
  id: string
  nombre: string
  categoria: string
  stock: number
  precio: number
  estado: "En stock" | "Bajo stock" | "Sin stock"
  ultimaActualizacion: string
}

const sampleInventoryData: InventoryItem[] = [
  {
    id: "INV001",
    nombre: "Laptop HP 15'",
    categoria: "Electrónica",
    stock: 45,
    precio: 699.99,
    estado: "En stock",
    ultimaActualizacion: "2023-11-15"
  },
  {
    id: "INV002",
    nombre: "Monitor Samsung 24'",
    categoria: "Electrónica",
    stock: 12,
    precio: 249.50,
    estado: "Bajo stock",
    ultimaActualizacion: "2023-11-18"
  },
  {
    id: "INV003",
    nombre: "Teclado Mecánico RGB",
    categoria: "Periféricos",
    stock: 30,
    precio: 89.99,
    estado: "En stock",
    ultimaActualizacion: "2023-11-20"
  },
  {
    id: "INV004",
    nombre: "Ratón Inalámbrico",
    categoria: "Periféricos",
    stock: 8,
    precio: 29.99,
    estado: "Bajo stock",
    ultimaActualizacion: "2023-11-21"
  },
  {
    id: "INV005",
    nombre: "Impresora Láser",
    categoria: "Impresoras",
    stock: 0,
    precio: 349.99,
    estado: "Sin stock",
    ultimaActualizacion: "2023-11-15"
  }
]

export function InventoryTable() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Gestionar selección de filas
  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  // Gestionar selección de todas las filas
  const toggleSelectAll = () => {
    if (selectedRows.size === sampleInventoryData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(sampleInventoryData.map(item => item.id)))
    }
  }

  // Obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "En stock":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
      case "Bajo stock":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
      case "Sin stock":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="w-full">
      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-[40px] px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sampleInventoryData.length}
                  onChange={toggleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Categoría</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Precio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actualización</th>
            </tr>
          </thead>
          <tbody>
            {sampleInventoryData.map((item) => (
              <tr
                key={item.id}
                className={`border-b transition-colors hover:bg-muted/50 ${
                  selectedRows.has(item.id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(item.id)}
                    onChange={() => toggleRowSelection(item.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-mono">{item.id}</td>
                <td className="px-4 py-3 font-medium">{item.nombre}</td>
                <td className="px-4 py-3 text-sm">{item.categoria}</td>
                <td className="px-4 py-3 text-sm">{item.stock}</td>
                <td className="px-4 py-3 text-sm">{formatPrice(item.precio)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${getStatusColor(item.estado)}`}>
                    {item.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(item.ultimaActualizacion)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de <span className="font-medium">5</span> elementos
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled className="h-8 w-8">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled className="h-8 w-8">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

