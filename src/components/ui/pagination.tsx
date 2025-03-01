"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null;

  // Función para generar los números de página a mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Siempre mostrar la primera página
    pageNumbers.push(1);

    // Calcular el rango de páginas alrededor de la página actual
    const leftSide = Math.max(2, currentPage - 1);
    const rightSide = Math.min(totalPages - 1, currentPage + 1);

    // Añadir "..." después de la primera página si hay un salto
    if (leftSide > 2) {
      pageNumbers.push("ellipsis-left");
    }

    // Añadir páginas entre la primera y la última
    for (let i = leftSide; i <= rightSide; i++) {
      pageNumbers.push(i);
    }

    // Añadir "..." antes de la última página si hay un salto
    if (rightSide < totalPages - 1) {
      pageNumbers.push("ellipsis-right");
    }

    // Siempre mostrar la última página si hay más de una
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Botón anterior */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Números de página */}
      {pageNumbers.map((page, index) => {
        if (page === "ellipsis-left" || page === "ellipsis-right") {
          return (
            <Button
              key={`${page}-${index}`}
              variant="ghost"
              size="icon"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(Number(page))}
          >
            {page}
          </Button>
        );
      })}

      {/* Botón siguiente */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
