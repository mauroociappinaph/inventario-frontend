import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/inventory-utils";
import { StockMovement } from "@/types/inventory.interfaces";
import { PackageMinus, PackagePlus } from "lucide-react";

interface MovementsTableProps {
  movements: StockMovement[];
  userName?: string;
}

export default function MovementsTable({
  movements,
  userName = "Usuario",
}: MovementsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 font-medium">
                  <th className="py-3 px-4 text-left">Fecha</th>
                  <th className="py-3 px-4 text-left">Tipo</th>
                  <th className="py-3 px-4 text-left">Producto</th>
                  <th className="py-3 px-4 text-right">Cantidad</th>
                  <th className="py-3 px-4 text-left">Razón</th>
                  <th className="py-3 px-4 text-left">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No hay movimientos registrados.
                    </td>
                  </tr>
                ) : (
                  movements.map((movement, index) => (
                    <tr key={`movement-${movement.id || index}-${Date.now()}`} className="border-b transition-colors hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(movement.date)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={movement.type === "entry" ? "success" : movement.type === "exit" ? "destructive" : "outline"} className="flex items-center gap-1 w-fit">
                          {movement.type === "entry" && <PackagePlus size={14} />}
                          {movement.type === "exit" && <PackageMinus size={14} />}
                          {movement.type === "entry" ? "Entrada" : movement.type === "exit" ? "Salida" : "Ajuste"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{movement.productName}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={movement.type === "entry" ? "text-green-600" : movement.type === "exit" ? "text-red-600" : "text-blue-600"}>
                          {movement.type === "entry" ? "+" : movement.type === "exit" ? "-" : ""}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {movement.reason || "No especificada"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {movement.user || userName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
