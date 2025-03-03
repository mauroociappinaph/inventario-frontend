"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers"
import { useInventoryStore } from "@/store/useInventoryStore"
import { FileBarChart, History, PackageOpen, PackagePlus } from "lucide-react"
import { useEffect, useState } from "react"
import InventoryFilters from "./components/filters/InventoryFilters"
import MovementDialog from "./components/MovementDialog"
import MovementsTable from "./components/MovementsTable"
import ProductsTable from "./components/ProductsTable"
import ResumenCard from "./components/resumenCard"

export default function UserInventoryPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const isAdmin = false

  const {
    products,
    stockMovements,
    selectedProduct,
    isMovementDialogOpen,
    movementType,
    movementQuantity,
    movementReason,
    isCreatingMovement,
    dialogTitle,
    dialogDescription,
    isAddProductDialogOpen,
    newProduct,
    getFilteredProducts,
    getStatistics,
    setSelectedProduct,
    setIsMovementDialogOpen,
    setMovementType,
    setMovementQuantity,
    setMovementReason,
    setNewProduct,
    resetNewProductForm,
    resetMovementForm,
    setIsAddProductDialogOpen
  } = useInventoryStore()

  const {
    isLoading: isHandlerLoading,
    error: handlerError,
    handleOpenAddProductDialog,
    handleFetchProducts,
    handleAddProductSubmit
  } = useInventoryHandlers()

  const filteredProducts = getFilteredProducts()


  useEffect(() => {
    if (user?.id) {
      handleFetchProducts(user.id)
    }
  }, [user])

  const [isLoading, setIsLoading] = useState({
    products: false,
    movements: false,
    addProduct: false
  })



  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Consulta de Inventario</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="gap-2"
            onClick={() => toast({
              title: "Solicitando informe",
              description: "Se está generando el informe de inventario. Espere por favor."
            })}
          >
            <FileBarChart size={16} />
            Solicitar Informe
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleOpenAddProductDialog}
          >
            <PackagePlus size={16} />
            Agregar Producto
          </Button>
        </div>
      </div>

      <ResumenCard />
      <InventoryFilters />

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PackageOpen size={16} />
            <span>Productos</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <History size={16} />
            <span>Mis Movimientos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductsTable
            products={products}
            filteredProducts={filteredProducts}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          <MovementsTable
            movements={stockMovements}
            userName={user?.name}
          />
        </TabsContent>
      </Tabs>

      <MovementDialog
        open={isMovementDialogOpen}
        onOpenChange={setIsMovementDialogOpen}
        product={selectedProduct}
        dialogTitle={dialogTitle}
        dialogDescription={dialogDescription}
        movementType={movementType}
        movementQuantity={movementQuantity}
        movementReason={movementReason}
        setMovementQuantity={setMovementQuantity}
        setMovementReason={setMovementReason}
        isCreatingMovement={isCreatingMovement}
      />

      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Complete los datos del producto a agregar al inventario.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProductSubmit}>
            <div className="grid gap-4 py-4">
              {['name', 'category', 'price', 'stock', 'minStock'].map((field) => (
                <div key={field} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={field} className="text-right">
                    {field === 'minStock' ? 'Stock Mínimo' : field === 'price' ? 'Precio' : field === 'stock' ? 'Stock Inicial' : field === 'category' ? 'Categoría' : 'Nombre'}
                  </Label>
                  <Input
                    id={field}
                    type={field === 'price' || field === 'stock' || field === 'minStock' ? 'number' : 'text'}
                    value={newProduct[field === 'minStock' ? 'minimumStock' : field as keyof typeof newProduct]}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      [field === 'minStock' ? 'minimumStock' : field]: field === 'price' ? parseFloat(e.target.value) : field === 'stock' || field === 'minStock' ? parseInt(e.target.value) : e.target.value
                    })}
                    className="col-span-3"
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading.addProduct}>
                {isLoading.addProduct ? 'Guardando...' : 'Guardar Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
