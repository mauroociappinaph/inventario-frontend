import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useInventoryHandlers } from "@/hooks/useInventoryHandlers";
import { useInventoryStore } from "@/store/useInventoryStore";
import { BookmarkIcon, RefreshCw, SaveIcon, SearchIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function InventoryFilters() {
  // Usar el store directamente para los estados
  const {
    searchTerm,
    categoryFilter,
    stockFilter,
    getCategories,
    setSearchTerm,
    setCategoryFilter,
    setStockFilter,
    resetAllFilters,
    setSortBy,
    setSortDirection,
    sortBy,
    sortDirection,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    resetPriceFilter,
    savedFilters
  } = useInventoryStore();

  // Usar los handlers para operaciones complejas
  const {
    handleApplySavedFilter,
    handleSaveCurrentFilter,
    handleDeleteSavedFilter,
    handleSort
  } = useInventoryHandlers();

  // Estados locales para manejar el filtro de precio
  const [minPriceInput, setMinPriceInput] = useState(minPrice.toString());
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice === 999999 ? "" : maxPrice.toString());

  // Estado para el diálogo de guardar filtro
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");

  // Sincronizar los estados locales cuando cambian los valores en el store
  useEffect(() => {
    setMinPriceInput(minPrice.toString());
    setMaxPriceInput(maxPrice === 999999 ? "" : maxPrice.toString());
  }, [minPrice, maxPrice]);

  // Función para aplicar el filtro de precio
  const applyPriceFilter = () => {
    const min = minPriceInput === "" ? 0 : parseFloat(minPriceInput);
    const max = maxPriceInput === "" ? 999999 : parseFloat(maxPriceInput);
    setMinPrice(min);
    setMaxPrice(max);
  };

  // Función para guardar el filtro actual
  const handleSaveFilter = () => {
    if (newFilterName.trim()) {
      handleSaveCurrentFilter(newFilterName.trim());
      setNewFilterName("");
      setSaveFilterDialogOpen(false);
    }
  };

  // Contar filtros activos
  const activeFiltersCount = [
    searchTerm !== "",
    categoryFilter !== "all",
    stockFilter !== "all",
    minPrice > 0,
    maxPrice < 999999
  ].filter(Boolean).length;

  // Obtener categorías del store
  const categories = getCategories();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="low">Stock bajo</SelectItem>
              <SelectItem value="normal">Stock normal</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            {/* Dropdown para filtros guardados */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <BookmarkIcon className="h-4 w-4" />
                  {savedFilters.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                      {savedFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filtros guardados</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[200px]">
                  {savedFilters.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No hay filtros guardados
                    </div>
                  ) : (
                    savedFilters.map((filter) => (
                      <DropdownMenuItem key={filter.id} className="flex justify-between items-center">
                        <button
                          className="flex-1 text-left"
                          onClick={() => handleApplySavedFilter(filter.id)}
                        >
                          {filter.name}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedFilter(filter.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex justify-center"
                  onClick={() => setSaveFilterDialogOpen(true)}
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Guardar filtro actual
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón para limpiar filtros */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={activeFiltersCount === 0}
                    onClick={resetAllFilters}
                    className="relative"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Limpiar todos los filtros</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Diálogo para guardar filtro */}
      <Dialog open={saveFilterDialogOpen} onOpenChange={setSaveFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Guardar filtro</DialogTitle>
            <DialogDescription>
              Guarda la configuración actual de filtros para usarla más tarde.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filter-name" className="text-right">
                Nombre:
              </Label>
              <Input
                id="filter-name"
                placeholder="Ej: Productos electrónicos con stock bajo"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveFilterDialogOpen(false)}>Cancelar</Button>
            <Button disabled={!newFilterName.trim()} onClick={handleSaveFilter}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
