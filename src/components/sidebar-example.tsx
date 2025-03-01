"use client"

import { useState } from "react"
import {
  Home,
  BarChart2,
  Star,
  Heart,
  MessageSquare,
  MapPin,
  Settings,
  LogOut,
  Bell,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  HelpCircle
} from "lucide-react"
import { EnhancedSidebar, SidebarUserInfo } from "./enhanced-sidebar"
import { Button } from "./ui/button"

export default function SidebarExample() {
  const [activeItemId, setActiveItemId] = useState<string>("dashboard")
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "compact" | "expanded">("default")
  const [isMobile, setIsMobile] = useState(false)

  // Datos del usuario para el sidebar
  const userInfo: SidebarUserInfo = {
    name: "Usuario Demo",
    role: "Administrador",
    initials: "UD"
  }
  // Definición del tipo SidebarSection
  type SidebarSection = {
    id: string;
    title: string;
    items: Array<{
      id: string;
      icon?: React.ReactNode;
      label: string;
      badge?: { count: number; color: string };
      subItems?: Array<{ id: string; label: string; onClick?: () => void }>;
    }>;
  };

  // Secciones del sidebar con items
  const sidebarSections: SidebarSection[] = [
    {
      id: "main",
      title: "Principal",
      items: [
        { id: "dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard", badge: { count: 2, color: "bg-primary text-primary-foreground" } },
        { id: "stats", icon: <BarChart2 className="h-4 w-4" />, label: "Estadísticas" },
        {
          id: "products",
          icon: <Star className="h-4 w-4" />,
          label: "Productos",
          subItems: [
            { id: "product-list", label: "Listado", onClick: () => console.log("Listado de productos") },
            { id: "product-categories", label: "Categorías", onClick: () => console.log("Categorías de productos") },
            { id: "product-inventory", label: "Inventario", onClick: () => console.log("Inventario de productos") }
          ]
        },
      ]
    },
    {
      id: "management",
      title: "Gestión",
      items: [
        { id: "suppliers", icon: <Heart className="h-4 w-4" />, label: "Proveedores" },
        { id: "orders", icon: <MessageSquare className="h-4 w-4" />, label: "Pedidos", badge: { count: 5, color: "bg-destructive text-destructive-foreground" } },
        { id: "locations", icon: <MapPin className="h-4 w-4" />, label: "Ubicaciones" },
        {
          id: "users",
          icon: <Users className="h-4 w-4" />,
          label: "Usuarios",
          subItems: [
            { id: "user-list", label: "Listado", onClick: () => console.log("Listado de usuarios") },
            { id: "user-roles", label: "Roles y Permisos", onClick: () => console.log("Roles y permisos") }
          ]
        },
      ]
    },
    {
      id: "commerce",
      title: "Comercio",
      items: [
        { id: "sales", icon: <ShoppingCart className="h-4 w-4" />, label: "Ventas" },
        { id: "packages", icon: <Package className="h-4 w-4" />, label: "Paquetes" },
        { id: "payments", icon: <CreditCard className="h-4 w-4" />, label: "Pagos" },
      ]
    }
  ]

  // Footer personalizado para el sidebar
  const sidebarFooter = (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" className="flex-1 justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Settings className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="flex-1 justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Bell className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="flex-1 justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )

  // Maneja el clic en un elemento del sidebar
  const handleItemClick = (itemId: string) => {
    setActiveItemId(itemId)
    console.log(`Navegando a: ${itemId}`)
    // En una aplicación real, aquí se manejaría la navegación
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold">Ejemplo de Sidebar Mejorado</h1>
        <div className="flex gap-2">
          <Button onClick={() => setSidebarVariant("default")}>Normal</Button>
          <Button onClick={() => setSidebarVariant("compact")}>Compacto</Button>
          <Button onClick={() => setIsMobile(!isMobile)}>{isMobile ? "Vista Desktop" : "Vista Móvil"}</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!isMobile && (
          <EnhancedSidebar
            sections={sidebarSections}
            userInfo={userInfo}
            selectedItemId={activeItemId}
            onItemClick={handleItemClick}
            footerContent={sidebarFooter}
            variant={sidebarVariant}
          />
        )}

        {/* Simulación de overlay móvil */}
        {isMobile && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <EnhancedSidebar
              isMobile={true}
              onClose={() => setIsMobile(false)}
              sections={sidebarSections}
              userInfo={userInfo}
              selectedItemId={activeItemId}
              onItemClick={handleItemClick}
              footerContent={sidebarFooter}
            />
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Características del Sidebar Mejorado</h2>

              <div className="space-y-3">
                <p className="text-muted-foreground">Este componente de sidebar incluye:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Soporte para versión móvil y desktop</li>
                  <li>Modo compacto con solo iconos</li>
                  <li>Notificaciones en elementos del menú</li>
                  <li>Subelementos expandibles</li>
                  <li>Información personalizable del usuario</li>
                  <li>Diseño basado en secciones</li>
                  <li>Footer personalizable</li>
                  <li>Integración completa con el tema de la aplicación</li>
                </ul>
              </div>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Item actual seleccionado: <span className="text-primary">{activeItemId}</span></h2>
              <p className="text-muted-foreground">
                El sidebar mantiene estado del elemento actualmente seleccionado y permite controlar la navegación
                mediante callbacks personalizables.
              </p>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Ayuda</h2>
              <p className="text-muted-foreground">
                Para usar este componente en tu aplicación, importa el componente EnhancedSidebar y configura
                las secciones, elementos y callback necesarios.
              </p>
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Ver documentación
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
