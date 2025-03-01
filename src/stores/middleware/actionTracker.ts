// Tipo para almacenar el historial de acciones
export interface ActionLog {
  type: string;
  timestamp: number;
  payload?: unknown;
}

// Función para rastrear acciones (más simple que un middleware completo)
let actionHistory: ActionLog[] = [];
let lastAction: ActionLog | null = null;

/**
 * Rastreador de acciones simple que registra las acciones en consola
 * y mantiene un historial en memoria
 */
export const trackAction = (type: string, payload?: unknown) => {
  const action: ActionLog = {
    type,
    timestamp: Date.now(),
    payload
  };

  // Registrar en consola
  console.log(`[Action]: ${type}`, payload ? payload : '');

  // Guardar en el historial
  actionHistory.push(action);
  lastAction = action;

  return action;
};

// Método para limpiar el historial
export const clearActionHistory = () => {
  actionHistory = [];
  lastAction = null;
};

// Obtener el historial actual
export const getActionHistory = () => [...actionHistory];

// Obtener la última acción
export const getLastAction = () => lastAction;
