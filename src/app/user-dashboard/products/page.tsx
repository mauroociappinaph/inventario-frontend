"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, ArrowUpDown, Tag, CheckCircle, XCircle, Loader2, Eye, Plus } from "lucide-react"
import { productService, ProductStatus, BackendProductStatus, CreateProductDto, ErrorResponse, convertStatusToBackend, convertStatusToFrontend } from "@/lib/api/api" // Importamos el servicio y los tipos
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context" // Importamos el contexto de autenticación

// Tipo para los productos
interface Product {
  _id: string
  name: string

  category: string
  price: number
  stock: number
  status: ProductStatus
  createdAt: string
}

// Tipo para los nuevos productos antes de ser enviados al backend
interface NewProduct {
  name: string

  category: string
  price: number
  stock: number
  status: ProductStatus
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

export default function UserProductsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("active") // Por defecto solo mostramos productos activos
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  // Estado para el diálogo de crear producto
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",

    category: "",
    price: 0,
    stock: 0,
    status: "active"
  })

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
        // Aseguramos que los estados se conviertan correctamente
        const formattedProducts = response.map(product => ({
          ...product,
          status: convertStatusToFrontend(product.status as string) // Convertir estados del backend al frontend
        }));
        setProducts(formattedProducts);
        setTotalPages(1) // Si es un array plano, asumimos una sola página
      } else {
        // Si es un objeto con formato de respuesta paginada
        if (response.data && Array.isArray(response.data)) {
          // Aseguramos que los estados se conviertan correctamente
          const formattedProducts = response.data.map(product => ({
            ...product,
            status: convertStatusToFrontend(product.status as string) // Convertir estados del backend al frontend
          }));
          setProducts(formattedProducts);
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
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      const matchesStatus = statusFilter === "all" || product.status === statusFilter

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

  // Funciones para paginación
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  // Función para ver detalles de un producto
  const handleViewProduct = (product: Product) => {
    setViewingProduct(product)
    setShowViewDialog(true)
  }

  // Función para agregar un nuevo producto
  const handleAddProduct = async () => {
    try {
      // Verificar que se hayan completado todos los campos requeridos
      if (!newProduct.name ||  !newProduct.category) {
        toast({
          title: "Campos incompletos",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive"
        });
        return;
      }

      // Convertir valores numéricos para asegurar que son números
      const price = Number(newProduct.price);
      const stock = Number(newProduct.stock);

      // Verificar que los valores sean válidos
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Error en datos",
          description: "El precio debe ser un número mayor a 0",
          variant: "destructive"
        });
        return;
      }

      if (isNaN(stock) || stock < 0) {
        toast({
          title: "Error en datos",
          description: "El stock debe ser un número mayor o igual a 0",
          variant: "destructive"
        });
        return;
      }

      // Crear el nuevo producto con exactamente los campos que el backend espera según CreateProductDto
      const productToAdd: Partial<CreateProductDto> = {
        name: newProduct.name.trim(),
        description: `${newProduct.name.trim()} `,
        price: price,
        stock: stock,
        entryDate: new Date().toISOString(),

        category: newProduct.category.trim(),
        status: convertStatusToBackend(newProduct.status), // Usamos la función de utilidad
        minStock: Math.max(1, Math.floor(stock * 0.1)) // 10% del stock inicial o mínimo 1
      };

      console.log("Enviando datos de producto:", productToAdd);

      // Intentar crear el producto
      const response = await productService.createProduct(productToAdd);
      console.log("Respuesta del servidor:", response);

      // Recargar la lista de productos
      await fetchProducts();

      // Reiniciar el formulario
      setNewProduct({
        name: "",

        category: "",
        price: 0,
        stock: 0,
        status: "active"
      });

      // Cerrar el diálogo
      setIsAddProductDialogOpen(false);

      // Mostrar notificación
      toast({
        title: "Producto añadido",
        description: `Se ha añadido "${productToAdd.name}" al catálogo de productos.`
      });
    } catch (error: unknown) {
      console.error("Error al crear producto:", error);
      console.error("Detalles completos del error:", JSON.stringify(error, null, 2));

      // Intentar obtener un mensaje de error más específico
      let errorMessage = "No se pudo crear el producto. Intente nuevamente.";

      // Tipamos el error correctamente
      const typedError = error as ErrorResponse;

      if (typedError.data && typedError.data.response) {
        // Si hay un mensaje en la respuesta, usarlo
        errorMessage = typedError.data.response.data?.message || errorMessage;

        // Si hay errores de validación, formatearlos
        if (typedError.data.response.data?.errors) {
          const validationErrors = typedError.data.response.data.errors;
          if (Object.keys(validationErrors).length > 0) {
            errorMessage = Object.entries(validationErrors)
              .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
              .join(', ');
          }
        }
      } else if (typedError.data?.errors) {
        // Si es un objeto de error con datos y errores (formato de nuestro interceptor)
        const validationErrors = typedError.data.errors;
        if (Object.keys(validationErrors).length > 0) {
          errorMessage = Object.entries(validationErrors)
            .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
            .join(', ');
        } else {
          errorMessage = typedError.message || errorMessage;
        }
      } else if (typedError.message) {
        // Si hay un mensaje en el objeto de error, usarlo
        errorMessage = typedError.message;
      } else if (typedError.status) {
        // Si es un error formateado por nuestro interceptor
        errorMessage = `Error ${typedError.status}: ${typedError.message || 'Error desconocido'}`;
      }

      toast({
        title: "Error al crear producto",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        <Button
          onClick={() => setIsAddProductDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Crear Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Listado de Productos Disponibles</CardTitle>
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
                  <SelectItem value="all">Todas las categorías</SelectItem>
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
                  <SelectItem value="all">Todos los estados</SelectItem>
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
                                  onClick={() => handleViewProduct(product)}
                                  title="Ver detalles"
                                >
                                  <Eye size={16} />
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

      {/* Diálogo para ver detalles del producto */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
            <DialogDescription>
              Información detallada sobre el producto seleccionado.
            </DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="font-semibold text-right">Nombre:</div>
                <div className="col-span-2">{viewingProduct.name}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="font-semibold text-right">Categoría:</div>
                <div className="col-span-2">{viewingProduct.category}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="font-semibold text-right">Precio:</div>
                <div className="col-span-2">${viewingProduct.price.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="font-semibold text-right">Stock Disponible:</div>
                <div className="col-span-2">
                  <span className={viewingProduct.stock < 10 ? 'text-destructive font-semibold' : ''}>
                    {viewingProduct.stock} unidades
                  </span>
                  {viewingProduct.stock < 10 && (
                    <span className="ml-2 text-xs text-destructive">
                      (Stock bajo)
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="font-semibold text-right">Estado:</div>
                <div className="col-span-2">
                  <Badge
                    variant={viewingProduct.status === "active" ? "default" : "secondary"}
                    className="flex gap-1 items-center w-fit"
                  >
                    {viewingProduct.status === "active" ? (
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
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="font-semibold text-right">Fecha de Alta:</div>
                <div className="col-span-2">
                  {new Date(viewingProduct.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-center">
            <Button onClick={() => setShowViewDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear nuevo producto */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Producto</DialogTitle>
            <DialogDescription>
              Complete los campos para agregar un nuevo producto al catálogo.
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado
              </Label>
              <Select
                value={newProduct.status}
                onValueChange={(value: "active" | "inactive") =>
                  setNewProduct({...newProduct, status: value})
                }
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.category || newProduct.price <= 0}
            >
              Guardar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
