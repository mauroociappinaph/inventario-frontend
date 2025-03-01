import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  isLoading: (key?: string) => boolean;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  loadingState: LoadingState;
}

// Clave para carga global
const GLOBAL_LOADING_KEY = 'global';

// Crear contexto con valores por defecto
const LoadingContext = createContext<LoadingContextType>({
  isLoading: () => false,
  startLoading: () => {},
  stopLoading: () => {},
  loadingState: {},
});

// Hook personalizado para usar el contexto
export const useLoading = () => useContext(LoadingContext);

// Proveedor del contexto
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    [GLOBAL_LOADING_KEY]: false,
  });

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

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, loadingState }}>
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
      } finally {
        stopLoading(loadingKey);
      }
    },
    [startLoading, stopLoading]
  );

  return { executeWithLoading };
};

export default useLoading;
