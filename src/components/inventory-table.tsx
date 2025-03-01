"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowDown,
  ArrowUp
} from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { useInventory } from "@/hooks/useInventory"
import { Product } from "@/stores/inventoryStore"
import { Skeleton } from "./ui/skeleton"

export function InventoryTable() {
  const {
    filteredProducts,
    isLoading,
    error,
    sortConfig,
    requestSort
  } = useInventory();

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Efecto para reset selección cuando cambian los datos
  useEffect(() => {
    setSelectedRows(new Set());
  }, [filteredProducts]);

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
    if (selectedRows.size === paginatedProducts.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedProducts.map(item => item.id)))
    }
  }

  // Navegar a la página anterior
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }

  // Navegar a la página siguiente
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }

  // Navegar a la primera página
  const goToFirstPage = () => {
    setCurrentPage(1);
  }

  // Navegar a la última página
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  }

  // Obtener el color del badge según el nivel de stock
  const getStockStatusColor = (stock: number, minStock: number) => {
    const ratio = stock / minStock;

    if (stock === 0) {
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
    } else if (ratio < 1) {
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
    } else {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    }
  }

  // Obtener el texto del estado de stock
  const getStockStatusText = (stock: number, minStock: number) => {
    if (stock === 0) {
      return "Sin stock";
    } else if (stock < minStock) {
      return "Bajo stock";
    } else {
      return "En stock";
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

  // Renderizar icono de ordenamiento
  const renderSortIcon = (key: keyof Product) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc'
        ? <ArrowUp className="ml-1 h-4 w-4" />
        : <ArrowDown className="ml-1 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />;
  }

  // Renderizar encabezado de tabla con ordenamiento
  const renderSortableHeader = (label: string, key: keyof Product) => (
    <th
      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
      onClick={() => requestSort(key)}
    >
      <div className="flex items-center">
        {label}
        {renderSortIcon(key)}
      </div>
    </th>
  );

  // Si está cargando, mostrar esqueletos
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="border rounded-md">
          <div className="h-12 bg-muted/40 flex items-center px-4">
            <Skeleton className="h-4 w-1/2" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 border-t">
              <Skeleton className="h-5 w-5 mr-4" />
              <Skeleton className="h-4 w-16 mr-6" />
              <Skeleton className="h-4 w-1/4 mr-6" />
              <Skeleton className="h-4 w-16 mr-6" />
              <Skeleton className="h-4 w-12 mr-6" />
              <Skeleton className="h-4 w-16 mr-6" />
              <Skeleton className="h-5 w-20 mr-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-destructive">Error: {error}</div>
        <Button variant="outline" className="mt-4">
          Reintentar
        </Button>
      </div>
    );
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
                  checked={selectedRows.size === paginatedProducts.length && paginatedProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              {renderSortableHeader('Producto', 'name')}
              {renderSortableHeader('Categoría', 'category')}
              {renderSortableHeader('Stock', 'stock')}
              {renderSortableHeader('Precio', 'price')}
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              {renderSortableHeader('Actualización', 'lastUpdated')}
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              paginatedProducts.map((item) => (
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
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.category}</td>
                  <td className="px-4 py-3 text-sm">{item.stock}</td>
                  <td className="px-4 py-3 text-sm">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3">
                    <Badge className={getStockStatusColor(item.stock, item.minStock)}>
                      {getStockStatusText(item.stock, item.minStock)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(item.lastUpdated)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {filteredProducts.length > 0 ? (
            <>
              Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
              </span> de <span className="font-medium">{filteredProducts.length}</span> elementos
            </>
          ) : (
            "No hay elementos para mostrar"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={goToFirstPage}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={goToNextPage}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={goToLastPage}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

