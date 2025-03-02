"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import {
  PackageOpen,
  PackagePlus,
  PackageMinus,
  History,
  AlertTriangle,
  CheckCircle2,
  SearchIcon,
  FileBarChart,
  BarChart,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Download
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tipos para los productos y movimientos
interface Product {
  id: string
  name: string

  category: string
  stock: number
  minimumStock: number
  location: string
  lastUpdated: string
  entryDate?: string  // Fecha de entrada
  exitDate?: string   // Fecha de salida
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

export default function UserInventoryPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  // Los usuarios normales no son administradores
  const isAdmin = false



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

  // Nuevo estado para el diálogo de agregar productos
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",

    category: "",
    minimumStock: 0,
    stock: 0,
    location: "",
    entryDate: "",
    exitDate: ""
  })

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(products.map(p => p.category)))

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
    .filter(product  => {
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
  // Los usuarios solo pueden registrar salidas (consumos)
  const openMovementDialog = (product: Product, type: "exit") => {
    setSelectedProduct(product)
    setMovementType(type)
    setMovementQuantity(1)
    setMovementReason("")
    setIsMovementDialogOpen(true)
  }

  // Función para registrar un movimiento de inventario
  const handleStockMovement = () => {
    if (!selectedProduct) return

    // Para salidas, verificar que haya suficiente stock
    if (selectedProduct.stock < movementQuantity) {
      toast({
        title: "Error de stock",
        description: "No hay suficiente stock para realizar esta operación.",
        variant: "destructive"
      })
      return
    }

    // Crear nuevo movimiento
    const newMovement: StockMovement = {
      id: (Math.max(...stockMovements.map(m => parseInt(m.id))) + 1).toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: "exit",
      quantity: movementQuantity,
      reason: movementReason,
      date: new Date().toISOString(),
      user: user?.name || "Usuario"
    }

    // Actualizar stock del producto (solo salidas para usuarios normales)
    setProducts(products.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          stock: p.stock - movementQuantity,
          lastUpdated: new Date().toISOString()
        }
      }
      return p
    }))

    // Añadir el movimiento al historial
    setStockMovements([...stockMovements, newMovement])

    // Cerrar el diálogo y mostrar mensaje
    setIsMovementDialogOpen(false)

    toast({
      title: "Salida registrada",
      description: `Se ha registrado una salida de ${movementQuantity} unidades de ${selectedProduct.name}.`
    })
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

  // Función para agregar un nuevo producto
  const handleAddProduct = () => {
    // Crear un ID para el nuevo producto
    const newId = (Math.max(...products.map(p => parseInt(p.id) || 0)) + 1).toString()

    // Crear el nuevo producto
    const productToAdd: Product = {
      id: newId,
      name: newProduct.name,

      category: newProduct.category,
      stock: newProduct.stock,
      minimumStock: newProduct.minimumStock,
      location: newProduct.location,
      lastUpdated: new Date().toISOString(),
      entryDate: newProduct.entryDate,
      exitDate: newProduct.exitDate
    }

    // Añadir el producto a la lista
    setProducts([...products, productToAdd])

    // Reiniciar el formulario
    setNewProduct({
      name: "",

      category: "",
      minimumStock: 0,
      stock: 0,
      location: "",
      entryDate: "",
      exitDate: ""
    })

    // Cerrar el diálogo
    setIsAddProductDialogOpen(false)

    // Mostrar notificación
    toast({
      title: "Producto añadido",
      description: `Se ha añadido "${productToAdd.name}" al inventario.`
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Consulta de Inventario</h1>
        {/* Usuarios normales solo pueden ver informes, no exportar datos */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Solicitando informe",
                description: "Se está generando el informe de inventario. Espere por favor."
              })
            }}
          >
            <FileBarChart size={16} />
            Solicitar Informe
          </Button>

          {/* Nuevo botón para agregar productos */}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsAddProductDialogOpen(true)}
          >
            <PackagePlus size={16} />
            Agregar Producto
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
            <CardTitle className="text-sm font-medium">Mis Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockMovements.filter(m => m.user === user?.name).length}
            </div>
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
            <span>Mis Consumos</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Productos */}
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle>Consulta de Stock</CardTitle>
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
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Estado de Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="low">Stock Bajo</SelectItem>
                      <SelectItem value="normal">Stock Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
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
                        <th className="py-3 px-4 text-left hidden lg:table-cell">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr className="border-b">
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No se encontraron productos con los filtros actuales.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product: any) => {
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
                                  {/* Usuarios normales solo pueden registrar salidas */}
                                  {product.stock > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openMovementDialog(product, "exit")}
                                      title="Registrar consumo"
                                      className="text-amber-600"
                                    >
                                      <PackageMinus size={16} />
                                    </Button>
                                  )}
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
              <CardTitle>Historial de Consumos</CardTitle>
              <CardDescription>
                Registro de salidas de inventario realizadas por usted
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
                        <th className="py-3 px-4 text-left">Cantidad</th>
                        <th className="py-3 px-4 text-left hidden md:table-cell">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Filtrar solo los movimientos del usuario actual y de tipo salida */}
                      {sortedMovements
                        .filter(m => m.user === user?.name && m.type === "exit")
                        .length === 0 ? (
                          <tr className="border-b">
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                              No tiene movimientos registrados.
                            </td>
                          </tr>
                        ) : (
                          sortedMovements
                            .filter(m => m.user === user?.name && m.type === "exit")
                            .map((movement) => (
                              <tr key={movement.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="py-3 px-4 whitespace-nowrap">{formatDate(movement.date)}</td>
                                <td className="py-3 px-4 font-medium">{movement.productName}</td>
                                <td className="py-3 px-4 font-semibold">{movement.quantity}</td>
                                <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{movement.reason}</td>
                              </tr>
                            ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para registrar consumos */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Consumo de Inventario</DialogTitle>
            <DialogDescription>
              {selectedProduct ? `Producto: ${selectedProduct.name} ` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedProduct && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock disponible:</span>
                  <span className="font-medium">{selectedProduct.stock} unidades</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                value={movementQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setMovementQuantity(value > 0 ? value : 1);
                }}
                className="col-span-3"
                min="1"
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
                placeholder="Ej: Uso personal, proyecto, cliente..."
              />
            </div>
            {selectedProduct && selectedProduct.stock < movementQuantity && (
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
                (selectedProduct ? selectedProduct.stock < movementQuantity : false)
              }
            >
              Registrar Consumo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nuevo diálogo para agregar productos */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Complete los campos para agregar un nuevo producto al inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="col-span-3"
                placeholder="Ej: Monitor Samsung 24&quot;"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">


            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Input
                id="category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                className="col-span-3"
                placeholder="Ej: Electrónica, Periféricos, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={newProduct.stock || ""}
                onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                className="col-span-3"
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minimumStock" className="text-right">
                Stock Mínimo
              </Label>
              <Input
                id="minimumStock"
                type="number"
                value={newProduct.minimumStock || ""}
                onChange={(e) => setNewProduct({...newProduct, minimumStock: parseInt(e.target.value) || 0})}
                className="col-span-3"
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Ubicación
              </Label>
              <Input
                id="location"
                value={newProduct.location}
                onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                className="col-span-3"
                placeholder="Ej: Almacén A - Estantería 3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entryDate" className="text-right">
                Fecha de Entrada
              </Label>
              <Input
                id="entryDate"
                type="date"
                value={newProduct.entryDate}
                onChange={(e) => setNewProduct({...newProduct, entryDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exitDate" className="text-right">
                Fecha de Salida
              </Label>
              <Input
                id="exitDate"
                type="date"
                value={newProduct.exitDate}
                onChange={(e) => setNewProduct({...newProduct, exitDate: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.category}
            >
              Guardar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
