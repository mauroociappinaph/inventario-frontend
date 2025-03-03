import { useToast } from '@/components/ui/use-toast';
import { useInventoryStore } from '@/store/useInventoryStore';
import { Product } from '@/types/inventory.interfaces';
import { useState } from 'react';
import { validateProduct } from '../lib/validation-utils';

/**
 * Hook personalizado que encapsula los manejadores de eventos relacionados con el inventario.
 * Separa la lógica de manejo de eventos del store para mejorar la organización y reutilización.
 */
export const useInventoryHandlers = () => {
  const store = useInventoryStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Maneja la carga de productos
   */
  const handleFetchProducts = async (userId: string) => {
    setError(null);
    setIsLoading(true);

    try {
      if (store.fetchProducts) {
        await store.fetchProducts(userId);
      } else {
        // Implementación alternativa si el método no existe en el store
        // En un caso real, aquí se haría una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Simulando fetch de productos para el usuario:', userId);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los productos');
      showErrorToast("Error", err.message || "No se pudieron cargar los productos");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la creación de un nuevo producto
   */
  const handleCreateProduct = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const newProductData = { ...store.newProduct };

      // Simulación de creación de producto
      await new Promise(resolve => setTimeout(resolve, 500));

      const newId = Date.now().toString();
      const product: Product = {
        id: newId,
        name: newProductData.name,
        category: newProductData.category,
        price: newProductData.price,
        stock: newProductData.stock,
        minStock: newProductData.minimumStock,
        lastUpdated: new Date().toISOString(),
        lastStockUpdate: new Date().toISOString()
      };

      store.setProducts([...store.products, product]);
      store.setIsAddProductDialogOpen(false);
      showSuccessToast("Producto creado", `Se ha creado el producto ${newProductData.name} correctamente.`);
    } catch (err: any) {
      setError(err.message || 'Error al crear el producto');
      showErrorToast("Error al crear producto", err.message || "No se pudo crear el producto");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la apertura del diálogo para añadir un nuevo producto
   */
  const handleOpenAddProductDialog = () => {
    store.setDialogTitle('Añadir Producto');
    store.setDialogDescription('Completa el formulario para añadir un nuevo producto al inventario.');
    store.setIsAddProductDialogOpen(true);
  };

  /**
   * Maneja la selección de un producto para ver detalles o hacer movimientos
   */
  const handleSelectProduct = (product: Product) => {
    store.setSelectedProduct(product);
  };

  /**
   * Maneja la apertura del diálogo para movimientos de stock
   */
  const handleOpenMovementDialog = (product: Product, type: "entry" | "exit" | "adjustment") => {
    store.setSelectedProduct(product);
    store.setMovementType(type);
    store.setMovementQuantity(1);
    store.setMovementReason('');

    const title = type === 'entry' ? 'Entrada de Stock' :
                 type === 'exit' ? 'Salida de Stock' : 'Ajuste de Stock';

    store.setDialogTitle(title);
    store.setDialogDescription(`Completa el formulario para registrar un ${title.toLowerCase()} para ${product.name}`);
    store.setIsMovementDialogOpen(true);
  };

  /**
   * Maneja el procesamiento de movimientos de stock
   */
  const handleProcessMovement = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!store.selectedProduct) {
        throw new Error('No hay producto seleccionado');
      }

      if (store.movementQuantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      if (!store.movementReason) {
        throw new Error('Debe ingresar un motivo para el movimiento');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const movementData = {
        id: Date.now().toString(),
        productId: store.selectedProduct.id,
        productName: store.selectedProduct.name,
        type: store.movementType,
        quantity: store.movementQuantity,
        reason: store.movementReason,
        date: new Date().toISOString(),
        user: "Usuario actual"
      };

      const updatedProducts = store.products.map(p => {
        if (p.id === store.selectedProduct?.id) {
          const newStock = store.movementType === "entry"
            ? p.stock + store.movementQuantity
            : p.stock - store.movementQuantity;

          return {
            ...p,
            stock: newStock,
            lastStockUpdate: new Date().toISOString()
          };
        }
        return p;
      });

      const updatedMovements = [movementData, ...store.stockMovements];

      store.setProducts(updatedProducts);
      store.setStockMovements(updatedMovements);
      store.setIsMovementDialogOpen(false);

      showSuccessToast(
        "Movimiento registrado",
        `Se ha registrado un ${store.movementType === "entry" ? "ingreso" : "egreso"} de ${store.movementQuantity} unidades`
      );
    } catch (err: any) {
      setError(err.message || 'Error al procesar el movimiento');
      showErrorToast("Error al procesar movimiento", err.message || "No se pudo procesar el movimiento");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario para agregar un nuevo producto
   */
  const handleAddProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateProduct(store.newProduct);
    if (error) {
      showErrorToast("Error en formulario", error);
      return;
    }

    setIsLoading(true);
    try {
      await handleCreateProduct();
      store.setIsAddProductDialogOpen(false);
      store.resetNewProductForm();
      showSuccessToast("Producto creado", "El producto se ha creado correctamente.");
    } catch (err: any) {
      setError(err.message || 'Error al crear el producto');
      showErrorToast("Error al crear producto", err.message || "No se pudo crear el producto");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el sorting de productos
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
   * Maneja el guardado de los filtros actuales
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
   * Función para mostrar una notificación de éxito
   */
  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "default"
    });
  };

  /**
   * Función para mostrar una notificación de error
   */
  const showErrorToast = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive"
    });
  };

  return {
    // Estado
    isLoading,
    error,

    // Manejadores
    handleCreateProduct,
    handleOpenAddProductDialog,
    handleSelectProduct,
    handleOpenMovementDialog,
    handleProcessMovement,
    handleSort,
    handleApplySavedFilter,
    handleSaveCurrentFilter,
    handleDeleteSavedFilter,
    handleFetchProducts,
    handleAddProductSubmit,

    // Utilidades
    showSuccessToast,
    showErrorToast
  };
};
