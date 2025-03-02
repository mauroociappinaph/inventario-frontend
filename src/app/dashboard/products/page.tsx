"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Plus, Trash2, Search, Filter, ArrowUpDown, Tag, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { productService } from "@/lib/api/api" // Importamos el servicio de productos existente

// Tipo para los productos
interface Product {
  _id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: "active" | "inactive"
  createdAt: string
}

// Posibles formatos de respuesta de la API
interface ApiResponse {
  data?: Product[]
  pagination?: {
    total: number
    page: number
    limit: number
  }
  total?: number
  meta?: {
    total: number
  }
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    price: 0,
    stock: 0
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProducts()
  }, [currentPage, itemsPerPage])

  // Función para cargar productos desde la API
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await productService.getProducts(currentPage, itemsPerPage) as unknown as ApiResponse | Product[]

      // Manejamos diferentes formatos de respuesta posibles
      if (Array.isArray(response)) {
        setProducts(response)
        setTotalPages(1) // Si es un array plano, asumimos una sola página
      } else {
        // Si es un objeto con formato de respuesta paginada
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data)
          // Calculamos el total de páginas basado en la estructura de la respuesta
          const total =
            response.pagination?.total ||
            response.total ||
            response.meta?.total ||
            response.data.length
          setTotalPages(Math.ceil(total / itemsPerPage))
        } else {
          // Si no hay una estructura reconocible, inicializamos con array vacío
          setProducts([])
          setTotalPages(1)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Intente nuevamente.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(products.map(p => p.category)))

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
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "" || product.category === categoryFilter
      const matchesStatus = statusFilter === "" || product.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
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

  // Función para añadir un nuevo producto
  const handleAddProduct = async () => {
    try {
      const productToAdd = {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
        status: "active"
      }

      await productService.createProduct(productToAdd)
      fetchProducts() // Recargar productos

      setNewProduct({
        name: "",
        sku: "",
        category: "",
        price: 0,
        stock: 0
      })
      setShowAddDialog(false)

      toast({
        title: "Producto añadido",
        description: `Se ha añadido "${productToAdd.name}" a la lista de productos.`,
      })
    } catch (error) {
      console.error("Error al añadir producto:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto. Intente nuevamente.",
        variant: "destructive"
      })
    }
  }

  // Función para editar un producto
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowEditDialog(true)
  }

  // Función para guardar los cambios de un producto
  const handleSaveEditedProduct = async () => {
    if (!editingProduct) return

    try {
      await productService.updateProduct(editingProduct._id, {
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock,
        status: editingProduct.status
      })

      fetchProducts() // Recargar productos
      setShowEditDialog(false)
      setEditingProduct(null)

      toast({
        title: "Producto actualizado",
        description: `Se ha actualizado "${editingProduct.name}" correctamente.`,
      })
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto. Intente nuevamente.",
        variant: "destructive"
      })
    }
  }

  // Función para eliminar un producto
  const handleDeleteProduct = async (id: string) => {
    try {
      const productToDelete = products.find(p => p._id === id)
      await productService.deleteProduct(id)

      fetchProducts() // Recargar productos

      toast({
        title: "Producto eliminado",
        description: `Se ha eliminado "${productToDelete?.name}" de la lista de productos.`,
        variant: "destructive"
      })
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Intente nuevamente.",
        variant: "destructive"
      })
    }
  }

  // Función para cambiar el estado de un producto
  const handleToggleStatus = async (id: string) => {
    try {
      const product = products.find(p => p._id === id)
      if (!product) return

      const newStatus = product.status === "active" ? "inactive" : "active"

      await productService.updateProduct(id, { status: newStatus })
      fetchProducts() // Recargar productos

      toast({
        title: "Estado actualizado",
        description: `El producto ahora está ${newStatus === "active" ? "activo" : "inactivo"}.`,
      })
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del producto. Intente nuevamente.",
        variant: "destructive"
      })
    }
  }

  // Funciones para paginación
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus size={16} />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Listado de Productos</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                    <Tag className="h-4 w-4" />
                    <SelectValue placeholder="Categoría" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando productos...</span>
            </div>
          ) : (
            <>
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
                            Nombre
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
                        <th className="py-3 px-4 text-left">
                          <button
                            className="flex items-center gap-1"
                            onClick={() => handleSort("sku")}
                          >
                            SKU
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
                        <th className="py-3 px-4 text-left">
                          <button
                            className="flex items-center gap-1"
                            onClick={() => handleSort("category")}
                          >
                            Categoría
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
                        <th className="py-3 px-4 text-left">
                          <button
                            className="flex items-center gap-1"
                            onClick={() => handleSort("price")}
                          >
                            Precio
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
                        <th className="py-3 px-4 text-left">
                          <button
                            className="flex items-center gap-1"
                            onClick={() => handleSort("stock")}
                          >
                            Stock
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
                        <th className="py-3 px-4 text-left">
                          <button
                            className="flex items-center gap-1"
                            onClick={() => handleSort("status")}
                          >
                            Estado
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                          </button>
                        </th>
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
                        filteredProducts.map((product) => (
                          <tr key={product._id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="py-3 px-4">{product.name}</td>
                            <td className="py-3 px-4">{product.sku}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="font-normal">
                                {product.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${product.stock < 10 ? 'text-destructive' : ''}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={product.status === "active" ? "default" : "secondary"}
                                className="flex gap-1 items-center w-fit"
                              >
                                {product.status === "active" ? (
                                  <>
                                    <CheckCircle size={12} />
                                    <span>Activo</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={12} />
                                    <span>Inactivo</span>
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleStatus(product._id)}
                                  title={product.status === "active" ? "Desactivar" : "Activar"}
                                >
                                  {product.status === "active" ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                  title="Editar"
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteProduct(product._id)}
                                  title="Eliminar"
                                  className="text-destructive"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredProducts.length} de {products.length} productos
                </div>

                {/* Paginación simple */}
                {totalPages > 1 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para añadir nuevo producto */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Producto</DialogTitle>
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                className="col-span-3"
              />
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
                placeholder="Electrónica, Periféricos, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio
              </Label>
              <Input
                id="price"
                type="number"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                className="col-span-3"
                min="0"
                step="0.01"
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleAddProduct}>
              Guardar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar producto */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifique los campos para actualizar el producto.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="edit-sku"
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Categoría
                </Label>
                <Input
                  id="edit-category"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                  className="col-span-3"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Estado
                </Label>
                <Select
                  value={editingProduct.status}
                  onValueChange={(value) => setEditingProduct({...editingProduct, status: value as "active" | "inactive"})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveEditedProduct}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
