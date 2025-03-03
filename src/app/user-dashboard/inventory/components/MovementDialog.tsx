import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers";
import { Product } from "@/types/inventory.interfaces";
import { AlertTriangle, DollarSign, Package } from "lucide-react";

interface MovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  dialogTitle: string;
  dialogDescription: string;
  movementType: "entry" | "exit" | "adjustment";
  movementQuantity: number;
  movementReason: string;
  setMovementQuantity: (quantity: number) => void;
  setMovementReason: (reason: string) => void;
  isCreatingMovement?: boolean;
}

export default function MovementDialog({
  open,
  onOpenChange,
  product,
  dialogTitle,
  dialogDescription,
  movementType,
  movementQuantity,
  movementReason,
  setMovementQuantity,
  setMovementReason,
}: MovementDialogProps) {
  const { toast } = useToast();
  const { handleProcessMovement } = useInventoryHandlers();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {/* Información del producto seleccionado */}
        <div className="bg-muted/50 p-4 rounded-lg border mb-4 w-[85%] mx-auto shadow-sm">
          <h3 className="text-lg font-semibold mb-1 text-center">{product?.name || ""}</h3>
          <div className="flex justify-center flex-wrap gap-3 text-muted-foreground text-sm mt-2">
            <span className="flex items-center gap-1">
              <Package size={14} />
              {product?.category || ""}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={14} />
              ${product?.price?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 py-2">
          {/* Información de stock disponible */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-background p-2 rounded-md">
              <h4 className="font-medium">Stock disponible:</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-semibold bg-background">
                  {product?.stock || 0} unidades
                </Badge>
                {product && product.stock <= (product?.minStock || 0) && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    Stock bajo
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad:</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={movementType === "exit" ? product?.stock || 1 : 1000}
                value={movementQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  // Validación en tiempo real
                  if (value <= 0) {
                    setMovementQuantity(1);
                  } else if (movementType === "exit" && product && value > product.stock) {
                    // Limitar al máximo disponible solo para salidas
                    setMovementQuantity(product.stock);
                    toast({
                      title: "Cantidad ajustada",
                      description: `La cantidad ha sido ajustada al máximo disponible (${product.stock}).`,
                      variant: "default",
                    });
                  } else {
                    setMovementQuantity(value);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo:</Label>
              <Textarea
                id="reason"
                placeholder={
                  movementType === "entry"
                    ? "Ej: Compra de nuevas unidades, devolución de cliente..."
                    : "Ej: Venta, pérdida, producto dañado..."
                }
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          {movementType === "exit" && product && movementQuantity > product.stock && (
            <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              No hay suficiente stock para esta operación.
            </div>
          )}
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleProcessMovement}
            className={`${
              movementType === "entry"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={
              !product ||
              movementQuantity <= 0 ||
              !movementReason.trim() ||
              (movementType === "exit" && product.stock < movementQuantity)
            }
          >
            {movementType === "entry" ? "Registrar Entrada" : "Registrar Salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
