'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { exportToCSV } from '@/utils/export-utils';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: Record<string, any>[];
  filename: string;
  headerMap?: Record<string, string>;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function ExportButton({
  data,
  filename,
  headerMap,
  className,
  variant = 'outline'
}: ExportButtonProps) {
  const handleExport = () => {
    exportToCSV(data, filename, { headerMap });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleExport} variant={variant} size="sm" className={className}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exportar datos a CSV</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
