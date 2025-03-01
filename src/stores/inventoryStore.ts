import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category, Supplier, InventoryMovement, InventoryState } from './inventoryTypes';

// Datos de ejemplo
const mockProducts: Product[] = [
  // ... (datos de ejemplo)
  {
    id: '1',
    name: 'Producto 1',
    category: 'Categoría 1',
    price: 100,
    stock: 10,
    minStock: 5,
    supplier: 'Proveedor 1',
    lastUpdated: '2024-01-01'
  }
];

const mockCategories: Category[] = [
  // ... (datos de ejemplo)
  {
    id: '1',
    name: 'Categoría 1',
    description: 'Descripción de la categoría 1',
    productCount: 10
  }
];

const mockSuppliers: Supplier[] = [
  // ... (datos de ejemplo)
  {
    id: '1',
    name: 'Proveedor 1',
    contact: 'Contacto 1',
    email: 'proveedor1@example.com',
    phone: '1234567890'
  }
];

const mockMovements: InventoryMovement[] = [
  // ... (datos de ejemplo)
  {
    id: '1',
    productId: '1',
    productName: 'Producto 1',
    type: 'entrada',
    quantity: 10,
    date: '2024-01-01',
    userId: '1',
    userName: 'Usuario 1',
    notes: 'Nota de ejemplo'
  }
];

// Tipo que mapea las claves de colecciones a sus tipos de elemento
type CollectionKeyToType = {
  products: Product;
  categories: Category;
  suppliers: Supplier;
  movements: InventoryMovement;
};

// Función genérica para crear acciones
const createAction = <K extends keyof CollectionKeyToType>(
  set: (updater: (state: InventoryState) => InventoryState) => void,
  stateKey: K
) => {
  type ItemType = CollectionKeyToType[K];

  return {
    add: (item: ItemType) => {
      console.log(`Dispatching action: ADD_${stateKey.toUpperCase()}`);
      set((state) => ({
        ...state,
        [stateKey]: [...state[stateKey], item]
      }));
    },
    update: (id: string, updates: Partial<ItemType>) => {
      console.log(`Dispatching action: UPDATE_${stateKey.toUpperCase()}`);
      set((state) => ({
        ...state,
        [stateKey]: state[stateKey].map((item) => {
          if ('id' in item && item.id === id) {
            return { ...item, ...updates } as ItemType;
          }
          return item;
        })
      }));
    },
    delete: (id: string) => {
      console.log(`Dispatching action: DELETE_${stateKey.toUpperCase()}`);
      set((state) => ({
        ...state,
        [stateKey]: state[stateKey].filter((item) => 'id' in item && item.id !== id)
      }));
    }
  };
};

// Crear store
export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      // Estado inicial
      products: [],
      categories: [],
      suppliers: [],
      movements: [],
      isLoading: false,
      error: null,
      selectedProductId: null,
      selectedCategoryId: null,
      selectedSupplierId: null,
      filters: {
        search: '',
        category: null,
        supplier: null,
        stockStatus: 'todos'
      },

      // Acciones - Productos
      setProducts: (products: Product[]) => set({ products }),
      addProduct: createAction(set, 'products').add,
      updateProduct: createAction(set, 'products').update,
      deleteProduct: createAction(set, 'products').delete,
      setSelectedProductId: (id: string | null) => set({ selectedProductId: id }),

      // Acciones - Categorías
      setCategories: (categories: Category[]) => set({ categories }),
      addCategory: createAction(set, 'categories').add,
      updateCategory: createAction(set, 'categories').update,
      deleteCategory: createAction(set, 'categories').delete,
      setSelectedCategoryId: (id: string | null) => set({ selectedCategoryId: id }),

      // Acciones - Proveedores
      setSuppliers: (suppliers: Supplier[]) => set({ suppliers }),
      addSupplier: createAction(set, 'suppliers').add,
      updateSupplier: createAction(set, 'suppliers').update,
      deleteSupplier: createAction(set, 'suppliers').delete,
      setSelectedSupplierId: (id: string | null) => set({ selectedSupplierId: id }),

      // Acciones - Movimientos
      setMovements: (movements: InventoryMovement[]) => set({ movements }),
      addMovement: createAction(set, 'movements').add,

      // Acciones - Estado general
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      setFilters: (filters: Partial<InventoryState['filters']>) =>
        set((state) => ({ ...state, filters: { ...state.filters, ...filters } })),
      resetFilters: () =>
        set({ filters: { search: '', category: null, supplier: null, stockStatus: 'todos' } }),

      // Acciones - Cargar datos
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 800));
        set({ products: mockProducts, isLoading: false });
      },
      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 600));
        set({ categories: mockCategories, isLoading: false });
      },
      fetchSuppliers: async () => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 700));
        set({ suppliers: mockSuppliers, isLoading: false });
      },
      fetchMovements: async () => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ movements: mockMovements, isLoading: false });
      }
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        suppliers: state.suppliers,
        filters: state.filters
      })
    }
  )
);
