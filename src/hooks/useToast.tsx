import { useState } from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
  duration?: number;
}

// Sistema de notificaciones toast simplificado
export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...props, id };

    setToasts(current => [...current, newToast]);

    // Auto-dismiss after duration
    const duration = props.duration || 5000;
    setTimeout(() => {
      dismiss(id);
    }, duration);

    return id;
  };

  const dismiss = (id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    toast,
    dismiss
  };
}

// Componente de toast que se puede usar en la aplicación
export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`rounded-md p-4 shadow-md ${
            toast.variant === 'success' ? 'bg-green-100 border-l-4 border-green-500' :
            toast.variant === 'destructive' ? 'bg-red-100 border-l-4 border-red-500' :
            toast.variant === 'warning' ? 'bg-amber-100 border-l-4 border-amber-500' :
            'bg-gray-100 border-l-4 border-gray-500'
          } max-w-sm`}
        >
          <div className="flex justify-between">
            <div className="flex-1">
              <h3 className={`font-medium ${
                toast.variant === 'success' ? 'text-green-800' :
                toast.variant === 'destructive' ? 'text-red-800' :
                toast.variant === 'warning' ? 'text-amber-800' :
                'text-gray-800'
              }`}>
                {toast.title}
              </h3>
              {toast.description && (
                <p className={`text-sm mt-1 ${
                  toast.variant === 'success' ? 'text-green-600' :
                  toast.variant === 'destructive' ? 'text-red-600' :
                  toast.variant === 'warning' ? 'text-amber-600' :
                  'text-gray-600'
                }`}>
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
