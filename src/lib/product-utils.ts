import { Product } from '@/types/inventory.interfaces';

/**
 * Verifica si un valor es un array válido de productos
 */
export function isValidProductsArray(data: any): data is Product[] {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' && item !== null &&
    // Verificar que tenga al menos id y name, que son campos obligatorios
    ('id' in item || '_id' in item) && 'name' in item
  );
}

/**
 * Normaliza la estructura de un producto para asegurar que tenga todos los campos requeridos
 */
export function normalizeProduct(item: any): Product {
  return {
    id: item.id || item._id || '',
    _id: item._id || item.id || '',
    name: item.name || 'Sin nombre',
    price: Number(item.price) || 0,
    category: item.category || 'Sin categoría',
    stock: Number(item.stock) || 0,
    minStock: Number(item.minStock) || 0,
    lastUpdated: item.lastUpdated || new Date().toISOString(),
    lastStockUpdate: item.lastStockUpdate || new Date().toISOString()
  };
}

/**
 * Transforma un array de datos en formato desconocido a un array de productos normalizados
 */
export function normalizeProducts(data: any[]): Product[] {
  try {
    return data.map(normalizeProduct);
  } catch (err) {
    console.error("Error al normalizar productos:", err, data);
    return [];
  }
}

/**
 * Procesa la respuesta del API y extrae/normaliza el array de productos
 */
export function processProductsResponse(response: any): Product[] {
  // Si no hay respuesta
  if (!response) {
    return [];
  }

  // Si la respuesta es un objeto con data
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const { data } = response;
    if (Array.isArray(data)) {
      return normalizeProducts(data);
    }
  }

  // Si la respuesta es directamente un array
  if (Array.isArray(response)) {
    return normalizeProducts(response);
  }

  // Si la respuesta tiene productos en otra propiedad
  if (typeof response === 'object' && response !== null && 'products' in response && Array.isArray(response.products)) {
    return normalizeProducts(response.products);
  }

  // Si no pudimos encontrar productos, retornar array vacío
  console.error("Formato de respuesta no reconocido:", response);
  return [];
}
