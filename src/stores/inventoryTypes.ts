// Tipos para el inventario
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  supplier: string;
  lastUpdated: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  date: string;
  userId: string;
  userName: string;
  notes?: string;
}

// Interfaz base para elementos con un id
export interface WithId {
  id: string;
}

export interface InventoryState {
  // Estado
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  movements: InventoryMovement[];
  isLoading: boolean;
  error: string | null;
  selectedProductId: string | null;
  selectedCategoryId: string | null;
  selectedSupplierId: string | null;
  filters: {
    search: string;
    category: string | null;
    supplier: string | null;
    stockStatus: 'todos' | 'bajo' | 'normal' | 'exceso';
  };

  // Acciones - Productos
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSelectedProductId: (id: string | null) => void;

  // Acciones - Categorías
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setSelectedCategoryId: (id: string | null) => void;

  // Acciones - Proveedores
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  setSelectedSupplierId: (id: string | null) => void;

  // Acciones - Movimientos
  setMovements: (movements: InventoryMovement[]) => void;
  addMovement: (movement: InventoryMovement) => void;

  // Acciones - Estado general
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<InventoryState['filters']>) => void;
  resetFilters: () => void;

  // Acciones - Cargar datos
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  fetchMovements: () => Promise<void>;
}
