export interface Product {

   id: string
  _id?: string // ID original del backend
  name: string
  price: number
  category: string
  stock: number
  minStock: number
  lastUpdated: string
  entryDate?: string
  exitDate?: string
  lastStockUpdate: string
  userId?: string // ID del usuario propietario del producto (opcional)

}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "entrada" | "salida"
  quantity: number
  reason: string
  date: string
  user: string
}

export interface FilterPreset {
  id: string;
  name: string;
  searchTerm: string;
  categoryFilter: string;
  stockFilter: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  minPrice: number;
  maxPrice: number;
}

export interface InventoryState {
  // Datos
  products: Product[];
  stockMovements: StockMovement[];

  // Estados de carga y error
  isLoading: boolean;
  error: string | null;

  // Filtros
  searchTerm: string;
  categoryFilter: string;
  stockFilter: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  minPrice: number;
  maxPrice: number;

  // Filtros guardados
  savedFilters: FilterPreset[];

  // Movimientos
  selectedProduct: Product | null;
  isMovementDialogOpen: boolean;
  movementType: "entrada" | "salida"
  movementQuantity: number;
  movementReason: string;
  isCreatingMovement: boolean;

  // Estados del diálogo
  dialogTitle: string;
  dialogDescription: string;

  // Estados para añadir productos
  isAddProductDialogOpen: boolean;
  newProduct: {
    name: string;
    category: string;
    minimumStock: number;
    stock: number;
    entryDate: string;
    exitDate: string;
    price: number;
  };

  // Estadísticas computadas
  getStatistics: () => {
    totalProducts: number;
    lowStockProducts: number;
    totalStock: number;
    criticalStockPercentage: number;
  };

  // Categorías y productos filtrados
  getCategories: () => string[];
  getFilteredProducts: () => Product[];

  // Acciones
  setProducts: (products: Product[]) => void;
  setStockMovements: (movements: StockMovement[]) => void;

  // Acciones para filtros
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (category: string) => void;
  setStockFilter: (filter: string) => void;
  setSortBy: (field: string) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  setMinPrice: (price: number) => void;
  setMaxPrice: (price: number) => void;
  resetPriceFilter: () => void;
  resetAllFilters: () => void;
  handleSort: (field: string) => void;

  // Acciones para filtros guardados
  saveCurrentFilter: (name: string) => void;
  loadSavedFilter: (id: string) => void;
  deleteSavedFilter: (id: string) => void;

  // Acciones para movimientos
  setSelectedProduct: (product: Product | null) => void;
  setIsMovementDialogOpen: (isOpen: boolean) => void;
  setMovementType: (type: "entrada" | "salida") => void;
  setMovementQuantity: (quantity: number) => void;
  setMovementReason: (reason: string) => void;
  setIsCreatingMovement: (isCreating: boolean) => void;

  // Acciones para diálogos
  setDialogTitle: (title: string) => void;
  setDialogDescription: (description: string) => void;

  // Acciones para añadir productos
  setIsAddProductDialogOpen: (isOpen: boolean) => void;
  setNewProduct: (product: Partial<InventoryState['newProduct']>) => void;
  resetNewProductForm: () => void;

  // Acciones para estados de carga y error
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Funciones principales
  fetchProducts: (userId: string) => Promise<Product[]>;
  fetchStockMovements: (userId: string) => Promise<StockMovement[]>;
  openMovementDialog: (product: Product, type: "entrada" | "salida") => void;
  handleStockMovement: (userId: string, userName: string) => Promise<void>;
  resetMovementForm: () => void;
}



// Interfaces para tipado de estadísticas
export interface ProductStatistics {
  productId: string;
  productName: string;
  currentStock: number;
  averageConsumption: number;
  daysUntilReorder: number;
}

export interface MovementTrend {
  current: number;
  previous: number;
  percentChange: number;
}

export interface SalesForecast {
  thisMonth: number;
  nextMonth: number;
}

export interface InventoryPredictions {
  upcomingReorders: ProductStatistics[];
  salesForecast: SalesForecast;
}

export interface InventoryTrends {
  totalMovements: MovementTrend;
  entries: MovementTrend;
  exits: MovementTrend;
}

export interface InventoryStatistics {
  totalProducts: number;
  activeProducts?: number;
  lowStockCount: number;
  totalStock: number;
  averagePrice?: number;
  stockHealth: string;
  trends?: InventoryTrends;
  predictions?: InventoryPredictions;
  roi?: {
    avgRoi: number;
    topRoiProducts?: any[];
  };
  isFromApi: boolean;
}

export interface InventoryApiStats {
  [key: string]: any;
  trends?: {
    [key: string]: any;
  };
  movements?: {
    [key: string]: any;
  };
  general?: {
    [key: string]: any;
  };
}

export interface Filters {
  search: string;
  category: string;
  stockStatus: string;
}
