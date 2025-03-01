"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  MoreVertical,
  Home,
  Heart,
  Star,
  BarChart2,
  MessageSquare,
  MapPin,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  ClipboardList,
  LayoutDashboard,
  Sidebar,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { InventoryChart } from "./inventory-chart"
import { InventoryTable } from "./inventory-table"
import { CircularProgress } from "./circular-progress"
import { Notifications } from "./notifications"
import { EnhancedSidebar, SidebarSection, SidebarUserInfo } from "./enhanced-sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select"
import { VirtualList } from "./virtual-list"
import { cn } from "../lib/utils"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)
  const [activeItemId, setActiveItemId] = useState("dashboard")
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "compact" | "expanded">("default")

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

  // Efecto para obtener preferencias de tema y sidebar del localStorage
  useEffect(() => {
    // Restaurar la preferencia de tema
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkTheme(true)
      document.documentElement.classList.add("dark")
    }

    // Restaurar la preferencia de sidebar
    const savedSidebarVariant = localStorage.getItem("sidebarVariant") as "default" | "compact" | "expanded" | null
    if (savedSidebarVariant) {
      setSidebarVariant(savedSidebarVariant)
    }
  }, [])

  const toggleTheme = () => {
    const newThemeState = !isDarkTheme
    setIsDarkTheme(newThemeState)

    if (newThemeState) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

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

  // Optimizar los callbacks con useCallback para evitar re-renderizados innecesarios
  const handleItemClick = useCallback((itemId: string) => {
    setActiveItemId(itemId)
    // En móvil, cerrar el menú después de seleccionar
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
    console.log(`Navegando a: ${itemId}`)
    // En una aplicación real, aquí se manejaría la navegación
  }, [mobileMenuOpen]);

  // Manejar clicks de los subitems con useCallback para evitar re-renderizados
  const handleProductList = useCallback(() => {
    setActiveItemId("product-list");
    console.log("Listado de productos");
  }, []);

  const handleProductCategories = useCallback(() => {
    setActiveItemId("product-categories");
    console.log("Categorías de productos");
  }, []);

  const handleProductInventory = useCallback(() => {
    setActiveItemId("product-inventory");
    console.log("Inventario de productos");
  }, []);

  const handleUserList = useCallback(() => {
    setActiveItemId("user-list");
    console.log("Listado de usuarios");
  }, []);

  const handleUserRoles = useCallback(() => {
    setActiveItemId("user-roles");
    console.log("Roles y permisos");
  }, []);

  // Optimizar el cambio de sidebar con useCallback
  const toggleSidebarVariant = useCallback(() => {
    const newVariant = sidebarVariant === "default" ? "compact" : "default"
    setSidebarVariant(newVariant)
    localStorage.setItem("sidebarVariant", newVariant)
  }, [sidebarVariant]);

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
          badge: { count: 2, color: "bg-primary text-primary-foreground" }
        },
        {
          id: "stats",
          icon: <BarChart2 className="h-4 w-4" />,
          label: "Estadísticas"
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
      ]
    },
    {
      id: "management",
      title: "Gestión",
      items: [
        {
          id: "suppliers",
          icon: <Heart className="h-4 w-4" />,
          label: "Proveedores",
          onClick: () => setActiveItemId("suppliers")
        },
        {
          id: "orders",
          icon: <MessageSquare className="h-4 w-4" />,
          label: "Pedidos",
          badge: { count: 5, color: "bg-destructive text-destructive-foreground" },
          onClick: () => setActiveItemId("orders")
        },
        {
          id: "locations",
          icon: <MapPin className="h-4 w-4" />,
          label: "Ubicaciones",
          onClick: () => setActiveItemId("locations")
        },
        {
          id: "users",
          icon: <Users className="h-4 w-4" />,
          label: "Usuarios",
          onClick: () => setActiveItemId("users"),
          subItems: [
            { id: "user-list", label: "Listado", onClick: handleUserList },
            { id: "user-roles", label: "Roles y Permisos", onClick: handleUserRoles }
          ]
        },
      ]
    },
    {
      id: "commerce",
      title: "Comercio",
      items: [
        {
          id: "sales",
          icon: <ShoppingCart className="h-4 w-4" />,
          label: "Ventas",
          onClick: () => setActiveItemId("sales")
        },
        {
          id: "packages",
          icon: <Package className="h-4 w-4" />,
          label: "Paquetes",
          onClick: () => setActiveItemId("packages")
        },
        {
          id: "reports",
          icon: <ClipboardList className="h-4 w-4" />,
          label: "Informes",
          onClick: () => setActiveItemId("reports")
        },
      ]
    }
  ], [
    handleProductList,
    handleProductCategories,
    handleProductInventory,
    handleUserList,
    handleUserRoles
  ]);

  // Footer personalizado para el sidebar
  const sidebarFooter = (
    <div className="flex gap-sm">
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 justify-center text-dim-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-standard"
        aria-label="Configuración"
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 justify-center text-dim-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-standard"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 justify-center text-dim-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-standard"
        aria-label="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* EnhancedSidebar - Desktop */}
      <div className="hidden md:block">
        <EnhancedSidebar
          sections={sidebarSections()}
          userInfo={userInfo}
          activeItemId={activeItemId}
          onItemClick={handleItemClick}
          footerContent={sidebarFooter}
          variant={sidebarVariant}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <EnhancedSidebar
            isMobile={true}
            onClose={() => setMobileMenuOpen(false)}
            sections={sidebarSections()}
            userInfo={userInfo}
            activeItemId={activeItemId}
            onItemClick={handleItemClick}
            footerContent={sidebarFooter}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center gap-md spacing-x-md bg-card flex-shrink-0">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="transition-standard"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-sm top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-10 bg-muted/40 border-none h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar en la aplicación"
            />
          </div>

          <div className="flex items-center gap-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 transition-standard"
              onClick={toggleSidebarVariant}
              aria-label="Cambiar vista de sidebar"
            >
              <Sidebar className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 transition-standard"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" aria-hidden="true"></span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 transition-standard"
              onClick={toggleTheme}
              aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg" alt={userInfo.name} />
              <AvatarFallback>{userInfo.initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto spacing-md max-w-7xl">
            {showWelcomeBanner && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg spacing-md mb-lg relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-sm right-sm transition-standard"
                  onClick={() => setShowWelcomeBanner(false)}
                  aria-label="Cerrar banner"
                >
                  <X className="h-4 w-4" />
                </Button>
                <h3 className="text-base font-medium mb-sm">¡Bienvenido a InvSystem!</h3>
                <p className="text-sm text-muted-foreground mb-md">
                  Esta es tu nueva interfaz de gestión de inventario. ¿Te gustaría un recorrido rápido?
                </p>
                <div className="flex flex-wrap gap-sm">
                  <Button size="sm" onClick={() => startTour()} className="transition-standard">
                    Iniciar recorrido
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowWelcomeBanner(false)} className="transition-standard">
                    Omitir
                  </Button>
                </div>
              </div>
            )}

            <div className="section-spacing">
              <h1 className="text-2xl font-bold mb-xs">Dashboard</h1>
              <p className="text-muted-foreground">Bienvenido de nuevo, aquí tienes un resumen de tu inventario</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md section-spacing">
              {error ? (
                <Card className="col-span-full border-destructive bg-destructive/10 transition-standard">
                  <CardContent className="card-padding flex items-center gap-md">
                    <div className="rounded-full p-2 bg-destructive/20 text-destructive">
                      <X className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Error al cargar los datos</h3>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto border-destructive text-destructive hover:bg-destructive/10 transition-standard"
                      onClick={() => window.location.reload()}
                    >
                      Reintentar
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Total Products */}
                  <Card className="transition-standard">
                    <CardHeader className="card-header">
                      <CardTitle className="text-base font-medium">Productos Registrados</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Comparado con el período anterior
                      </div>
                    </CardHeader>
                    <CardContent className="card-content">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">2.200.150</div>
                          <div className="flex gap-sm mt-xs">
                            <div className="text-sm text-emerald-500 flex items-center">
                              <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                              <span>12.5%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">este mes</div>
                          </div>
                        </div>
                        <div className="w-20 h-20 flex-shrink-0">
                          <CircularProgress value={80} color="var(--primary)" size={80} />
                          <div className="text-xs text-center mt-xs">Rendimiento</div>
                        </div>
                      </div>
                      <div className="h-10 mt-sm">
                        {/* Gráfico de tendencia */}
                        <div className="flex items-end h-full gap-[2px]">
                          {[40, 25, 35, 30, 45, 35, 55, 40, 60, 45, 70, 55, 80].map((value, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-primary/20 rounded-sm transition-standard"
                              style={{ height: `${value}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stock Level */}
                  <Card className="transition-standard">
                    <CardHeader className="card-header">
                      <CardTitle className="text-base font-medium">Nivel de Stock</CardTitle>
                    </CardHeader>
                    <CardContent className="card-content">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">1.941.000</div>
                          <div className="text-sm text-rose-500 flex items-center mt-xs">
                            <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span>8.3% este mes</span>
                          </div>
                        </div>
                        <div className="w-14 h-14 flex-shrink-0">
                          <CircularProgress value={75} color="var(--destructive)" size={56} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Card */}
                  <Card className="transition-standard">
                    <CardHeader className="card-header">
                      <CardTitle className="text-base font-medium">Ganancias</CardTitle>
                    </CardHeader>
                    <CardContent className="card-content">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">12.123$</div>
                          <div className="text-sm text-emerald-500 flex items-center mt-xs">
                            <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <span>23.1% este mes</span>
                          </div>
                        </div>
                        <div className="w-14 h-14 flex-shrink-0">
                          <CircularProgress value={65} color="var(--chart-1)" size={56} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
              {/* Inventory Movement Chart */}
              <Card className="lg:col-span-8 transition-standard">
                <CardHeader className="flex flex-row items-center justify-between card-padding">
                  <CardTitle className="text-base font-medium">Movimiento de Inventario</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-standard"
                    aria-label="Opciones de gráfico"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="spacing-md pt-0">
                  {isLoading ? (
                    <div className="animate-pulse space-y-md">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-80 bg-muted rounded"></div>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <InventoryChart />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions & Notifications */}
              <div className="lg:col-span-4 grid grid-cols-1 gap-md">
                <Card className="transition-standard">
                  <CardHeader className="flex flex-row items-center justify-between card-padding">
                    <CardTitle className="text-base font-medium">Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-sm card-padding pt-0">
                    <Button size="sm" className="transition-standard">Nuevo Producto</Button>
                    <Button size="sm" variant="outline" className="transition-standard">Exportar Datos</Button>
                    <Button size="sm" variant="secondary" className="transition-standard">Generar Reporte</Button>
                    <Button size="sm" variant="outline" className="transition-standard">Configurar Alertas</Button>
                  </CardContent>
                </Card>

                <Card className="transition-standard">
                  <CardHeader className="flex flex-row items-center justify-between card-padding">
                    <CardTitle className="text-base font-medium">Notificaciones</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 transition-standard"
                      aria-label="Opciones de notificaciones"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="card-padding pt-0 max-h-[200px] overflow-auto">
                    <Notifications />
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card className="lg:col-span-12 transition-standard">
                <CardHeader className="flex flex-row items-center justify-between card-padding">
                  <CardTitle className="text-base font-medium">Detalle de Inventario</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-standard"
                    aria-label="Opciones de inventario"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="card-padding pt-0">
                  <div className="flex flex-wrap gap-sm mb-md">
                    <Input placeholder="Filtrar por nombre" className="max-w-[200px]" />
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="electronica">Electrónica</SelectItem>
                        <SelectItem value="ropa">Ropa</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="transition-standard">Aplicar Filtros</Button>
                  </div>
                  <div className="overflow-x-auto">
                    {isLoading ? (
                      <div className="animate-pulse space-y-sm">
                        <div className="h-8 bg-muted rounded w-full mb-sm"></div>
                        <div className="h-8 bg-muted/80 rounded w-full mb-sm"></div>
                        <div className="h-8 bg-muted/60 rounded w-full mb-sm"></div>
                        <div className="h-8 bg-muted/40 rounded w-full mb-sm"></div>
                      </div>
                    ) : (
                      <InventoryTable />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-sm mt-md">
                    <Button size="sm" className="bg-primary hover:bg-primary-hover transition-standard">
                      Agregar Producto
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 transition-standard">
                      Eliminar Seleccionados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

