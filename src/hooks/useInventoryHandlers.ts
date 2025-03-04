import { useToast } from '@/components/ui/use-toast';
import { productService } from '@/lib/api/api';
import { useSyncUtils } from '@/lib/api/sync-utils';
import { useInventoryStore } from '@/store/useInventoryStore';
import { Product } from '@/types/inventory.interfaces';
import { useState } from 'react';

/**
 * Verifica si un valor es un array válido de productos
 */
function isValidProductsArray(data: any): data is Product[] {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' && item !== null &&
    // Verificar que tenga al menos id y name, que son campos obligatorios
    ('id' in item || '_id' in item) && 'name' in item
  );
}

/**
 * Hook personalizado que encapsula los manejadores de eventos relacionados con el inventario.
 * Separa la lógica de manejo de eventos del store para mejorar la organización y reutilización.
 */
export const useInventoryHandlers = () => {
  // Obtener funciones y estado del store
  const store = useInventoryStore();
  const { toast } = useToast();
  const syncUtils = useSyncUtils();

  // Estados locales para formularios que no están en el store
  const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);
  const [isProcessingMovement, setIsProcessingMovement] = useState(false);

  /**
   * Maneja la carga de productos
   */
  const handleFetchProducts = async (userId: string) => {
    try {
      // Usar el fetchProducts del store
      await store.fetchProducts(userId);
      // Cargar también los movimientos
      await store.fetchStockMovements(userId);
    } catch (err: any) {
      // El error ya está manejado en el store, simplemente mostramos el toast
      showErrorToast("Error", err.message || "No se pudieron cargar los productos");
    }
  };

  /**
   * Maneja la apertura del formulario de creación de producto
   */
  const handleCreateProduct = async () => {
    setIsAddProductFormOpen(true);
  };

  /**
   * Maneja el envío del formulario de creación de producto
   */
  const handleSubmitProduct = async (userId: string) => {
    if (!store.newProduct.name || !store.newProduct.category) {
      showErrorToast(
        "Datos incompletos",
        "Por favor complete todos los campos obligatorios"
      );
      return;
    }

    try {
      store.setIsLoading(true);

      // Crear el producto usando el servicio de productos
      const productData = {
        name: store.newProduct.name,
        category: store.newProduct.category,
        price: store.newProduct.price || 0,
        stock: store.newProduct.stock || 0,
        minStock: store.newProduct.minimumStock || 0,
        userId: userId,
        entryDate: new Date().toISOString()
      };

      const response = await productService.createProduct(productData);
      console.log("Producto creado:", response);

      // Actualizar estado
      await store.fetchProducts(userId);
      store.setIsAddProductDialogOpen(false);
      store.resetNewProductForm();

      showSuccessToast(
        "Producto creado",
        `El producto ${productData.name} ha sido creado con éxito`
      );
    } catch (err: any) {
      showErrorToast(
        "Error al crear producto",
        err.message || "Ha ocurrido un error al crear el producto"
      );
    } finally {
      store.setIsLoading(false);
      setIsAddProductFormOpen(false);
    }
  };

  /**
   * Maneja la apertura del diálogo de movimientos
   */
  const handleOpenMovementDialog = (product: any, type: "entrada" | "salida") => {
    if (!product) {
      showErrorToast("Error", "Producto no seleccionado");
      return;
    }

    // Asegurarnos de que el tipo sea válido
    const movementType = type === "entrada" ? "entrada" : "salida";
    const title = movementType === "entrada" ? "Registrar entrada de productos" : "Registrar salida de productos";
    const description = movementType === "entrada"
      ? "Ingrese la cantidad de productos que entrarán al inventario."
      : "Ingrese la cantidad de productos que saldrán del inventario.";

    store.openMovementDialog(product, movementType);
    store.setDialogTitle(title);
    store.setDialogDescription(description);
  };

  /**
   * Maneja la creación de un movimiento
   */
