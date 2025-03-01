"use client"

import { useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Definimos las variantes para el CircularProgress
const circularProgressVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary",
      primary: "text-primary",
      secondary: "text-secondary",
      destructive: "text-destructive",
      success: "text-emerald-500",
      warning: "text-amber-500",
      info: "text-blue-500",
    },
    size: {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
      xl: "w-20 h-20",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

interface CircularProgressProps extends VariantProps<typeof circularProgressVariants> {
  value: number | string // Aceptamos tanto números como strings
  color?: string
  strokeWidth?: number
  className?: string
}

export function CircularProgress({
  value,
  variant,
  size: variantSize,
  color,
  strokeWidth = 4,
  className = ""
}: CircularProgressProps) {
  const [progress, setProgress] = useState(0)

  // Asegurarse de que el valor es un número
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  // Determinar el tamaño basado en las variantes
  const getSize = () => {
    switch(variantSize) {
      case 'sm': return 32;
      case 'md': return 48;
      case 'lg': return 64;
      case 'xl': return 80;
      default: return 48;
    }
  }

  const sizeValue = getSize();

  // Determinar el color basado en la variante
  const getColor = () => {
    if (color) return color;

    switch(variant) {
      case 'primary': return 'var(--primary)';
      case 'secondary': return 'var(--secondary)';
      case 'destructive': return 'var(--destructive)';
      case 'success': return 'var(--emerald-500, #10b981)';
      case 'warning': return 'var(--amber-500, #f59e0b)';
      case 'info': return 'var(--blue-500, #3b82f6)';
      default: return 'var(--primary)';
    }
  }

  const colorValue = getColor();

  // Animación del progreso
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(numericValue)
    }, 100)

    return () => clearTimeout(timer)
  }, [numericValue])

  // Calcular propiedades del círculo
  const radius = (sizeValue - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn(circularProgressVariants({ variant, size: variantSize }), className)} style={{ width: sizeValue, height: sizeValue }}>
      <svg
        width={sizeValue}
        height={sizeValue}
        viewBox={`0 0 ${sizeValue} ${sizeValue}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Círculo base */}
        <circle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />

        {/* Círculo de progreso */}
        <circle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          fill="none"
          stroke={colorValue}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>

      {/* Texto del porcentaje */}
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
        style={{ color: colorValue }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  )
}

