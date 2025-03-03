"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CompactToggle } from "@/components/ui/compact-toggle"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExportButton } from "@/components/ui/export-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SavedFilters } from "@/components/ui/saved-filters"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart,
  CheckCircle2,
  Download,
  FileBarChart,
  History,
  PackageMinus,
  PackageOpen,
  PackagePlus,
  SearchIcon,
  TrendingDown,
  TrendingUp
} from "lucide-react"
import { useState } from "react"

// Tipos para los productos y movimientos
interface Product {
  id: string
  name: string
  category: string
  stock: number
  minimumStock: number
  location: string
  lastUpdated: string
}

interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "entry" | "exit" | "adjustment"
  quantity: number
  reason: string
  date: string
  user: string
}

export default function InventoryPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  // Verificar si el usuario es administrador
  const isAdmin = user?.roles?.includes('admin')

  // Estado de movimientos de stock
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    {
      id: "1",
      productId: "1",
      productName: "Laptop HP Pavilion",
      type: "entry",
      quantity: 5,
      reason: "Compra a proveedor",
      date: "2023-10-15T14:30:00Z",
      user: "Juan Pérez"
    },
    {
      id: "2",
      productId: "2",
      productName: "Monitor Samsung 27\"",
      type: "exit",
      quantity: 2,
      reason: "Venta",
      date: "2023-10-12T09:45:00Z",
      user: "María López"
    },
    {
      id: "3",
      productId: "3",
      productName: "Teclado Mecánico RGB",
      type: "entry",
      quantity: 10,
      reason: "Devolución",
      date: "2023-10-10T11:20:00Z",
      user: "Pedro Gómez"
    },
    {
      id: "4",
      productId: "4",
      productName: "Mouse Inalámbrico",
      type: "exit",
      quantity: 3,
      reason: "Venta",
      date: "2023-10-08T16:15:00Z",
      user: "Ana Rodríguez"
    },
    {
      id: "5",
      productId: "5",
      productName: "Audífonos Bluetooth",
      type: "adjustment",
      quantity: -2,
      reason: "Inventario físico",
      date: "2023-10-05T13:10:00Z",
      user: "Carlos Martínez"
    }
  ])

  // Productos del inventario
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Laptop HP Pavilion",
      category: "Computadoras",
      stock: 12,
      minimumStock: 5,
      location: "Bodega A, Estante 3",
      lastUpdated: "2023-10-15T08:30:00Z"
    },
    {
      id: "2",
      name: "Monitor Samsung 27\"",
      category: "Periféricos",
      stock: 8,
      minimumStock: 10,
      location: "Bodega B, Estante 1",
      lastUpdated: "2023-10-12T14:45:00Z"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [movementType, setMovementType] = useState<"entry" | "exit" | "adjustment">("entry")
  const [movementQuantity, setMovementQuantity] = useState(1)
  const [movementReason, setMovementReason] = useState("")
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(products.map(p => p.category))) as string[]

  // Calcular estadísticas de inventario
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.stock <= p.minimumStock).length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const criticalStockPercentage = (lowStockProducts / totalProducts) * 100

  // Función para manejar el ordenamiento
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      const matchesStock = stockFilter === "all" ||
                          (stockFilter === "low" && product.stock <= product.minimumStock) ||
                          (stockFilter === "normal" && product.stock > product.minimumStock)

      return matchesSearch && matchesCategory && matchesStock
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product]
      let bValue: any = b[sortBy as keyof Product]

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  // Ordenar movimientos de inventario por fecha (más reciente primero)
  const sortedMovements = [...stockMovements].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Función para abrir el diálogo de movimientos
  const openMovementDialog = (product: Product, type: "entry" | "exit" | "adjustment") => {
    setSelectedProduct(product)
    setMovementType(type)
    setMovementQuantity(1)
    setMovementReason("")
    setIsMovementDialogOpen(true)
  }

  // Función para registrar un movimiento de inventario
  const handleStockMovement = () => {
    if (!selectedProduct) return

    const isExitMovement = movementType === "exit"
    const isAdjustment = movementType === "adjustment"

    // Para salidas, verificar que haya suficiente stock
    if (isExitMovement && selectedProduct.stock < movementQuantity) {
      toast({
        title: "Error de stock",
        description: "No hay suficiente stock para realizar esta operación.",
        variant: "destructive"
      })
      return
    }

    // Para ajustes negativos, verificar que haya suficiente stock
    if (isAdjustment && movementQuantity < 0 && selectedProduct.stock < Math.abs(movementQuantity)) {
      toast({
        title: "Error de ajuste",
        description: "El ajuste negativo no puede ser mayor al stock disponible.",
        variant: "destructive"
      })
      return
    }

    // Crear nuevo movimiento
    const newMovement: StockMovement = {
      id: (Math.max(...stockMovements.map(m => parseInt(m.id))) + 1).toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: movementType,
      quantity: movementQuantity,
      reason: movementReason,
      date: new Date().toISOString(),
      user: "Usuario Actual" // En un caso real, sería el usuario logueado
    }

    // Actualizar stock del producto
    const stockChange = movementType === "entry"
      ? movementQuantity
      : movementType === "exit" ? -movementQuantity : 0;

    // Actualizar el stock del producto
    const updatedProduct = {
      ...selectedProduct,
      stock: selectedProduct.stock + stockChange,
      lastUpdated: new Date().toISOString()
    }

    // Añadir el movimiento al historial
    setStockMovements([...stockMovements, newMovement])

    // Cerrar el diálogo y mostrar mensaje
    setIsMovementDialogOpen(false)

    toast({
      title: "Movimiento registrado",
      description: `Se ha registrado un ${
        movementType === "entry"
          ? "ingreso"
          : (movementType === "exit" ? "salida" : "ajuste")
      } de ${movementQuantity} unidades de ${selectedProduct.name}.`
    })
  }

  // Determinar el título del diálogo según el tipo de movimiento
  const getMovementDialogTitle = () => {
    switch (movementType) {
      case "entry":
        return "Registrar Entrada de Inventario"
      case "exit":
        return "Registrar Salida de Inventario"
      case "adjustment":
        return "Registrar Ajuste de Inventario"
      default:
        return "Registrar Movimiento"
    }
  }

  // Determinar el color y el icono según el estado de stock
  const getStockStatusInfo = (product: Product) => {
    if (product.stock <= 0) {
      return {
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        icon: <AlertTriangle size={14} className="text-destructive" />,
        text: "Sin stock"
      }
    } else if (product.stock <= product.minimumStock) {
      return {
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        icon: <AlertTriangle size={14} className="text-amber-600" />,
        text: "Stock bajo"
      }
    } else {
      return {
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <CheckCircle2 size={14} className="text-green-600" />,
        text: "Stock adecuado"
      }
    }
  }

  // Formatear fecha a formato legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Exportando informe",
                description: "Se está generando el informe de inventario."
              })
            }}
          >
            <FileBarChart size={16} />
            Generar Informe
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Exportando datos",
                description: "Se está generando el archivo de exportación."
              })
            }}
          >
            <Download size={16} />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos en inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{lowStockProducts}</div>
              <Badge
                variant="outline"
                className={`ml-2 ${
                  criticalStockPercentage > 30
                    ? "bg-red-100 text-red-800"
                    : criticalStockPercentage > 15
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {criticalStockPercentage.toFixed(0)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos por debajo del stock mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total en Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unidades totales en stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockMovements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de productos y movimientos */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PackageOpen size={16} />
            <span>Productos</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <History size={16} />
            <span>Movimientos</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Productos */}
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle>Control de Stock</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="relative w-full md:w-auto">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar productos..."
                      className="pl-8 w-full md:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <div className="flex items-center gap-2">
                        <PackageOpen className="h-4 w-4" />
                        <SelectValue placeholder="Categoría" />
                      </div>
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

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <SelectValue placeholder="Estado de Stock" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="low">Stock bajo</SelectItem>
                      <SelectItem value="normal">Stock normal</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filtros guardados */}
                  <SavedFilters
                    filterType="inventory"
                    currentFilters={{ searchTerm, categoryFilter, stockFilter }}
                    onFilterSelect={(filters) => {
                      setSearchTerm(filters.searchTerm || "");
                      setCategoryFilter(filters.categoryFilter || "all");
                      setStockFilter(filters.stockFilter || "all");
                    }}
                  />

                  {/* Botón de exportación */}
                  <ExportButton
                    data={filteredProducts}
                    filename="inventario"
                    headerMap={{
                      name: "Nombre",
                      category: "Categoría",
                      stock: "Stock Actual",
                      minimumStock: "Stock Mínimo",
                      location: "Ubicación",
                      lastUpdated: "Última Actualización"
                    }}
                  />

                  {/* Toggle de modo compacto */}
                  <CompactToggle tableId="inventory-table" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm" id="inventory-table">
                    <thead>
                      <tr className="border-b bg-muted/50 font-medium">
                        <th className="py-3 px-4 text-left">
                          <button
                            className="flex items-center gap-1"
                            onClick={() => handleSort("name")}
                          >
                            Producto
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
                        <th className="py-3 px-4 text-left">

                        </th>
                        <th className="py-3 px-4 text-left hidden md:table-cell">Categoría</th>
                        <th className="py-3 px-4 text-left hidden lg:table-cell">Ubicación</th>
                        <th className="py-3 px-4 text-left">
                          <button
                            className="flex items-center gap-1"
                            onClick={() => handleSort("stock")}
                          >
                            Stock
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
                        <th className="py-3 px-4 text-left hidden md:table-cell">Mínimo</th>
                        <th className="py-3 px-4 text-left hidden lg:table-cell">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr className="border-b">
                          <td colSpan={8} className="py-8 text-center text-muted-foreground">
                            No se encontraron productos con los filtros actuales.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product: Product) => {
                          const stockStatus = getStockStatusInfo(product)
                          return (
                            <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium">{product.name}</td>

                              <td className="py-3 px-4 hidden md:table-cell">
                                <Badge variant="outline" className="font-normal">
                                  {product.category}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{product.location}</td>
                              <td className="py-3 px-4 font-semibold">
                                <span className={stockStatus.color}>{product.stock}</span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{product.minimumStock}</td>
                              <td className="py-3 px-4 hidden lg:table-cell">
                                <Badge
                                  variant="outline"
                                  className={`flex gap-1 items-center w-fit ${stockStatus.bgColor}`}
                                >
                                  {stockStatus.icon}
                                  <span className={stockStatus.color}>{stockStatus.text}</span>
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openMovementDialog(product, "entry")}
                                    title="Registrar entrada"
                                    className="text-green-600"
                                  >
                                    <PackagePlus size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openMovementDialog(product, "exit")}
                                    title="Registrar salida"
                                    className="text-amber-600"
                                  >
                                    <PackageMinus size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openMovementDialog(product, "adjustment")}
                                    title="Ajustar inventario"
                                  >
                                    <BarChart size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredProducts.length} de {products.length} productos
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Movimientos */}
        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>
                Registro de entradas, salidas y ajustes de inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 font-medium">
                        <th className="py-3 px-4 text-left">Fecha</th>
                        <th className="py-3 px-4 text-left">Producto</th>
                        <th className="py-3 px-4 text-left">Tipo</th>
                        <th className="py-3 px-4 text-left">Cantidad</th>
                        <th className="py-3 px-4 text-left hidden md:table-cell">Motivo</th>
                        <th className="py-3 px-4 text-left hidden lg:table-cell">Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMovements.length === 0 ? (
                        <tr className="border-b">
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No hay movimientos registrados.
                          </td>
                        </tr>
                      ) : (
                        sortedMovements.map((movement) => (
                          <tr key={movement.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="py-3 px-4 whitespace-nowrap">{formatDate(movement.date)}</td>
                            <td className="py-3 px-4 font-medium">{movement.productName}</td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={`flex gap-1 items-center w-fit ${
                                  movement.type === "entry"
                                    ? "bg-green-100 text-green-800"
                                    : movement.type === "exit"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {movement.type === "entry" ? (
                                  <><TrendingUp size={14} /> Entrada</>
                                ) : movement.type === "exit" ? (
                                  <><TrendingDown size={14} /> Salida</>
                                ) : (
                                  <><BarChart size={14} /> Ajuste</>
                                )}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              {movement.type === "adjustment" ? (
                                <span className={movement.quantity >= 0 ? "text-green-600" : "text-red-600"}>
                                  {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                                </span>
                              ) : (
                                movement.quantity
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{movement.reason}</td>
                            <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{movement.user}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="ml-auto gap-2"
                onClick={() => {
                  toast({
                    title: "Exportando movimientos",
                    description: "Se está generando el archivo de movimientos."
                  })
                }}
              >
                <Download size={16} />
                Exportar Movimientos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para registrar movimientos */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{getMovementDialogTitle()}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? `Producto: ${selectedProduct.name} ` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedProduct && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock actual:</span>
                  <span className="font-medium">{selectedProduct.stock} unidades</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock mínimo:</span>
                  <span className="font-medium">{selectedProduct.minimumStock} unidades</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="movement-type" className="text-right">
                Tipo
              </Label>
              <Select value={movementType} onValueChange={(value: "entry" | "exit" | "adjustment") => setMovementType(value)}>
                <SelectTrigger id="movement-type" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entrada</SelectItem>
                  <SelectItem value="exit">Salida</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                value={movementQuantity}
                onChange={(e) => {
                  // Para entradas y salidas, asegurar que la cantidad sea positiva
                  if (movementType !== "adjustment" && parseInt(e.target.value) < 0) {
                    setMovementQuantity(0)
                  } else {
                    setMovementQuantity(parseInt(e.target.value) || 0)
                  }
                }}
                className="col-span-3"
                min={movementType !== "adjustment" ? "1" : undefined}
                step="1"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reason" className="text-right pt-2">
                Motivo
              </Label>
              <Input
                id="reason"
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="col-span-3"
                placeholder={
                  movementType === "entry"
                    ? "Ej: Compra, devolución..."
                    : movementType === "exit"
                    ? "Ej: Venta, devolución a proveedor..."
                    : "Ej: Inventario físico, merma..."
                }
              />
            </div>
            {movementType === "exit" && selectedProduct && selectedProduct.stock < movementQuantity && (
              <div className="col-span-full text-destructive text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                No hay suficiente stock para esta operación.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleStockMovement}
              disabled={
                movementQuantity <= 0 ||
                !movementReason ||
                (movementType === "exit" && selectedProduct ? selectedProduct.stock < movementQuantity : false)
              }
            >
              Registrar Movimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
