import { useAuth } from "@/context/auth-context";
import { Product, StockMovement } from "@/types/inventory.interfaces";
import { useMemo } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

interface ResumenCardProps {
  products: Product[];
  stockMovements: StockMovement[];
}

export default function ResumenCard({ products = [], stockMovements = [] }: ResumenCardProps) {
  const { user } = useAuth();

  // Usar useMemo para cálculos eficientes
  const statistics = useMemo(() => {
    // Asegurarnos de que products y stockMovements son arrays
    const safeProducts = Array.isArray(products) ? products : [];
    const safeMovements = Array.isArray(stockMovements) ? stockMovements : [];

    // Filtrar movimientos de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMovements = safeMovements.filter(m => new Date(m.date) >= thirtyDaysAgo);
    const userMovements = recentMovements.filter(m => m.user === user?.name);

    return {
      totalProducts: safeProducts.length,
      lowStockProducts: safeProducts.filter(p => p.stock <= p.minStock).length,
      totalStock: safeProducts.reduce((sum, p) => sum + p.stock, 0),
      criticalStockPercentage: safeProducts.length > 0
        ? (safeProducts.filter(p => p.stock <= p.minStock).length / safeProducts.length) * 100
        : 0,
      // Estadísticas de movimientos
      totalMovements: recentMovements.length,
      userMovements: userMovements.length,
      entries: recentMovements.filter(m => m.type === "entrada").length,
      exits: recentMovements.filter(m => m.type === "salida").length
    };
  }, [products, stockMovements, user?.name]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tarjetas de resumen */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Productos en inventario
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{statistics.lowStockProducts}</div>
            <Badge
              variant="outline"
              className={`ml-2 ${
                statistics.criticalStockPercentage > 30
                  ? "bg-red-100 text-red-800"
                  : statistics.criticalStockPercentage > 15
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {statistics.criticalStockPercentage.toFixed(0)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Productos por debajo del stock mínimo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total en Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalStock}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Unidades totales en stock
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{statistics.totalMovements}</div>
              <div className="text-sm text-muted-foreground">
                <span className="text-green-600">{statistics.entries} entradas</span>
                {" / "}
                <span className="text-red-600">{statistics.exits} salidas</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.userMovements} movimientos tuyos en los últimos 30 días
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
