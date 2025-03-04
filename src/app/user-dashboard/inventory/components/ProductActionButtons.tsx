import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers";
import { cn } from "@/lib/utils";
import { Product } from "@/types/inventory.interfaces";
import { PackageMinus, PackagePlus } from "lucide-react";

interface ProductActionButtonsProps {
  product: Product;
  className?: string;
  showLabels?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export default function ProductActionButtons({
  product,
  className,
  showLabels = false,
  variant = "outline",
  size = "sm"
}: ProductActionButtonsProps) {
  // Utilizamos el hook de manejadores de inventario
  const { handleOpenMovementDialog } = useInventoryHandlers();

  return (
    <div className={cn("flex gap-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size={size}
              onClick={() => handleOpenMovementDialog(product, "entrada")}
              className="gap-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <PackagePlus size={16} className="animate-pulse" />
              {showLabels && "Entrada"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Agregar productos al inventario</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size={size}
              onClick={() => handleOpenMovementDialog(product, "salida")}
              className="gap-1"
            >
              <PackageMinus size={16} className="animate-pulse" />
              {showLabels && "Salida"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Retirar productos del inventario</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
