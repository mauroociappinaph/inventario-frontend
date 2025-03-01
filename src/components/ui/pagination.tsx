"use client";

import { Button } from "./button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
}: PaginationProps) {
  // No mostrar paginación si hay solo una página
  if (totalPages <= 1) return null;

  // Calcular rango de páginas a mostrar
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Ajustar el rango si estamos cerca del inicio o fin
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  // Generar array de páginas
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex items-center space-x-1" role="navigation" aria-label="Paginación">
      {/* Botón para primera página */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Ir a la primera página"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Botón para página anterior */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Mostrar elipsis si hay más páginas antes del rango actual */}
      {startPage > 1 && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          aria-label="Ir a página 1"
        >
          1
        </Button>
      )}

      {startPage > 2 && (
        <span className="mx-1 text-muted-foreground">...</span>
      )}

      {/* Botones de páginas numeradas */}
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page)}
          aria-label={`Página ${page}`}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      {/* Mostrar elipsis si hay más páginas después del rango actual */}
      {endPage < totalPages - 1 && (
        <span className="mx-1 text-muted-foreground">...</span>
      )}

      {endPage < totalPages && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          aria-label={`Ir a página ${totalPages}`}
        >
          {totalPages}
        </Button>
      )}

      {/* Botón para página siguiente */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Botón para última página */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Ir a la última página"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
