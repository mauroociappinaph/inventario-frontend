import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina nombres de clase con tailwind-merge
 * @param inputs Nombres de clase a combinar
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

