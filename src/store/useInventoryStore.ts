import { inventoryService, productService } from '@/lib/api/api';
import { apiCache } from '@/lib/api/cache';
import { processProductsResponse } from '@/lib/product-utils';
import { FilterPreset, InventoryState, Product } from '@/types/inventory.interfaces';
import { getFilteredAndSortedProducts, getUniqueCategories } from '@/utils/filter-utils';
import { isValidProductId, prepareMovementData, updateProductList, updateProductStock } from '@/utils/movement-utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      // Estado
      products: [],
      stockMovements: [],
      isLoading: false,
      error: null,

      // Filtros
      searchTerm: '',
      categoryFilter: 'all',
      stockFilter: 'all' as 'all' | 'low' | 'out',
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'name',
      sortDirection: 'asc',
      savedFilters: [],

      // Estado de diálogos
      isMovementDialogOpen: false,
      selectedProduct: null,
      movementType: 'entrada' as 'entrada' | 'salida',
      movementQuantity: 1,
      movementReason: '',
      isCreatingMovement: false,
      dialogTitle: '',
      dialogDescription: '',

      // Estado de añadir producto
      isAddProductDialogOpen: false,
      newProduct: {
        name: '',
        category: '',
        minimumStock: 0,
        stock: 0,
        entryDate: new Date().toISOString().split('T')[0],
        exitDate: '',
        price: 0
      },

      // Selectores
      getCategories: () => {
        const { products } = get();
        return getUniqueCategories(products);
      },

      getFilteredProducts: () => {
        const {
          products,
          searchTerm,
          categoryFilter,
          stockFilter,
          sortBy,
          sortDirection,
          minPrice,
          maxPrice
        } = get();

        try {
          // Usar la función de utilidad para obtener productos filtrados y ordenados
          return getFilteredAndSortedProducts(
            products,
            {
              searchTerm,
              categoryFilter,
              stockFilter: stockFilter as 'all' | 'low' | 'out',
              minPrice,
              maxPrice
            },
            { sortBy, sortDirection }
          );
        } catch (error) {
          console.error("Error al filtrar productos:", error);
          return [];
        }
      },

      getStatistics: () => {
        const { products } = get();

        // Calcular estadísticas
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p =>
          p.stock <= (p.minStock || 0)
        ).length;

        // Calcular stock total y porcentaje crítico
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const criticalStockPercentage = totalProducts > 0
          ? (lowStockProducts / totalProducts) * 100
          : 0;

        return {
          totalProducts,
          lowStockProducts,
          totalStock,
          criticalStockPercentage
        };
      },

      // Acciones para filtros
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      setStockFilter: (stockFilter) => set({ stockFilter }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
      setMinPrice: (minPrice) => set({ minPrice }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      resetAllFilters: () => set({
        searchTerm: '',
        categoryFilter: 'all',
        stockFilter: 'all',
        minPrice: 0,
        maxPrice: 1000,
        sortBy: 'name',
        sortDirection: 'asc'
      }),
      resetPriceFilter: () => set({
        minPrice: 0,
        maxPrice: 1000
      }),

      // Acciones para productos
      setProducts: (products) => set({ products }),
      setStockMovements: (stockMovements) => set({ stockMovements }),

      // Acciones para filtros guardados
      saveCurrentFilter: (name) => {
        const { savedFilters, searchTerm, categoryFilter, stockFilter, sortBy, sortDirection, minPrice, maxPrice } = get();

        const newFilter: FilterPreset = {
          id: Date.now().toString(),
          name,
          searchTerm,
          categoryFilter,
          stockFilter,
          sortBy,
          sortDirection,
          minPrice,
          maxPrice
        };

        set({ savedFilters: [...savedFilters, newFilter] });
      },

      loadSavedFilter: (id) => {
        const { savedFilters } = get();
        const filterToLoad = savedFilters.find(filter => filter.id === id);

        if (filterToLoad) {
          const { searchTerm, categoryFilter, stockFilter, sortBy, sortDirection, minPrice, maxPrice } = filterToLoad;
          set({
            searchTerm,
            categoryFilter,
            stockFilter,
            sortBy,
            sortDirection,
            minPrice,
            maxPrice
          });
        }
      },

      deleteSavedFilter: (id) => {
        const { savedFilters } = get();
        set({ savedFilters: savedFilters.filter(filter => filter.id !== id) });
      },

      // Acción para ordenar
      handleSort: (field) => {
        const { sortBy, sortDirection } = get();
        if (sortBy === field) {
          set({ sortDirection: sortDirection === "asc" ? "desc" : "asc" });
        } else {
          set({ sortBy: field, sortDirection: "asc" });
        }
      },

      // Acciones para movimientos
      setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
      setIsMovementDialogOpen: (isMovementDialogOpen) => set({ isMovementDialogOpen }),
      setMovementType: (movementType) => set({ movementType }),
      setMovementQuantity: (movementQuantity) => set({ movementQuantity }),
      setMovementReason: (movementReason) => set({ movementReason }),
      setIsCreatingMovement: (isCreatingMovement) => set({ isCreatingMovement }),

      // Acciones para diálogos
      setDialogTitle: (dialogTitle) => set({ dialogTitle }),
      setDialogDescription: (dialogDescription) => set({ dialogDescription }),

      // Acciones para añadir productos
      setIsAddProductDialogOpen: (isAddProductDialogOpen) => set({ isAddProductDialogOpen }),
      setNewProduct: (newProductData) => set(state => ({
        newProduct: { ...state.newProduct, ...newProductData }
      })),
      resetNewProductForm: () => set({
        newProduct: {
          name: "",
          category: "",
          minimumStock: 0,
          stock: 0,
          entryDate: new Date().toISOString().split('T')[0],
          exitDate: "",
          price: 0
        }
      }),

      // Acciones para estados de carga y error
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Función para cargar productos
      fetchProducts: async (userId: string) => {
        const store = get();

        // Actualizar estados
        set({ isLoading: true, error: null });

        try {
          // Obtener productos del servicio
          const response = await productService.getProducts(1, 1000, userId);

          // Procesar y normalizar la respuesta
          const products = processProductsResponse(response);

          // Actualizar el store con los productos procesados
          set({ products });

          return products;
        } catch (err: any) {
          console.error("Error al cargar productos:", err);
          const errorMessage = err.message || 'Error al cargar los productos';
          set({ error: errorMessage });

          // Intentar usar caché si no hay productos
          const cachedData = apiCache.get<Product[]>('/products', { userId, page: 1, limit: 1000 }, { staleWhileRevalidate: true });
          if (cachedData && Array.isArray(cachedData) && store.products.length === 0) {
            const normalizedCache = processProductsResponse(cachedData);
            set({ products: normalizedCache });
          }

          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // Función para cargar movimientos
      fetchStockMovements: async (userId: string) => {
        const store = get();
        set({ isLoading: true, error: null });

        try {
          // Obtener movimientos del servicio
          const response = await inventoryService.getInventoryMovements(userId);

          // Actualizar el store con los movimientos
          set({ stockMovements: response });

          return response;
        } catch (err: any) {
          console.error("Error al cargar movimientos:", err);
          const errorMessage = err.message || 'Error al cargar los movimientos';
          set({ error: errorMessage });

          // Intentar usar caché si no hay movimientos
          const cachedData = apiCache.get('/movements', { userId }, { staleWhileRevalidate: true });
          if (cachedData && Array.isArray(cachedData) && store.stockMovements.length === 0) {
            set({ stockMovements: cachedData });
          }

          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // Función para abrir el diálogo de movimientos
      openMovementDialog: (product, type) => {
        let correctedProduct = { ...product };

        // Validar el ID del producto
        if (product._id && isValidProductId(product._id)) {
          correctedProduct.id = product._id;
        } else if (!isValidProductId(product.id)) {
          console.error("ID de producto inválido:", product.id);
          return;
        }

        // Actualizamos también el título y descripción del diálogo
        let dialogTitle = type === "entrada"
          ? "Registrar entrada de productos"
          : "Registrar salida de productos";

        let dialogDescription = type === "entrada"
          ? "Ingrese la cantidad de productos que entrarán al inventario."
          : "Ingrese la cantidad de productos que saldrán del inventario.";

        set({
          selectedProduct: correctedProduct,
          movementType: type,
          movementQuantity: 1,
          movementReason: "",
          isMovementDialogOpen: true,
          dialogTitle,
          dialogDescription
        });
      },

      // Función para resetear el formulario de movimientos
      resetMovementForm: () => set({
        selectedProduct: null,
        movementQuantity: 1,
        movementReason: "",
        isMovementDialogOpen: false
      }),

      // Función para procesar un movimiento
      handleStockMovement: async (userId: string, userName?: string) => {
        const state = get();
        console.log("handleStockMovement ejecutado con:", { userId, userName, selectedProduct: state.selectedProduct });

        if (!state.selectedProduct) {
            console.warn("No hay producto seleccionado para movimiento.");
            return;
        }

        set({ isCreatingMovement: true });
        console.log("Iniciando movimiento de stock...");

        try {
            const movementType = state.movementType === 'entrada' ? 'entrada' : 'salida';

            console.log("Tipo de movimiento determinado:", movementType);

            // Usar las utilidades para preparar y validar el movimiento
            const movementData = prepareMovementData({
                product: state.selectedProduct,
                quantity: state.movementQuantity,
                movementType: movementType,
                reason: state.movementReason,
                userId,
                userName
            });

            console.log("Datos del movimiento preparados:", movementData);

            // Usar el inventoryService para crear el movimiento
            const response = await inventoryService.createInventoryMovement({
                productId: movementData.productId,
                quantity: movementData.quantity,
                movementType: movementData.type,
                reason: movementData.reason,
                userId: userId,
                date: new Date().toISOString(),
                resultingBalance: state.selectedProduct.stock + (movementType === 'entrada' ? movementData.quantity : -movementData.quantity)
            });

            console.log("Respuesta del backend:", response);

            // Actualizar el producto con el nuevo stock
            const updatedProduct = updateProductStock(
                state.selectedProduct,
                movementType,
                state.movementQuantity
            );

            console.log("Producto actualizado con nuevo stock:", updatedProduct);

            // Actualizar la lista de productos y movimientos
            set((currentState) => {
                console.log("Actualizando productos y stockMovements en el estado...");
                const currentMovements = Array.isArray(currentState.stockMovements) ? currentState.stockMovements : [];
                return {
                    products: updateProductList(currentState.products, updatedProduct),
                    stockMovements: [{ ...movementData, ...response }, ...currentMovements]
                };
            });

            // Recargar los productos para asegurar sincronización con el backend
            await get().fetchProducts(userId);

            console.log("Movimiento procesado exitosamente.");
            return response;
        } catch (error: any) {
            console.error("Error al procesar movimiento:", error);
            throw error;
        } finally {
            set({ isCreatingMovement: false });
            console.log("Finalizando handleStockMovement.");
        }
    },
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({
        savedFilters: state.savedFilters,
        products: state.products,
        stockMovements: state.stockMovements,
        selectedProduct: state.selectedProduct,
        movementType: state.movementType,
        movementQuantity: state.movementQuantity,
        movementReason: state.movementReason,
        isMovementDialogOpen: state.isMovementDialogOpen,
        dialogTitle: state.dialogTitle,
        dialogDescription: state.dialogDescription
      }),
    }
  )
);
