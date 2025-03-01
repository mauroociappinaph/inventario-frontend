"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supplierService } from "@/lib/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  Phone,
  Mail,
  Search,
  Plus,
  Star,
  Edit,
  Trash,
  Filter,
  Eye
} from "lucide-react";

// Tipo para representar un proveedor
interface Supplier {
  _id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  categories: string[];
  rating?: number;
  products: string[];
  address?: string;
  notes?: string;
  deliveryTime?: number;
}

// Tipo para la respuesta paginada
interface PaginatedResponse {
  suppliers: Supplier[];
  total: number;
  pages: number;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadSuppliers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = (await supplierService.getSuppliers(currentPage, itemsPerPage)).data as PaginatedResponse;

      // Validar que la respuesta tenga la estructura esperada
      if (!response || !Array.isArray(response.suppliers)) {
        throw new Error("La respuesta del servidor no tiene el formato esperado");
      }

      setSuppliers(response.suppliers);
      setFilteredSuppliers(response.suppliers);
      setTotalSuppliers(response.total);
      setTotalPages(response.pages);
    } catch (err) {
      // Manejar diferentes tipos de errores de forma más detallada
      let errorMessage = "Error al cargar proveedores";

      if (err instanceof Error) {
        errorMessage = `${errorMessage}: ${err.message}`;
      } else if (typeof err === 'object' && err !== null) {
        // Para errores de API que pueden tener una estructura específica
        const apiError = err as any;
        if (apiError.message) {
          errorMessage = `${errorMessage}: ${apiError.message}`;
        } else if (apiError.status) {
          errorMessage = `${errorMessage}: Error de servidor (${apiError.status})`;
        }
      }

      console.error(errorMessage, err);
      setError(errorMessage);

      // Inicializar con arrays vacíos para evitar errores de renderizado
      setSuppliers([]);
      setFilteredSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (suppliers.length > 0) {
      let result = [...suppliers];

      // Filtrar por término de búsqueda
      if (searchTerm) {
        result = result.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtrar por categoría
      if (categoryFilter && categoryFilter !== "all") {
        result = result.filter((supplier) =>
          supplier.categories.includes(categoryFilter)
        );
      }

      setFilteredSuppliers(result);
    }
  }, [searchTerm, categoryFilter, suppliers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      try {
        await supplierService.deleteSupplier(id);
        loadSuppliers();
      } catch (error) {
        console.error("Error al eliminar proveedor:", error);
      }
    }
  };

  // Obtener categorías únicas de todos los proveedores
  const allCategories = suppliers.reduce((categories: string[], supplier) => {
    supplier.categories.forEach((category) => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
    return categories;
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
        <Button
          onClick={() => router.push("/dashboard/suppliers/new")}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Proveedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores</CardTitle>
          <CardDescription>
            Administra tus proveedores y sus datos de contacto
          </CardDescription>

          {/* Mostrar mensaje de error si existe */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive flex items-start">
              <div className="mr-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{error}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-destructive underline"
                  onClick={() => loadSuppliers()}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>{categoryFilter || "Categoría"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[130px]">
                  <span>{itemsPerPage} por página</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-md" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-destructive">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No se pudieron cargar los proveedores</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {error}
              </p>
              <div className="flex gap-4">
                <Button onClick={() => loadSuppliers()} className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                    <path d="M21 22v-6h-6"></path>
                  </svg>
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setSuppliers([]);
                    setFilteredSuppliers([]);
                  }}
                >
                  Limpiar Error
                </Button>
              </div>
            </div>
          ) : filteredSuppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Categorías</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier._id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {supplier.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {supplier.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {supplier.categories.map((category) => (
                            <span
                              key={category}
                              className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star
                            className="text-yellow-400 fill-yellow-400"
                            size={16}
                          />
                          {supplier.rating || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/suppliers/${supplier._id}`)}
                          >
                            <Eye size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/suppliers/${supplier._id}/edit`)}
                          >
                            <Edit size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(supplier._id)}
                          >
                            <Trash size={18} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No se encontraron proveedores{searchTerm ? " con ese criterio de búsqueda" : ""}.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
