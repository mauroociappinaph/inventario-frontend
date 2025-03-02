import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  isLoading: (key?: string) => boolean;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  resetAllLoadingStates: () => void;
  checkAndCorrectLoadingState: () => void;
  loadingState: LoadingState;
}

// Clave para carga global
const GLOBAL_LOADING_KEY = 'global';

// Crear contexto con valores por defecto
const LoadingContext = createContext<LoadingContextType>({
  isLoading: () => false,
  startLoading: () => {},
  stopLoading: () => {},
  resetAllLoadingStates: () => {},
  checkAndCorrectLoadingState: () => {},
  loadingState: {},
});

// Hook personalizado para usar el contexto
export const useLoading = () => useContext(LoadingContext);

// Proveedor del contexto
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    [GLOBAL_LOADING_KEY]: false,
  });

  // Cuando el componente se monta, asegurarse de que todos los estados de carga estén reseteados
  useEffect(() => {
    // Resetear al montar el componente
    setLoadingState({ [GLOBAL_LOADING_KEY]: false });

    // Función de limpieza para asegurarse de que loading states se resetean al desmontar el componente
    return () => {
      setLoadingState({ [GLOBAL_LOADING_KEY]: false });
    };
  }, []);

  // Verificar si una clave específica o global está cargando
  const isLoading = useCallback((key: string = GLOBAL_LOADING_KEY): boolean => {
    return loadingState[key] === true;
  }, [loadingState]);

  // Iniciar carga para una clave
  const startLoading = useCallback((key: string = GLOBAL_LOADING_KEY) => {
    setLoadingState(prevState => ({
      ...prevState,
      [key]: true,
    }));
  }, []);

  // Detener carga para una clave
  const stopLoading = useCallback((key: string = GLOBAL_LOADING_KEY) => {
    setLoadingState(prevState => ({
      ...prevState,
      [key]: false,
    }));
  }, []);

  // Nueva función para resetear todos los estados de carga
  const resetAllLoadingStates = useCallback(() => {
    setLoadingState({ [GLOBAL_LOADING_KEY]: false });
  }, []);

  // Nueva función para comprobar y corregir el estado de carga
  const checkAndCorrectLoadingState = useCallback(() => {
    // Verificar si ha pasado mucho tiempo con el estado de carga activo
    if (isLoading()) {
      // En la página de tablero, forzar reset
      console.warn('Estado de carga detectado al iniciar. Reseteando estado.');
      resetAllLoadingStates();
    }
  }, [isLoading, resetAllLoadingStates]);

  // Comprobar automáticamente el estado al montar el componente
  useEffect(() => {
    checkAndCorrectLoadingState();

    // Función de seguridad que comprueba periódicamente el estado
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && isLoading()) {
        const loadingTime = localStorage.getItem('loadingStartTime');
        if (loadingTime) {
          const startTime = parseInt(loadingTime, 10);
          const currentTime = Date.now();
          // Si ha estado cargando por más de 10 segundos sin cambios
          if (currentTime - startTime > 10000) {
            console.warn('Carga detectada por más de 10 segundos. Reseteando estado.');
            resetAllLoadingStates();
            localStorage.removeItem('loadingStartTime');
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkAndCorrectLoadingState, isLoading, resetAllLoadingStates]);

  // Guardar tiempo de inicio de carga
  useEffect(() => {
    if (isLoading()) {
      if (!localStorage.getItem('loadingStartTime')) {
        localStorage.setItem('loadingStartTime', Date.now().toString());
      }
    } else {
      localStorage.removeItem('loadingStartTime');
    }
  }, [loadingState, isLoading]);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      startLoading,
      stopLoading,
      resetAllLoadingStates,
      checkAndCorrectLoadingState,
      loadingState
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook para ejecutar funciones asíncronas con estado de carga
export const useAsyncAction = () => {
  const { startLoading, stopLoading } = useLoading();

  const executeWithLoading = useCallback(
    async <T,>(
      asyncAction: () => Promise<T>,
      loadingKey: string = GLOBAL_LOADING_KEY
    ): Promise<T> => {
      try {
        startLoading(loadingKey);
        const result = await asyncAction();
        return result;
      } catch (error) {
        console.error("Error en acción asíncrona:", error);
        throw error;
      } finally {
        stopLoading(loadingKey);
      }
    },
    [startLoading, stopLoading]
  );

  return { executeWithLoading };
};

export default useLoading;
