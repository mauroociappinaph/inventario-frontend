"use client"

import { Button } from "@/components/ui/button"
import { ConnectionAlert, ConnectionStatus } from "@/components/ui/connection-status"
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

  // Los usuarios normales no son administradores
  const isAdmin = false

  // Obtenemos estados y acciones del store
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

  // Obtenemos los handlers del inventario
  const {
    isLoading: isHandlerLoading,
    error: handlerError,
    handleSubmitProduct,
    handleOpenAddProductDialog,
    handleFetchProducts
  } = useInventoryHandlers();

  // Estado para registrar errores de renderizado
  const [renderError, setRenderError] = useState<string | null>(null);

  // Wrapper de seguridad para funciones que podrían fallar
  const safeExecute = (fn: Function, fallback: any = null, ...args: any[]) => {
    try {
      return fn(...args);
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido";
      console.error(`Error al ejecutar función:`, errorMessage, error);
      setRenderError(errorMessage);
      return fallback;
    }
  };

  // Obtenemos productos filtrados y estadísticas del store con manejo de errores
  const filteredProducts = safeExecute(getFilteredProducts, [], []);
  const statistics = safeExecute(getStatistics, {
    totalProducts: 0,
    lowStockProducts: 0,
    totalStock: 0,
    criticalStockPercentage: 0
  }, []);

  // Ordenar movimientos de inventario por fecha (más reciente primero)
  const sortedMovements = safeExecute(() => {
    const movements = Array.isArray(stockMovements) ? stockMovements : [];
    return [...movements].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [], []);

  // Cargar productos al iniciar o al cambiar de usuario
  useEffect(() => {
    if (user?.id) {
      handleFetchProducts(user.id).catch(error => {
        console.error("Error al cargar productos:", error);
        toast({
          title: "Error al cargar productos",
          description: error?.message || "No se pudieron cargar los productos. Intente recargar la página.",
          variant: "destructive"
        });
      });
    }
  }, [user]);

  // Agregar loading states locales para UI
  const [isLoading, setIsLoading] = useState({
    products: false,
    movements: false,
    addProduct: false
  });

  // Función para reintentar cargar datos cuando falla
  const handleRetryLoad = () => {
    if (user?.id) {
      toast({
        title: "Reintentando",
        description: "Intentando cargar los datos de inventario nuevamente."
      });

      handleFetchProducts(user.id).catch(error => {
        toast({
          title: "Persiste el error",
          description: error?.message || "No se pudieron cargar los productos. Intente más tarde.",
          variant: "destructive"
        });
      });
    }
  };

  // Si hay un error de renderizado, mostrar mensaje amigable
  if (renderError) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="bg-destructive/10 p-6 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error en el módulo de inventario</h2>
          <p className="mb-4">No pudimos cargar la información de inventario en este momento.</p>
          <div className="bg-background p-4 rounded text-left mb-4 font-mono text-sm overflow-auto">
            {renderError}
          </div>
          <p className="mb-6 text-muted-foreground">
            Este error puede deberse a un problema con la conexión al servidor o al acceder a los datos de inventario.
          </p>
          <Button
            variant="default"
            className="mx-auto"
            onClick={handleRetryLoad}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Consulta de Inventario</h1>
        <div className="flex flex-wrap items-center gap-2">
          <ConnectionStatus compact iconOnly className="mr-2" />
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
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleOpenAddProductDialog()}
          >
            <PackagePlus size={16} />
            Agregar Producto
          </Button>
        </div>
      </div>

    <ResumenCard products={products} stockMovements={stockMovements} />
      <InventoryFilters />
      <ConnectionAlert />

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
            movements={Array.isArray(stockMovements) ? stockMovements : []}
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
          <form onSubmit={(e) => {
            e.preventDefault();
            if (user) {
              handleSubmitProduct(user.id);
            } else {
              // Mostrar mensaje si no hay usuario
              console.error("No hay usuario autenticado");
            }
          }}>
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
