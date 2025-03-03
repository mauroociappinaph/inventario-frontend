import { Product } from "@/types/inventory.interfaces";

export interface StockStatusInfo {
  color: string;
  bgColor: string;
  iconName: "alertTriangle" | "checkCircle";
  text: string;
}

/**
 * Determina el estado visual del stock de un producto
 * @param product El producto a evaluar
 * @returns Objeto con información visual del estado de stock
 */
export function getStockStatusInfo(product: Product): StockStatusInfo {
  if (product.stock <= 0) {
    return {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      iconName: "alertTriangle",
      text: "Sin stock"
    };
  } else if (product.stock <= product.minStock) {
    return {
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      iconName: "alertTriangle",
      text: "Stock bajo"
    };
  } else {
    return {
      color: "text-green-600",
      bgColor: "bg-green-100",
      iconName: "checkCircle",
      text: "Stock adecuado"
    };
  }
}

/**
 * Formatea una fecha en formato legible para el usuario
 * @param dateString Cadena de fecha a formatear
 * @returns Fecha formateada en formato local (es-ES)
 */
export function formatDate(dateString: string | undefined): string {
  try {
    if (!dateString) return 'Fecha no disponible';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error al formatear fecha:', error, 'dateString:', dateString);
    return 'Fecha no disponible';
  }
}
