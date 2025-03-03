import { CreateProductDto } from "@/lib/api/api";

/**
 * Valida un producto antes de crear o actualizar
 * @param product Datos del producto a validar
 * @returns Mensaje de error o null si es válido
 */
export function validateProduct(product: Partial<CreateProductDto>): string | null {
  if (!product.name?.trim()) return "El nombre es requerido";
  if (typeof product.stock === 'number' && product.stock < 0) return "El stock no puede ser negativo";
  if (typeof product.price === 'number' && product.price <= 0) return "El precio debe ser mayor que cero";
  if (typeof product.minStock === 'number' && product.minStock < 0) return "El stock mínimo no puede ser negativo";
  return null;
}
