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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers";
import { Product } from "@/types/inventory.interfaces";
import { AlertTriangle, DollarSign, Package } from "lucide-react";

interface MovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  dialogTitle: string;
  dialogDescription: string;
  movementType: "entrada" | "salida";
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
  isCreatingMovement
}: MovementDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { handleStockMovement } = useInventoryHandlers();

  const handleSubmit = async () => {
    try {
      if (!product || !user?.id) return;

      await handleStockMovement(user.id, user.name);
      onOpenChange(false);

      toast({
        title: "Movimiento registrado",
        description: `Se ha ${movementType === "entrada" ? "agregado" : "registrado la salida de"} ${movementQuantity} unidades ${movementType === "entrada" ? "al" : "del"} producto ${product.name}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error al procesar el movimiento",
        description: error.message || "Ha ocurrido un error al procesar el movimiento",
        variant: "destructive",
      });
    }
  };

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
                max={movementType === "salida" ? product?.stock || 1 : 1000}
                value={movementQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  // Validación en tiempo real
                  if (value <= 0) {
                    setMovementQuantity(1);
                  } else if (movementType === "salida" && product && value > product.stock) {
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
          </div>

          {movementType === "salida" && product && movementQuantity > product.stock && (
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
            onClick={handleSubmit}
            variant={movementType === "entrada" ? "default" : "destructive"}
            className={movementType === "entrada" ? "bg-green-600 hover:bg-green-700 text-white" : undefined}
            disabled={!product || movementQuantity <= 0 || (movementType === "salida" && product.stock < movementQuantity) || isCreatingMovement}
          >
            {isCreatingMovement ? "Procesando..." : movementType === "entrada" ? "Registrar Entrada" : "Registrar Salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
