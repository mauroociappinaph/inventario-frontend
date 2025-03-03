import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers";
import { cn } from "@/lib/utils";
import { Product } from "@/types/inventory.interfaces";
import { ArrowDownUp, PackageMinus, PackagePlus } from "lucide-react";

interface ProductActionButtonsProps {
  product: Product;
  className?: string;
  showLabels?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  allowEntries?: boolean;
}

export default function ProductActionButtons({
  product,
  className,
  showLabels = false,
  variant = "outline",
  size = "sm",
  allowEntries = false
}: ProductActionButtonsProps) {
  // Utilizamos el hook de manejadores de inventario
  const { handleOpenMovementDialog } = useInventoryHandlers();

  return (
    <div className={cn("flex gap-2", className)}>
      <TooltipProvider>
        {allowEntries && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size={size}
                onClick={() => handleOpenMovementDialog(product, "entry")}
                className="gap-1"
              >
                <PackagePlus size={16} />
                {showLabels && "Entrada"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Registrar entrada de stock</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={() => handleOpenMovementDialog(product, "exit")}
              className="gap-1"
            >
              <PackageMinus size={16} />
              {showLabels && "Salida"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Registrar salida de stock</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={() => handleOpenMovementDialog(product, "adjustment")}
              className="gap-1"
            >
              <ArrowDownUp size={16} />
              {showLabels && "Ajuste"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Realizar ajuste de inventario</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
