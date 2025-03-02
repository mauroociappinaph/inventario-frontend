"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Plus, Trash2, Tag, Layers, BarChart3, Package } from "lucide-react"

// Tipo para las categorías
interface Category {
  id: string
  name: string
  description: string
  slug: string
  productCount: number
  color?: string
  icon?: string
}

export default function CategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Electrónica",
      description: "Productos electrónicos como laptops, tablets, teléfonos y accesorios",
      slug: "electronica",
      productCount: 24,
      color: "#3B82F6",
      icon: "laptop"
    },
    {
      id: "2",
      name: "Periféricos",
      description: "Teclados, ratones, auriculares y otros dispositivos de entrada/salida",
      slug: "perifericos",
      productCount: 18,
      color: "#10B981",
      icon: "keyboard"
    },
    {
      id: "3",
      name: "Audio",
      description: "Auriculares, altavoces, micrófonos y equipos de sonido",
      slug: "audio",
      productCount: 12,
      color: "#F59E0B",
      icon: "headphones"
    },
    {
      id: "4",
      name: "Almacenamiento",
      description: "Discos duros, SSD, memorias USB y tarjetas SD",
      slug: "almacenamiento",
      productCount: 9,
      color: "#EC4899",
      icon: "hard-drive"
    },
    {
      id: "5",
      name: "Redes",
      description: "Routers, switches, cables de red y equipos de conectividad",
      slug: "redes",
      productCount: 7,
      color: "#8B5CF6",
      icon: "wifi"
    }
  ])

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    slug: ""
  })

  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0)

  // Generar un slug a partir del nombre
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áäàâã]/g, 'a')
      .replace(/[éëèê]/g, 'e')
      .replace(/[íïìî]/g, 'i')
      .replace(/[óöòôõ]/g, 'o')
      .replace(/[úüùû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
  }

  // Manejar cambio de nombre y actualizar slug automáticamente
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        name,
        slug: generateSlug(name)
      })
    } else {
      setNewCategory({
        ...newCategory,
        name,
        slug: generateSlug(name)
      })
    }
  }

  // Función para añadir una nueva categoría
  const handleAddCategory = () => {
    const newId = (Math.max(...categories.map(c => parseInt(c.id))) + 1).toString()
    const categoryToAdd: Category = {
      id: newId,
      name: newCategory.name,
      description: newCategory.description,
      slug: newCategory.slug || generateSlug(newCategory.name),
      productCount: 0,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Color aleatorio
      icon: "tag"
    }

    setCategories([...categories, categoryToAdd])
    setNewCategory({
      name: "",
      description: "",
      slug: ""
    })
    setIsDialogOpen(false)

    toast({
      title: "Categoría añadida",
      description: `Se ha añadido "${categoryToAdd.name}" a la lista de categorías.`
    })
  }

  // Función para actualizar una categoría
  const handleUpdateCategory = () => {
    if (!editingCategory) return

    setCategories(categories.map(category =>
      category.id === editingCategory.id ? editingCategory : category
    ))

    setEditingCategory(null)
    setIsDialogOpen(false)

    toast({
      title: "Categoría actualizada",
      description: `Se ha actualizado la categoría "${editingCategory.name}".`
    })
  }

  // Función para eliminar una categoría
  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = categories.find(c => c.id === id)

    if (categoryToDelete && categoryToDelete.productCount > 0) {
      toast({
        title: "No se puede eliminar",
        description: `La categoría "${categoryToDelete.name}" tiene productos asociados.`,
        variant: "destructive"
      })
      return
    }

    setCategories(categories.filter(c => c.id !== id))

    toast({
      title: "Categoría eliminada",
      description: `Se ha eliminado la categoría correctamente.`,
      variant: "destructive"
    })
  }

  // Función para abrir el diálogo de edición
  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  // Función para abrir el diálogo de creación
  const openCreateDialog = () => {
    setEditingCategory(null)
    setNewCategory({
      name: "",
      description: "",
      slug: ""
    })
    setIsDialogOpen(true)
  }

  // Obtener el icono correcto basado en la categoría
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "laptop":
        return <Layers size={18} />
      case "keyboard":
        return <Package size={18} />
      case "headphones":
        return <BarChart3 size={18} />
      case "hard-drive":
        return <Tag size={18} />
      case "wifi":
        return <Tag size={18} />
      default:
        return <Tag size={18} />
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus size={16} />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Vista general de las categorías</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total de categorías:</span>
              <Badge variant="outline" className="font-semibold">
                {categories.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total de productos:</span>
              <Badge variant="outline" className="font-semibold">
                {totalProducts}
              </Badge>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Distribución por categoría</h4>
              <div className="space-y-1">
                {categories.map(category => (
                  <div key={category.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || "#cbd5e1" }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-muted-foreground">{category.productCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Listado de Categorías</CardTitle>
            <CardDescription>
              Administre las categorías para clasificar sus productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 font-medium">
                      <th className="py-3 px-4 text-left">Categoría</th>
                      <th className="py-3 px-4 text-left hidden md:table-cell">Descripción</th>
                      <th className="py-3 px-4 text-center">Productos</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr className="border-b">
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No hay categorías creadas.
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: category.color || "#cbd5e1" }}
                              >
                                {getCategoryIcon(category.icon || "tag")}
                              </div>
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-xs text-muted-foreground">/{category.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                            {category.description.length > 60
                              ? `${category.description.substring(0, 60)}...`
                              : category.description}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline">
                              {category.productCount}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(category)}
                                title="Editar categoría"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCategory(category.id)}
                                title="Eliminar categoría"
                                className="text-destructive"
                                disabled={category.productCount > 0}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para añadir/editar categoría */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Modifique los detalles de la categoría seleccionada."
                : "Complete los campos para crear una nueva categoría."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={editingCategory ? editingCategory.name : newCategory.name}
                onChange={handleNameChange}
                className="col-span-3"
                placeholder="Ej: Electrónica"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                value={editingCategory ? editingCategory.slug : newCategory.slug}
                onChange={(e) => {
                  if (editingCategory) {
                    setEditingCategory({
                      ...editingCategory,
                      slug: e.target.value
                    })
                  } else {
                    setNewCategory({
                      ...newCategory,
                      slug: e.target.value
                    })
                  }
                }}
                className="col-span-3"
                placeholder="Ej: electronica"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={editingCategory ? editingCategory.description : newCategory.description}
                onChange={(e) => {
                  if (editingCategory) {
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value
                    })
                  } else {
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value
                    })
                  }
                }}
                className="col-span-3"
                placeholder="Describa brevemente esta categoría..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            >
              {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
