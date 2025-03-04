import { productService } from '@/lib/api/api';
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
      movementType: 'entry',
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
        let dialogTitle = "Movimiento de inventario";
        let dialogDescription = "Complete los campos para registrar el movimiento.";

        if (type === "entry") {
          dialogTitle = "Agregar productos al inventario";
          dialogDescription = "Complete los campos para registrar la entrada de productos.";
        } else {
          dialogTitle = "Registrar consumo de inventario";
          dialogDescription = "Complete los campos para registrar el consumo de productos.";
        }

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
        if (!state.selectedProduct) return;

        set({ isCreatingMovement: true });

        try {
          // Asegurarnos de que movementType sea solo 'entry' o 'exit'
          const movementType = state.movementType === 'adjustment'
            ? 'entry'
            : state.movementType as 'entry' | 'exit';

          // Usar las utilidades para preparar y validar el movimiento
          const movementData = prepareMovementData({
            product: state.selectedProduct,
            quantity: state.movementQuantity,
            movementType: movementType,
            reason: state.movementReason,
            userId,
            userName
          });

          // Aquí iría la lógica para enviar el movimiento al backend
          // Ejemplo:
          // const response = await inventoryService.createMovement(movementData);

          // Cerrar el diálogo después del movimiento
          set({ isMovementDialogOpen: false });

          // Actualizar el producto con el nuevo stock
          const updatedProduct = updateProductStock(
            state.selectedProduct,
            movementType,
            state.movementQuantity
          );

          // Actualizar la lista de productos y movimientos
          set((currentState) => ({
            products: updateProductList(currentState.products, updatedProduct),
            // Agregar el movimiento al historial
            stockMovements: [movementData, ...currentState.stockMovements]
          }));
        } catch (error: any) {
          console.error("Error al procesar movimiento:", error);
          throw error;
        } finally {
          set({ isCreatingMovement: false });
        }
      },
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({
        savedFilters: state.savedFilters,
        // Solo persistimos los filtros guardados, no los datos de productos
      }),
    }
  )
);
