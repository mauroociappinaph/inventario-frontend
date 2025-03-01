"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageTransition } from '@/components/layout/page-transition'
import { Skeleton } from '@/components/ui/skeleton-loader'
import { LoadingState } from '@/components/ui/loading-state'
import { useLoading } from '@/hooks/useLoading'
import { useToast } from "@/components/ui/use-toast"
import { useApiError } from "@/hooks/useApiError"
import { ApiError } from "@/components/ui/api-error"
import { ErrorMessage } from "@/components/ui/error-message"
import inventoryService, { InventoryProduct } from "@/lib/api/inventory-service"
import { PlusCircle, RefreshCw, AlertTriangle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

// Datos de ejemplo para fallback cuando no hay conexión
const mockInventoryData = [
  { id: "1", name: "Laptop Dell XPS", sku: "LT-DL-001", stock: 12, price: 1299.99, category: "Electrónicos", supplier: "Dell Inc.", lastUpdated: "2023-06-15" },
  { id: "2", name: "Monitor UltraWide", sku: "MN-UW-002", stock: 8, price: 349.99, category: "Electrónicos", supplier: "LG Electronics", lastUpdated: "2023-06-10" },
  { id: "3", name: "Teclado Mecánico", sku: "KB-MC-003", stock: 15, price: 89.99, category: "Accesorios", supplier: "Logitech", lastUpdated: "2023-06-12" },
  { id: "4", name: "Mouse Inalámbrico", sku: "MS-WL-004", stock: 24, price: 45.99, category: "Accesorios", supplier: "Logitech", lastUpdated: "2023-06-14" },
  { id: "5", name: "Auriculares Bluetooth", sku: "HP-BT-005", stock: 18, price: 129.99, category: "Audio", supplier: "Sony", lastUpdated: "2023-06-11" }
];

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const { error, loading, executeRequest, resetError } = useApiError({
    showToast: true,
    defaultMessage: "No se pudieron cargar los productos del inventario"
  });

  // Cargar datos del inventario
  useEffect(() => {
    const fetchInventory = async () => {
      const result = await executeRequest(async () => {
        // Intenta obtener datos del backend
        return await inventoryService.getProducts();
      });

      if (result) {
        setInventoryData(result);
      } else {
        // Si hay error, usar datos mock
        setInventoryData(mockInventoryData);
      }

      setIsLoading(false);
    };

    fetchInventory();
  }, [executeRequest]);

  // Filtrar inventario por búsqueda y categoría
  const filteredInventory = Array.isArray(inventoryData)
    ? inventoryData.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
    : [];

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(Array.isArray(inventoryData)
    ? inventoryData.map(item => item.category)
    : []));

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    startLoading('refreshInventory');

    const result = await executeRequest(async () => {
      return await inventoryService.getProducts();
    });

    if (result) {
      setInventoryData(result);
      toast({
        title: "Datos actualizados",
        description: "El inventario se ha actualizado correctamente.",
        variant: "success"
      });
    }

    setIsRefreshing(false);
    stopLoading('refreshInventory');
  };

  return (
    <PageTransition transition={{ type: 'fade', duration: 0.3 }}>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
            <p className="text-muted-foreground">Administra tus productos y consulta su disponibilidad</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>

            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Añadir Producto
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg p-4 mb-6 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nombre, SKU o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estado de error */}
        {error && !isLoading && (
          <div className="mb-6">
            <ApiError
              error={error}
              resetError={resetError}
              retry={handleRefresh}
            />
          </div>
        )}

        {/* Mensaje de fallback */}
        {error && inventoryData === mockInventoryData && !isLoading && (
          <div className="mb-6">
            <ErrorMessage
              title="Mostrando datos de ejemplo"
              message="No se pudo conectar con el servidor. Mostrando datos de ejemplo de inventario."
              severity="info"
            />
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <LoadingState
            isLoading={isLoading}
            fallbackType="skeleton"
            skeleton={
              <div className="p-4">
                <Skeleton className="h-10 w-1/3 mb-6" />
                <Skeleton variant="table-row" count={5} />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Precio</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Categoría</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Proveedor</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        {searchTerm || categoryFilter !== 'all'
                          ? 'No se encontraron productos que coincidan con los filtros.'
                          : 'No hay productos en el inventario.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm">{item.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.sku}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            item.stock > 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {item.stock} unidades
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.supplier}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </LoadingState>
        </div>
      </div>
    </PageTransition>
  );
}