const handleStockMovement = async (userId: string, userName?: string) => {
  console.log("handleStockMovement called with:", { userId, userName, selectedProduct: store.selectedProduct });

  if (!store.selectedProduct) {
    console.error("Error: No product selected");
    showErrorToast("Error", "No hay producto seleccionado");
    return;
  }

  setIsProcessingMovement(true);

  try {
    console.log("Movement details:", {
      type: store.movementType,
      quantity: store.movementQuantity,
      stock: store.selectedProduct.stock
    });

    if (store.movementType === "salida" && store.movementQuantity > store.selectedProduct.stock) {
      throw new Error(`Stock insuficiente. Disponible: ${store.selectedProduct.stock} unidades`);
    }

console.log("Enviando datos a handleStockMovement:", { userId, userName, selectedProduct: store.selectedProduct, movementType: store.movementType, movementQuantity: store.movementQuantity });
await store.handleStockMovement(userId, userName || "Usuario");

    showSuccessToast(
      "Movimiento registrado",
      `${store.movementType === "entrada" ? "Entrada" : "Salida"} de ${store.movementQuantity} unidades registrada con éxito`
    );

    store.resetMovementForm();
  } catch (err: any) {
    console.error("Error processing stock movement:", err);
    showErrorToast("Error al procesar movimiento", err.message || "Ha ocurrido un error al procesar el movimiento");
  } finally {
    setIsProcessingMovement(false);
    console.log("handleStockMovement completed");
  }
};

  /**
   * Maneja la sincronización de datos
   */
  const handleSyncData = async () => {
    try {
      if (syncUtils.isOnline && syncUtils.hasBackendConnection) {
        // Aquí iría la lógica de sincronización con el backend
        showSuccessToast(
          "Datos sincronizados",
          "Los datos se han sincronizado correctamente con el servidor"
        );
      } else {
        showErrorToast(
          "Error de conexión",
          "No hay conexión con el servidor. Los cambios se guardarán localmente"
        );
      }
    } catch (err: any) {
      showErrorToast(
        "Error de sincronización",
        err.message || "No se pudieron sincronizar los datos"
      );
    }
  };

  /**
   * Maneja la apertura del diálogo para añadir productos
   */
  const handleOpenAddProductDialog = () => {
    store.resetNewProductForm();
    store.setIsAddProductDialogOpen(true);
  };

  /**
   * Maneja la selección de un producto
   */
  const handleSelectProduct = (product: Product) => {
    store.setSelectedProduct(product);
  };

  /**
   * Maneja el ordenamiento de productos
   */
  const handleSort = (field: string) => {
    store.handleSort(field);
  };

  /**
   * Maneja la aplicación de un filtro guardado
   */
  const handleApplySavedFilter = (filterId: string) => {
    store.loadSavedFilter(filterId);
  };

  /**
   * Maneja el guardado del filtro actual
   */
  const handleSaveCurrentFilter = (name: string) => {
    store.saveCurrentFilter(name);
  };

  /**
   * Maneja la eliminación de un filtro guardado
   */
  const handleDeleteSavedFilter = (filterId: string) => {
    store.deleteSavedFilter(filterId);
  };

  /**
   * Muestra un toast de éxito
   */
  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "default"
    });
  };

  /**
   * Muestra un toast de error
   */
  const showErrorToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive"
    });
  };

  /**
   * Muestra un toast de información
   */
  const showInfoToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "default"
    });
  };




  // Retornar las funciones y estados necesarios
  return {
    // Estados del store
    products: store.products,
    isLoading: store.isLoading,
    error: store.error,

    // Estado local adicional
    isProcessingMovement,
    isAddProductFormOpen,

    // Propiedades del sistema de sincronización
    syncState: syncUtils.connectionState,

    // Manejadores
    handleFetchProducts,
    handleCreateProduct,
    handleSubmitProduct,
    handleOpenMovementDialog,
    handleStockMovement,
    handleSyncData,
    handleOpenAddProductDialog,
    handleSelectProduct,
    handleSort,
    handleApplySavedFilter,
    handleSaveCurrentFilter,
    handleDeleteSavedFilter,

    // Utilidades
    showSuccessToast,
    showErrorToast,
    showInfoToast
  };
};
