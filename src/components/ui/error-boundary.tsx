'use client';

import React, { Component, ErrorInfo, PropsWithChildren } from 'react';
import { ErrorMessage } from './error-message';
import { Button } from './button';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);

    // Llamar al callback onError si está definido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Si se ha proporcionado un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto
      return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <ErrorMessage
            title="Ha ocurrido un error"
            message={this.state.error?.message || 'Se produjo un error inesperado.'}
            severity="error"
          />
          <div className="mt-4">
            <Button
              onClick={this.resetError}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar en componentes funcionales
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
