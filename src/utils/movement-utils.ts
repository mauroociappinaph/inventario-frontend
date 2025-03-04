import { Product, StockMovement } from '@/types/inventory.interfaces';

/**
 * Verifica si un ID de producto es válido (formato MongoDB ObjectId)
 * @param productId ID del producto a verificar
 * @returns Booleano indicando si el ID es válido
 */
export function isValidProductId(productId: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(productId);
}

/**
 * Valida si hay stock suficiente para un movimiento de salida
 * @param product Producto a verificar
 * @param quantity Cantidad a extraer
 * @returns Objeto con resultado de validación
 */
export function validateStockAvailability(
  product: Product,
  quantity: number
): { isValid: boolean; message?: string } {
  if (!product) {
    return { isValid: false, message: 'Producto no seleccionado' };
  }

  if (product.stock < quantity) {
    return {
      isValid: false,
      message: `Stock insuficiente. Disponible: ${product.stock} unidades`
    };
  }

  return { isValid: true };
}

/**
 * Prepara los datos de un movimiento de stock para enviar al backend
 * @param params Parámetros del movimiento
 * @returns Objeto con datos del movimiento listo para enviar
 */
export function prepareMovementData({
  product,
  quantity,
  movementType,
  reason,
  userId,
  userName
}: {
  product: Product;
  quantity: number;
  movementType: 'entry' | 'exit';
  reason: string;
  userId: string;
  userName?: string;
}): StockMovement {
  const productId = product._id || product.id;

  if (!isValidProductId(productId)) {
    throw new Error("ID de producto inválido");
  }

  if (movementType === "exit") {
    const validation = validateStockAvailability(product, quantity);
    if (!validation.isValid) {
      throw new Error(validation.message || "Stock insuficiente");
    }
  }

  return {
    id: Date.now().toString(), // ID temporal
    productId,
    productName: product.name,
    quantity,
    type: movementType,
    reason,
    date: new Date().toISOString(),
    user: userName || "Usuario"
  };
}

/**
 * Actualiza el stock de un producto según el movimiento realizado
 * @param product Producto a actualizar
 * @param movementType Tipo de movimiento (entrada o salida)
 * @param quantity Cantidad del movimiento
 * @returns Producto con stock actualizado
 */
export function updateProductStock(
  product: Product,
  movementType: 'entry' | 'exit',
  quantity: number
): Product {
  if (!product) return product;

  const newStock = movementType === 'entry'
    ? product.stock + quantity
    : product.stock - quantity;

  return {
    ...product,
    stock: Math.max(0, newStock), // Aseguramos que el stock no sea negativo
    lastStockUpdate: new Date().toISOString()
  };
}

/**
 * Actualiza la lista de productos tras un movimiento de stock
 * @param products Lista de productos original
 * @param updatedProduct Producto actualizado
 * @returns Lista de productos actualizada
 */
export function updateProductList(
  products: Product[],
  updatedProduct: Product
): Product[] {
  if (!Array.isArray(products) || !updatedProduct) {
    return products;
  }

  return products.map(p =>
    p.id === updatedProduct.id ? updatedProduct : p
  );
}
