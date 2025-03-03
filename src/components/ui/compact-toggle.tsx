'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { MaximizeIcon, MinimizeIcon } from 'lucide-react';
import { useEffect } from 'react';

interface CompactToggleProps {
  tableId?: string;
  className?: string;
}

export function CompactToggle({ tableId = 'global', className }: CompactToggleProps) {
  const storageKey = `compact-mode-${tableId}`;
  const [isCompact, setIsCompact] = useLocalStorage(storageKey, false);

  useEffect(() => {
    // Añadir o quitar la clase 'compact-mode' al documento
    if (isCompact) {
      document.documentElement.classList.add('compact-mode');
      if (tableId !== 'global') {
        const tableElement = document.getElementById(tableId);
        tableElement?.classList.add('compact-mode');
      }
    } else {
      document.documentElement.classList.remove('compact-mode');
      if (tableId !== 'global') {
        const tableElement = document.getElementById(tableId);
        tableElement?.classList.remove('compact-mode');
      }
    }

    return () => {
      if (tableId !== 'global') {
        const tableElement = document.getElementById(tableId);
        tableElement?.classList.remove('compact-mode');
      }
    };
  }, [isCompact, tableId]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCompact(!isCompact)}
            className={className}
          >
            {isCompact ? (
              <MaximizeIcon className="h-4 w-4" />
            ) : (
              <MinimizeIcon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCompact ? 'Vista normal' : 'Vista compacta'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
