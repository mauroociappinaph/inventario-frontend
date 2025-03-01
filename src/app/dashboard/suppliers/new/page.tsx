"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supplierService } from "@/lib/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Plus,
  X
} from "lucide-react";
import { toast } from "sonner";

// Interfaz para el formulario de proveedor
interface SupplierFormData {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  categories: string[];
  notes: string;
  deliveryTime?: number;
}

export default function NewSupplierPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Estado para el formulario
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    categories: [],
    notes: "",
    deliveryTime: undefined,
  });

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar la adición de una nueva categoría
  const handleAddCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
      setNewCategory("");
    }
  };

  // Manejar la eliminación de una categoría
  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contactName || !formData.email) {
      toast.error("Por favor, completa los campos obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      await supplierService.createSupplier(formData);
      toast.success("Proveedor creado con éxito");
      router.push("/dashboard/suppliers");
    } catch (error: any) {
      toast.error(error.message || "Error al crear el proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/suppliers")}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Proveedor</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Proveedor</CardTitle>
            <CardDescription>
              Ingresa los datos del nuevo proveedor. Los campos marcados con * son obligatorios.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre de la Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre de la empresa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">
                    Persona de Contacto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Nombre de la persona de contacto"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo Electrónico <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Dirección completa del proveedor"
                rows={2}
              />
            </div>

            {/* Categorías */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Categorías</h3>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Agregar categoría"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategory}
                >
                  <Plus size={16} />
                  Agregar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categories.length > 0 ? (
                  formData.categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full"
                    >
                      <span>{category}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay categorías añadidas. Agrega al menos una para clasificar al proveedor.
                  </p>
                )}
              </div>
            </div>

            {/* Tiempo de entrega */}
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Tiempo Promedio de Entrega (días)</Label>
              <Input
                id="deliveryTime"
                name="deliveryTime"
                type="number"
                min="1"
                value={formData.deliveryTime || ""}
                onChange={handleChange}
                placeholder="Ej: 5"
              />
            </div>

            {/* Notas adicionales */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Información adicional sobre el proveedor"
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/suppliers")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSubmitting ? "Guardando..." : "Guardar Proveedor"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
