import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useErrorStore } from '@/stores/errorStore';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  source?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Tipo para la función fallback
type FallbackFunction = (error: Error, resetError: () => void) => ReactNode;

/**
 * Componente que captura errores durante el renderizado en su árbol de componentes hijos
 * y muestra una UI de fallback en lugar de crashear toda la aplicación.
 */
class ErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registrar el error en el store global
    const errorStore = useErrorStore.getState();
    const errorSource = this.props.source || 'ErrorBoundary';
    errorStore.addError({
      message: error.message,
      details: errorInfo.componentStack,
      source: errorSource,
      severity: 'error',
    });

    // Pasar el error al callback si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Siempre logueamos a la consola para desarrollo
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Renderizar el fallback personalizado o el predeterminado
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          // TypeScript no puede inferir esto correctamente, así que usamos una aserción
          const fallbackFn = this.props.fallback as FallbackFunction;
          return fallbackFn(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }

      // Fallback predeterminado
      return (
        <div className="p-6 rounded-lg border border-destructive/50 bg-destructive/10 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Algo ha salido mal
          </h2>
          <p className="text-destructive/80 mb-4">
            {this.state.error.message || 'Se ha producido un error inesperado.'}
          </p>
          <Button
            variant="outline"
            onClick={this.resetError}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Intentar de nuevo
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC para crear componentes con ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundaryComponent {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryComponent>
  );

  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

export default ErrorBoundaryComponent;
