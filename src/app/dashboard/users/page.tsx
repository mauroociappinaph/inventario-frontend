"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/api/api";
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
  UserCircle,
  Edit,
  Trash,
  Filter,
  Eye,
  KeyRound,
  Shield
} from "lucide-react";
import { useUIState } from "@/providers/ui-state-provider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Tipo para representar un usuario
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  lastLogin?: string;
  status: "active" | "inactive" | "blocked";
  avatar?: string;
  permissions?: string[];
  createdAt: string;
}

// Tipo para la respuesta paginada
interface PaginatedResponse {
  users: User[];
  total: number;
  pages: number;
}

export default function UsersPage() {
  const router = useRouter();
  const { setActiveItemId } = useUIState();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Lista predefinida de roles (en una aplicación real esto vendría del backend)
  const availableRoles = ["admin", "manager", "supervisor", "user", "guest"];
  const statusOptions = ["active", "inactive", "blocked"];

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // En un entorno real, esto sería reemplazado por una llamada real a la API
      // Por ahora, simulamos datos
      const mockUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
        _id: `user-${i + 1}`,
        name: `Usuario ${i + 1}`,
        email: `usuario${i + 1}@example.com`,
        phone: i % 3 === 0 ? undefined : `+1234567${i.toString().padStart(2, '0')}`,
        role: availableRoles[i % availableRoles.length],
        status: statusOptions[i % statusOptions.length] as "active" | "inactive" | "blocked",
        lastLogin: i % 4 === 0 ? undefined : new Date(Date.now() - i * 86400000).toISOString(),
        createdAt: new Date(Date.now() - i * 2 * 86400000).toISOString(),
        permissions: i % 2 === 0 ? ["read", "write"] : ["read"]
      }));

      // Simulamos paginación
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = mockUsers.slice(startIndex, endIndex);

      // En una implementación real, usaríamos:
      // const response = (await userService.getUsers(currentPage, itemsPerPage, roleFilter)).data as PaginatedResponse;

      const mockResponse = {
        users: paginatedUsers,
        total: mockUsers.length,
        pages: Math.ceil(mockUsers.length / itemsPerPage)
      };

      setUsers(mockResponse.users);
      setFilteredUsers(mockResponse.users);
      setTotalUsers(mockResponse.total);
      setTotalPages(mockResponse.pages);
    } catch (err) {
      // Manejar diferentes tipos de errores de forma más detallada
      let errorMessage = "Error al cargar usuarios";

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
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Marcar este item como activo en la navegación
    setActiveItemId("user-list");

    loadUsers();
  }, [currentPage, itemsPerPage, setActiveItemId]);

  useEffect(() => {
    if (users.length > 0) {
      let result = [...users];

      // Filtrar por término de búsqueda
      if (searchTerm) {
        result = result.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone && user.phone.includes(searchTerm))
        );
      }

      // Filtrar por rol
      if (roleFilter && roleFilter !== "all") {
        result = result.filter((user) => user.role === roleFilter);
      }

      // Filtrar por estado
      if (statusFilter && statusFilter !== "all") {
        result = result.filter((user) => user.status === statusFilter);
      }

      setFilteredUsers(result);
    }
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        // En un entorno real, esto sería una llamada a la API
        // await userService.deleteUser(id);
        console.log(`Usuario ${id} eliminado`);

        // Simulamos la eliminación actualizando el estado local
        setUsers(users.filter(user => user._id !== id));
        setFilteredUsers(filteredUsers.filter(user => user._id !== id));
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "inactive":
        return <Badge className="bg-yellow-500">Inactivo</Badge>;
      case "blocked":
        return <Badge className="bg-red-500">Bloqueado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Componente de fila de carga para mostrar durante la carga
  const LoadingRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-36" /></TableCell>
      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
    </TableRow>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button
          onClick={() => router.push("/dashboard/users/new")}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Administra los usuarios y sus permisos en el sistema
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
                  onClick={() => loadUsers()}
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
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                aria-label="Buscar usuarios por nombre, email o teléfono"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="w-[150px]" aria-label="Filtrar por rol">
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    <span>{roleFilter || "Rol"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[150px]" aria-label="Filtrar por estado">
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>{statusFilter || "Estado"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="blocked">Bloqueados</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[180px]" aria-label="Items por página">
                  <span>{itemsPerPage} items por página</span>
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
          <div className="relative">
            {/* Overlay de carga */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                  <span className="text-sm text-muted-foreground">Cargando usuarios...</span>
                </div>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Filas de carga (skeletons)
                    Array.from({ length: 5 }).map((_, index) => (
                      <LoadingRow key={`loading-${index}`} />
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/users/${user._id}`)}
                              aria-label={`Ver detalles de ${user.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/users/${user._id}/edit`)}
                              aria-label={`Editar usuario ${user.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/users/${user._id}/permissions`)}
                              aria-label={`Gestionar permisos de ${user.name}`}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(user._id)}
                              aria-label={`Eliminar usuario ${user.name}`}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <UserCircle className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="font-medium mb-1">No se encontraron usuarios</p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm || roleFilter !== "" || statusFilter !== ""
                              ? "Prueba con otros filtros o criterios de búsqueda"
                              : "Agrega nuevos usuarios para empezar"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} - {
                    Math.min(currentPage * itemsPerPage, totalUsers)
                  } de {totalUsers} usuarios
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
