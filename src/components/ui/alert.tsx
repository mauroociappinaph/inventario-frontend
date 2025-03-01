"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Definimos las variantes de estilo para las alertas
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 mb-4 flex items-start gap-3",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
        success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        warning: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
        error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
      },
      size: {
        sm: "text-sm p-3",
        md: "text-base p-4",
        lg: "text-lg p-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const iconMap: Record<string, React.ReactNode> = {
  default: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
}

// Interfaz para las props del componente
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
}

// Componente de alerta
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", size, title, dismissible, onDismiss, children, icon, ...props }, ref) => {
    // Si estamos en modo dismissible, manejamos el estado del componente
    const [visible, setVisible] = React.useState(true)

    const handleDismiss = () => {
      setVisible(false)
      onDismiss?.()
    }

    if (!visible) return null

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        {icon || (variant && iconMap[variant])}

        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          {children && <AlertDescription>{children}</AlertDescription>}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md p-1 text-foreground/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

// Subcomponentes para títulos y descripciones
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
