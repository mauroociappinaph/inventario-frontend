// Re-exportar todos los stores y sus tipos para facilitar importaciones

// Exportar action types
export {
  UI_ACTIONS,
  ERROR_ACTIONS,
  INVENTORY_ACTIONS,
  type UIActionType,
  type ErrorActionType,
  type InventoryActionType,
  type ActionType
} from './actionTypes';

// Exportar action tracker
export {
  trackAction,
  clearActionHistory,
  getActionHistory,
  getLastAction,
  type ActionLog
} from './middleware/actionTracker';

// UI Store
export {
  useUIStore,
  type SidebarVariant,
  type SidebarItem,
  type SidebarSection,
} from './uiStore';

// Inventory Store
export {
  type Product,
  type Category,
  type Supplier,
  type InventoryMovement,
} from './inventoryStore';

// Error Store
export {
  useErrorStore,
  useErrorActions,
  useErrorState,
  type ErrorSeverity,
  type AppError,
} from './errorStore';
