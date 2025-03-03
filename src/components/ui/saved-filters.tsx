'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SavedFilter, useSavedFilters } from '@/hooks/use-saved-filters';
import { BookmarkIcon, CheckIcon, SaveIcon, StarIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface SavedFiltersProps<T extends Record<string, any>> {
  filterType: string;
  currentFilters: T;
  onFilterSelect: (filters: T) => void;
  className?: string;
}

export function SavedFilters<T extends Record<string, any>>({
  filterType,
  currentFilters,
  onFilterSelect,
  className,
}: SavedFiltersProps<T>) {
  const { savedFilters, saveFilter, deleteFilter, setDefaultFilter, getDefaultFilter } =
    useSavedFilters<T>({ filterType });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveFilter(filterName.trim(), currentFilters, isDefault);
      setFilterName('');
      setIsDefault(false);
      setIsDialogOpen(false);
    }
  };

  const handleSelectFilter = (filter: SavedFilter) => {
    onFilterSelect(filter.filters as T);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <BookmarkIcon className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filtros guardados</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {savedFilters.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-gray-500">
              No hay filtros guardados
            </div>
          ) : (
            savedFilters.map(filter => (
              <DropdownMenuItem key={filter.id} className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 flex-1" onClick={() => handleSelectFilter(filter)}>
                  {filter.isDefault && <StarIcon className="h-4 w-4 text-yellow-500" />}
                  <span className="truncate">{filter.name}</span>
                </div>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultFilter(filter.id);
                    }}
                    title="Establecer como predeterminado"
                  >
                    <StarIcon className={`h-4 w-4 ${filter.isDefault ? 'text-yellow-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFilter(filter.id);
                    }}
                    title="Eliminar filtro"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Guardar filtro actual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar filtro</DialogTitle>
            <DialogDescription>
              Guarde esta configuración de filtros para utilizarla más adelante.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="filter-name"
                placeholder="Nombre del filtro"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={isDefault ? 'bg-primary/10' : ''}
                onClick={() => setIsDefault(!isDefault)}
              >
                {isDefault && <CheckIcon className="h-4 w-4 mr-2" />}
                Establecer como predeterminado
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
