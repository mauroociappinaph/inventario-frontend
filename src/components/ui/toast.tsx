"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

// Definimos los tipos de toast
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        success: "border-green-200 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        error: "border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
        info: "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Mapa de iconos para cada variante
const iconMap = {
  default: <Bell className="h-5 w-5" />,
  info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
};

// Interface para las props del Toast
export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  onClose?: () => void
  duration?: number
  open?: boolean
  icon?: React.ReactNode
}

// Contexto para el sistema de Toast
type ToastContextType = {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'open'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, toast: Partial<ToastProps>) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider')
  }
  return context
}

// Generador de IDs únicos
const generateId = () => `toast-${Math.random().toString(36).substring(2, 9)}`

export type ToastProviderProps = {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'open'>) => {
    const id = generateId()
    const duration = toast.duration || 5000

    setToasts((prevToasts) => [
      ...prevToasts,
      { ...toast, id, open: true },
    ])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) =>
      prevToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  const updateToast = React.useCallback((id: string, toast: Partial<ToastProps>) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    )
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

// Componente Toast
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', title, description, action, onClose, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon || iconMap[variant as keyof typeof iconMap]}
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
        </div>
        {action && <ToastAction>{action}</ToastAction>}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = 'Toast'

// Componente ToastViewport (contenedor para los toasts)
export const ToastViewport: React.FC = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
          action={toast.action}
          onClose={() => removeToast(toast.id)}
          className="mb-2 transform-gpu animate-in fade-in-0 slide-in-from-right-8"
          icon={toast.icon}
        />
      ))}
    </div>
  )
}

// Subcomponentes
export const ToastTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-medium text-sm', className)}
    {...props}
  />
))
ToastTitle.displayName = 'ToastTitle'

export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = 'ToastDescription'

export const ToastAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex shrink-0 items-center justify-center', className)}
    {...props}
  />
))
ToastAction.displayName = 'ToastAction'
