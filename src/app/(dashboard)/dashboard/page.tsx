"use client"

import { useState, useEffect } from "react"
import { Home, LayoutGrid, Package, ShoppingCart, Users } from "lucide-react"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { InventoryOverview } from "@/components/dashboard/InventoryOverview"
import { MainLayout } from "@/components/layout/MainLayout"
import { useLoading } from "@/hooks/useLoading"

export default function DashboardPage() {
  // Estados para la página
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)
  const [activeItemId, setActiveItemId] = useState("dashboard")
  const { resetAllLoadingStates } = useLoading()

  // Resetear cualquier estado de carga pendiente al montar la página
  useEffect(() => {
    resetAllLoadingStates()
  }, [resetAllLoadingStates])

  // Simular un recorrido guiado
  const startTour = () => {
    // En una implementación real, aquí se iniciaría un tour con una
    // biblioteca como Shepherd.js o react-joyride
    alert("Aquí se iniciaría el recorrido guiado de la aplicación")
  }

  // Definición de las secciones del sidebar
  const sidebarSections = [
    {
      id: "main-navigation",
      title: "Navegación Principal",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <Home className="h-4 w-4" />,
          href: "/dashboard"
        },
        {
          id: "inventory",
          label: "Inventario",
          icon: <Package className="h-4 w-4" />,
          href: "/dashboard/inventory"
        },
        {
          id: "suppliers",
          label: "Proveedores",
          icon: <ShoppingCart className="h-4 w-4" />,
          href: "/dashboard/suppliers"
        },
        {
          id: "users",
          label: "Usuarios",
          icon: <Users className="h-4 w-4" />,
          items: [
            {
              id: "users-list",
              label: "Lista de Usuarios",
              href: "/dashboard/users"
            },
            {
              id: "users-roles",
              label: "Roles y Permisos",
              href: "/dashboard/users/roles"
            }
          ]
        },
        {
          id: "layout",
          label: "Layout",
          icon: <LayoutGrid className="h-4 w-4" />,
          href: "/dashboard/layout"
        }
      ]
    }
  ]

  // Información del usuario
  const userInfo = {
    name: "María González",
    email: "maria@empresa.com",
    avatar: "/avatars/maria.jpg"
  }

  // Logo del sistema
  const logo = (
    <div className="flex items-center gap-2">
      <div className="bg-primary rounded-sm p-1">
        <Package className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-semibold">InvSystem</span>
    </div>
  )

  return (
    <MainLayout
      sidebarSections={sidebarSections}
      user={userInfo}
      logo={logo}
      activeItemId={activeItemId}
      onSidebarItemClick={(item) => setActiveItemId(item.id)}
    >
      <div className="space-y-md">
        {/* Grilla de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <DashboardStats isLoading={false} error={null} />
        </div>

        {/* Contenido principal */}
        <InventoryOverview
          isLoading={false}
          showWelcomeBanner={showWelcomeBanner}
          setShowWelcomeBanner={setShowWelcomeBanner}
          startTour={startTour}
        />
      </div>
    </MainLayout>
  )
}
