"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Search,
  Home,
  Star,
  BarChart2,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  ShoppingCart,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Avatar } from "./ui/avatar"
import { InventoryChart } from "./inventory-chart"
import { InventoryTable } from "./inventory-table"
import { CircularProgress } from "./circular-progress"
import { Notifications } from "./notifications"
import { EnhancedSidebar, SidebarUserInfo } from "./enhanced-sidebar"
import { SidebarSection } from "@/stores/uiStore"
import { cn } from "../lib/utils"
import { useUIStore } from "@/stores/uiStore"
import { useAppNavigation } from "@/hooks/useAppNavigation"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)

  // Usar nuestros stores centralizados
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleMobileMenu,
    sidebarVariant,
    activeItemId,
  } = useUIStore()

  const { isDarkTheme, toggleTheme } = useAppTheme()
  const { navigateTo } = useAppNavigation()

  // Referencias para la detección de gestos de deslizamiento
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50; // Distancia mínima en píxeles para considerar un swipe

  // Simulamos que los datos se cargan después de 2 segundos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        setIsLoading(true)

        // Simulación de carga de datos
        await new Promise(resolve => setTimeout(resolve, 2000))

        // En una aplicación real, aquí iría la llamada a la API
        // const response = await fetch('/api/dashboard-data')
        // if (!response.ok) throw new Error('Error al cargar los datos del dashboard')
        // const data = await response.json()

        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
        setError(err instanceof Error ? err.message : 'Error al cargar los datos')
        console.error('Error cargando datos del dashboard:', err)
      }
    }

    fetchData()
  }, [])

  const startTour = () => {
    // Implementa la lógica para iniciar el tour
    console.log("Iniciando tour")
  }

  // Datos del usuario para el sidebar
  const userInfo: SidebarUserInfo = {
    name: "Usuario Demo",
    role: "Administrador",
    initials: "UD"
  }

  // Manejar clicks de los subitems con useCallback para evitar re-renderizados
  const handleProductList = useCallback(() => {
    navigateTo("/dashboard/products", "product-list")
  }, [navigateTo]);

  const handleProductCategories = useCallback(() => {
    navigateTo("/dashboard/products/categories", "product-categories")
  }, [navigateTo]);

  const handleProductInventory = useCallback(() => {
    navigateTo("/dashboard/inventory", "product-inventory")
  }, [navigateTo]);

  const handleUserList = useCallback(() => {
    navigateTo("/dashboard/users", "user-list")
  }, [navigateTo]);

  const handleUserRoles = useCallback(() => {
    navigateTo("/dashboard/users/roles", "user-roles")
  }, [navigateTo]);

  // Definición memoizada de las secciones y elementos del sidebar
  const sidebarSections = useCallback((): SidebarSection[] => [
    {
      id: "main",
      title: "Principal",
      items: [
        {
          id: "dashboard",
          icon: <Home className="h-4 w-4" />,
          label: "Dashboard",
          href: "/dashboard",
          badge: { count: 2, color: "bg-primary text-primary-foreground" }
        },
        {
          id: "stats",
          icon: <BarChart2 className="h-4 w-4" />,
          label: "Estadísticas",
          href: "/dashboard/stats"
        },
        {
          id: "products",
          icon: <Star className="h-4 w-4" />,
          label: "Productos",
          subItems: [
            { id: "product-list", label: "Listado", onClick: handleProductList },
            { id: "product-categories", label: "Categorías", onClick: handleProductCategories },
            { id: "product-inventory", label: "Inventario", onClick: handleProductInventory }
          ]
        },
        {
          id: "orders",
          icon: <ShoppingCart className="h-4 w-4" />,
          label: "Pedidos",
          href: "/dashboard/orders"
        },
        {
          id: "users",
          icon: <Users className="h-4 w-4" />,
          label: "Usuarios",
          badge: { count: 5, color: "bg-blue-500 text-white" },
          subItems: [
            { id: "user-list", label: "Listado", onClick: handleUserList },
            { id: "user-roles", label: "Roles y Permisos", onClick: handleUserRoles }
          ]
        }
      ]
    },
    {
      id: "system",
      title: "Sistema",
      items: [
        {
          id: "settings",
          icon: <Settings className="h-4 w-4" />,
          label: "Configuración",
          href: "/dashboard/settings"
        },
        {
          id: "help",
          icon: <MessageSquare className="h-4 w-4" />,
          label: "Ayuda",
          href: "/dashboard/help"
        }
      ]
    }
  ], [handleProductList, handleProductCategories, handleProductInventory, handleUserList, handleUserRoles]);

  // Manejadores de eventos para detectar gestos de deslizamiento
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchEndX.current - touchStartX.current;
    const isSwipe = Math.abs(distance) > minSwipeDistance;

    if (isSwipe) {
      // Deslizamiento de izquierda a derecha (abrir menú)
      if (distance > 0 && !mobileMenuOpen) {
        toggleMobileMenu();
        announceMenuChange(true);
      }
      // Deslizamiento de derecha a izquierda (cerrar menú)
      else if (distance < 0 && mobileMenuOpen) {
        toggleMobileMenu();
        announceMenuChange(false);
      }
    }

    // Resetear las posiciones
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Crear un anuncio accesible para cambios de menú
  const announceMenuChange = (isOpen: boolean) => {
    const message = isOpen ? "Menú abierto" : "Menú cerrado";

    // Usar un div aria-live para anunciar cambios a lectores de pantalla
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.classList.add('sr-only'); // Oculto visualmente
    liveRegion.textContent = message;

    document.body.appendChild(liveRegion);

    // Eliminar después de ser anunciado
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  };

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden",
        isDarkTheme ? "dark" : ""
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar para móvil - se muestra como modal cuando mobileMenuOpen es true */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <EnhancedSidebar
            sections={sidebarSections()}
            userInfo={userInfo}
            isMobile={true}
            onClose={() => setMobileMenuOpen(false)}
            selectedItemId={activeItemId}
          />
        </div>
      )}

      {/* Sidebar para desktop - siempre visible */}
      <div className="hidden lg:block">
        <EnhancedSidebar
          variant={sidebarVariant as "default" | "compact"}
          sections={sidebarSections()}
          userInfo={userInfo}
          selectedItemId={activeItemId}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <header className="border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            {/* Botón de menú en móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() => {
                toggleMobileMenu();
                announceMenuChange(!mobileMenuOpen);
              }}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Búsqueda */}
            <div className="relative ml-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-8 w-[200px] sm:w-[300px] rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Botón de tema */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notificaciones */}
            <Button variant="ghost" size="icon" aria-label="Ver notificaciones">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Avatar del usuario - ahora usando el componente correcto */}
            <Avatar
              initials="UD"
              size="sm"
              alt="Usuario Demo"
            />
          </div>
        </header>

        {/* Contenido del dashboard */}
        <main className="flex-1 overflow-auto p-4 pb-0">
          {/* Banner de bienvenida - se puede ocultar */}
          {showWelcomeBanner && (
            <div className="rounded-lg border bg-card text-card-foreground shadow mb-6 relative">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-primary">
                    ¡Bienvenido al Dashboard!
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowWelcomeBanner(false)}
                    aria-label="Cerrar mensaje de bienvenida"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">
                  Este es tu nuevo panel de control. Puedes personalizar esta vista según tus necesidades.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={startTour}>
                  Comenzar Tour
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Esqueletos de carga */}
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
              <h2 className="text-lg font-semibold text-destructive mb-2">Error al cargar los datos</h2>
              <p className="text-destructive/90 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjeta de vista general */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Resumen del Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  <InventoryChart />
                </CardContent>
              </Card>

              {/* Tarjeta de estadísticas */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="flex items-center gap-4">
                    <CircularProgress value={78} size="md" variant="primary" />
                    <div>
                      <div className="text-2xl font-bold">78%</div>
                      <div className="text-sm text-muted-foreground">
                        Nivel de stock
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CircularProgress value={23} size="md" variant="destructive" />
                    <div>
                      <div className="text-2xl font-bold">23%</div>
                      <div className="text-sm text-muted-foreground">
                        Productos por reordenar
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CircularProgress value={92} size="md" variant="success" />
                    <div>
                      <div className="text-2xl font-bold">92%</div>
                      <div className="text-sm text-muted-foreground">
                        Pedidos completados
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta de movimientos recientes */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Movimientos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <InventoryTable />
                </CardContent>
              </Card>

              {/* Tarjeta de notificaciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <Notifications />
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

