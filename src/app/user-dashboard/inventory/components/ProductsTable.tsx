import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers";
import { formatDate, getStockStatusInfo } from "@/lib/inventory-utils";
import { Product } from "@/types/inventory.interfaces";
import { AlertTriangle, ArrowUpDown, CheckCircle2 } from "lucide-react";
import ProductActionButtons from "./ProductActionButtons";



interface ProductsTableProps {
  products: Product[];
  filteredProducts: Product[];
  isAdmin: boolean;
}

export default function ProductsTable({
  products,
  filteredProducts,
  isAdmin
}: ProductsTableProps) {
  // Incorporamos el handler para ordenar
  const { handleSort } = useInventoryHandlers();

  // Renderizamos el icono según el nombre del icono
  const renderStatusIcon = (iconName: string, className: string) => {
    if (iconName === "alertTriangle") {
      return <AlertTriangle size={14} className={className} />;
    } else if (iconName === "checkCircle") {
      return <CheckCircle2 size={14} className={className} />;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulta de Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 font-medium">
                  <th className="py-3 px-4 text-left">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("name")}
                    >
                      Producto
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("price")}
                    >
                      Precio
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("category")}
                    >
                      Categoría
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("stock")}
                    >
                      Stock Actual
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("minStock")}
                    >
                      Stock Mínimo
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("status")}
                    >
                      Estado
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("entryDate")}
                    >
                      Fecha Entrada
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("lastUpdated")}
                    >
                      Última Actualización
                      <ArrowUpDown size={14} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No se encontraron productos con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  (filteredProducts as Product[]).map((product, index) => {
                    const stockStatus = getStockStatusInfo(product);
                    return (
                      <tr key={`product-${product.id || index}-${Date.now()}`} className="border-b transition-colors hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <Badge variant="outline" className="font-normal">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          <span className={stockStatus.color}>{product.stock}</span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell font-medium">
                          {product.minStock}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <Badge variant="outline" className={`flex gap-1 items-center w-fit ${stockStatus.bgColor}`}>
                            {renderStatusIcon(stockStatus.iconName, stockStatus.color)}
                            <span className={stockStatus.color}>{stockStatus.text}</span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                          {formatDate(product.entryDate || '')}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                          {formatDate(product.lastUpdated)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <ProductActionButtons
                              product={product}
                              allowEntries={isAdmin}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
