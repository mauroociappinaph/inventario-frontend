"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supplierService, productService, orderService } from "@/lib/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Trash,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  Package,
  ShoppingCart
} from "lucide-react";
import { toast } from "sonner";

// Interfaces
interface Supplier {
  _id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  categories: string[];
  products: string[];
  notes?: string;
  rating?: number;
  deliveryTime?: number;
}

interface Product {
  _id: string;
  name: string;

  price: number;
  stock: number;
  category: string;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderDate: string;
  currentStatus: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del proveedor
  useEffect(() => {
    const loadSupplierData = async () => {
      setIsLoading(true);
      try {
        // Cargar información del proveedor
        const supplierData = (await supplierService.getSupplierById(params.id)).data;
        setSupplier(supplierData);

        // Cargar productos asociados al proveedor
        if (supplierData.products && supplierData.products.length > 0) {
          const productsPromises = supplierData.products.map((productId: string) =>
            productService.getProductById(productId)
          );
          const productsData = await Promise.all(productsPromises);
          setProducts(productsData.map(response => response.data));
        }

        // Cargar pedidos asociados al proveedor
        const ordersData = (await orderService.getOrdersBySupplier(params.id)).data;
        setOrders(ordersData);
      } catch (error: any) {
        toast.error(error.message || "Error al cargar los datos del proveedor");
      } finally {
        setIsLoading(false);
      }
    };

    loadSupplierData();
  }, [params.id]);

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.")) {
      try {
        await supplierService.deleteSupplier(params.id);
        toast.success("Proveedor eliminado con éxito");
        router.push("/dashboard/suppliers");
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar el proveedor");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/suppliers")}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Proveedor no encontrado</h2>
          <p className="text-muted-foreground">
            El proveedor que estás buscando no existe o ha sido eliminado.
          </p>
          <Button
            onClick={() => router.push("/dashboard/suppliers")}
            className="mt-4"
          >
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/suppliers")}
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/dashboard/suppliers/${params.id}/edit`)}
          >
            <Edit size={16} />
            Editar
          </Button>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleDelete}
          >
            <Trash size={16} />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de información */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{supplier.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{supplier.phone || "No disponible"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{supplier.address || "No disponible"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calificación</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{supplier.rating || "N/A"}</span>
                  {supplier.rating && (
                    <div className="flex">
                      {[...Array(Math.floor(supplier.rating))].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiempo de Entrega</p>
                <p className="font-medium">
                  {supplier.deliveryTime
                    ? `${supplier.deliveryTime} días promedio`
                    : "No especificado"}
                </p>
              </div>
            </div>

            {/* Categorías */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                {supplier.categories.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Notas */}
            {supplier.notes && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Notas</h3>
                <p className="text-sm text-muted-foreground">{supplier.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pestañas para productos y pedidos */}
        <Card className="md:col-span-2">
          <Tabs defaultValue="products">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalles del Proveedor</CardTitle>
                <TabsList>
                  <TabsTrigger value="products" className="flex items-center gap-1">
                    <Package size={16} />
                    Productos
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex items-center gap-1">
                    <ShoppingCart size={16} />
                    Pedidos
                  </TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Productos suministrados y historial de pedidos
              </CardDescription>
            </CardHeader>

            <CardContent>
              <TabsContent value="products">
                {products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>

                          <TableHead>Categoría</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell className="font-medium">{product.name}</TableCell>

                            <TableCell>{product.category}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  product.stock > 10
                                    ? "bg-green-100 text-green-800"
                                    : product.stock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.stock}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package size={40} className="mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No hay productos</h3>
                    <p className="text-muted-foreground mb-4">
                      Este proveedor aún no tiene productos asociados.
                    </p>
                    <Button
                      onClick={() => router.push(`/dashboard/products/new?supplierId=${params.id}`)}
                    >
                      Añadir Producto
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders">
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nº Pedido</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Productos</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow
                            key={order._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                          >
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>
                              {new Date(order.orderDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  order.currentStatus === "entregado"
                                    ? "bg-green-100 text-green-800"
                                    : order.currentStatus === "cancelado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {order.currentStatus}
                              </span>
                            </TableCell>
                            <TableCell>{order.items.length}</TableCell>
                            <TableCell>${order.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart size={40} className="mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No hay pedidos</h3>
                    <p className="text-muted-foreground mb-4">
                      No se han realizado pedidos a este proveedor.
                    </p>
                    <Button
                      onClick={() => router.push(`/dashboard/orders/new?supplierId=${params.id}`)}
                    >
                      Crear Pedido
                    </Button>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
