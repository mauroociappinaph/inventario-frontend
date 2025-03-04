import { productService } from '@/lib/api/api';
import { FilterPreset, InventoryState, Product } from '@/types/inventory.interfaces';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      // Datos iniciales
      products: [],
      stockMovements: [],
      // Estado inicial de filtros
      searchTerm: "",
      categoryFilter: "all",
      stockFilter: "all",
      sortBy: "name",
      sortDirection: "asc",
      minPrice: 0,
      maxPrice: 999999,

      // Filtros guardados
      savedFilters: [],

      // Estado inicial para movimientos
      selectedProduct: null,
      isMovementDialogOpen: false,
      movementType: "exit",
      movementQuantity: 1,
      movementReason: "",
      isCreatingMovement: false,

      // Estado inicial para diálogos
      dialogTitle: "Movimiento de inventario",
      dialogDescription: "Complete los campos para registrar el movimiento.",

      // Estado inicial para añadir productos
      isAddProductDialogOpen: false,
      newProduct: {
        name: "",
        category: "",
        minimumStock: 0,
        stock: 0,
        entryDate: new Date().toISOString().split('T')[0],
        exitDate: "",
        price: 0
      },

      // Obtener estadísticas calculadas
      getStatistics: () => {
        const { products } = get();
        // Verificar que products es un array
        const productsArray = Array.isArray(products) ? products : [];

        return {
          totalProducts: productsArray.length,
          lowStockProducts: productsArray.filter(p => p.stock <= p.minStock).length,
          totalStock: productsArray.reduce((sum, p) => sum + p.stock, 0),
          criticalStockPercentage: productsArray.length > 0
            ? (productsArray.filter(p => p.stock <= p.minStock).length / productsArray.length) * 100
            : 0
        };
      },

      // Obtener categorías únicas
      getCategories: () => {
        const { products } = get();
        // Verificar que products es un array
        const productsArray = Array.isArray(products) ? products : [];
        return Array.from(new Set(productsArray.map(p => p.category)));
      },

      // Obtener productos filtrados
      getFilteredProducts: () => {
        const { products, searchTerm, categoryFilter, stockFilter, sortBy, sortDirection, minPrice, maxPrice } = get();

        // Verificar que products es un array
        const productsArray = Array.isArray(products) ? products : [];

        if (productsArray.length === 0) {
          return [];
        }

        try {
          return productsArray
            .filter(product => {
              if (!product) return false;

              const matchesSearch = product.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '') || false;
              const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

              let matchesStock = stockFilter === "all";
              if (stockFilter === "low" && typeof product.stock === 'number' && typeof product.minStock === 'number') {
                matchesStock = product.stock <= product.minStock;
              } else if (stockFilter === "normal" && typeof product.stock === 'number' && typeof product.minStock === 'number') {
                matchesStock = product.stock > product.minStock;
              }

              const price = typeof product.price === 'number' ? product.price : 0;
              const matchesPrice = price >= minPrice && price <= maxPrice;

              return matchesSearch && matchesCategory && matchesStock && matchesPrice;
            })
            .sort((a, b) => {
              if (!a || !b || !sortBy) return 0;

              // Verificar que las propiedades existen
              const aHasKey = sortBy in a;
              const bHasKey = sortBy in b;

              if (!aHasKey || !bHasKey) return 0;

              let aValue: any = a[sortBy as keyof Product];
              let bValue: any = b[sortBy as keyof Product];

              // Manejar valores nulos o indefinidos
              if (aValue === undefined || aValue === null) aValue = '';
              if (bValue === undefined || bValue === null) bValue = '';

              if (typeof aValue === 'string') aValue = aValue.toLowerCase();
              if (typeof bValue === 'string') bValue = bValue.toLowerCase();

              if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
              if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
              return 0;
            });
        } catch (error) {
          console.error("Error al filtrar productos:", error);
          return [];
        }
      },

      // Acciones para actualizar el estado
      setProducts: (products) => set({ products }),
      setStockMovements: (stockMovements) => set({ stockMovements }),

      // Acciones para filtros
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      setStockFilter: (stockFilter) => set({ stockFilter }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
      setMinPrice: (minPrice) => set({ minPrice }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      resetPriceFilter: () => set({ minPrice: 0, maxPrice: 999999 }),
      resetAllFilters: () => set({
        searchTerm: "",
        categoryFilter: "all",
        stockFilter: "all",
        minPrice: 0,
        maxPrice: 999999
      }),

      // Acciones para filtros guardados
      saveCurrentFilter: (name) => {
        const { searchTerm, categoryFilter, stockFilter, sortBy, sortDirection, minPrice, maxPrice, savedFilters } = get();

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

      // Función para cargar productos
      fetchProducts: async (userId) => {
        try {
          const response = await productService.getProducts(1, 100, userId);
          if (response.data && Array.isArray(response.data.products)) {
            const transformedProducts = response.data.products.map((product: any) => {
              let productId = product._id || product.id;

              if (product._id && !product.id) {
                productId = product._id;
              }

              if (typeof productId !== 'string') {
                productId = String(productId);
              }

              return {
                ...product,
                id: productId,
              };
            });

            set({ products: transformedProducts });
          } else {
            set({ products: [] });
          }
        } catch (error) {
          console.error("Error al obtener productos:", error);
          // Aquí se podría gestionar el error de forma global
        }
      },

      // Función para abrir el diálogo de movimientos
      openMovementDialog: (product, type) => {
        let correctedProduct = { ...product };

        if (product._id && /^[0-9a-fA-F]{24}$/.test(product._id)) {
          correctedProduct.id = product._id;
        } else if (!/^[0-9a-fA-F]{24}$/.test(product.id)) {
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
      handleStockMovement: async (userId, userName) => {
        const state = get();
        if (!state.selectedProduct) return;

        set({ isCreatingMovement: true });

        try {
          const productId = state.selectedProduct._id || state.selectedProduct.id;

          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);

          if (!isValidObjectId) {
            throw new Error("ID de producto inválido");
          }

          if (state.movementType === "exit" && state.movementQuantity > state.selectedProduct.stock) {
            throw new Error("Stock insuficiente");
          }

          const movementData = {
            productId: productId,
            productName: state.selectedProduct.name,
            quantity: state.movementQuantity,
            movementType: state.movementType === "entry" ? "in" : "out",
            type: state.movementType,
            movementDate: new Date().toISOString(),
            date: new Date().toISOString(),
            userId: userId,
            userName: userName || "Usuario",
            notes: state.movementReason,
            reason: state.movementReason,
            user: userName || "Usuario"
          };

          // Aquí iría la lógica para enviar el movimiento al backend
          // Ejemplo:
          // const response = await inventoryService.createMovement(movementData);

          // Actualizar estados después del movimiento
          set({ isMovementDialogOpen: false });

          // Recargar productos para reflejar el cambio
          // Este es un enfoque simulado - en producción debería obtenerse del backend
          set(state => ({
            products: state.products.map(p => {
              if (p.id === state.selectedProduct?.id) {
                return {
                  ...p,
                  stock: state.movementType === "entry"
                    ? p.stock + state.movementQuantity
                    : p.stock - state.movementQuantity
                }
              }
              return p;
            }),
            // También agregamos el movimiento al historial
            stockMovements: [{
              ...movementData,
              id: Date.now().toString()
            }, ...state.stockMovements]
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
