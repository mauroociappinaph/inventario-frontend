"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-sky-50 dark:ring-offset-sky-950",
  {
    variants: {
      variant: {
        default:
          "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
        outline:
          "border border-sky-300 bg-transparent hover:bg-sky-100 text-sky-700 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-800",
        secondary:
          "bg-sky-200 text-sky-700 hover:bg-sky-300 dark:bg-sky-700 dark:text-sky-200 dark:hover:bg-sky-600",
        ghost:
          "hover:bg-sky-100 text-sky-700 hover:text-sky-900 dark:hover:bg-sky-800 dark:text-sky-300 dark:hover:text-sky-100",
        link:
          "underline-offset-4 text-sky-700 hover:underline dark:text-sky-300",
        success:
          "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
        warning:
          "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        xl: "h-12 px-10 rounded-lg text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { buttonVariants }
