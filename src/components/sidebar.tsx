import { Home, BarChart2, Star, Heart, MessageSquare, MapPin, Settings, LogOut, X } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type SidebarProps = {
  isMobile?: boolean
  onClose?: () => void
}

type SidebarItem = {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

type SidebarSection = {
  title: string
  items: SidebarItem[]
}

export function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  // Datos de ejemplo - en una aplicación real estos podrían venir de props o un contexto
  const sections: SidebarSection[] = [
    {
      title: "Principal",
      items: [
        { icon: <Home className="h-4 w-4 mr-3" />, label: "Dashboard", active: true },
        { icon: <BarChart2 className="h-4 w-4 mr-3" />, label: "Estadísticas" },
        { icon: <Star className="h-4 w-4 mr-3" />, label: "Productos" },
      ]
    },
    {
      title: "Gestión",
      items: [
        { icon: <Heart className="h-4 w-4 mr-3" />, label: "Proveedores" },
        { icon: <MessageSquare className="h-4 w-4 mr-3" />, label: "Pedidos" },
        { icon: <MapPin className="h-4 w-4 mr-3" />, label: "Ubicaciones" },
      ]
    }
  ]

  // Componente para el contenido del sidebar (usado tanto en móvil como en escritorio)
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
            IS
          </div>
          <span className="text-lg font-semibold">InvSystem</span>
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="px-3 mb-6">
            <p className="text-xs uppercase text-sidebar-foreground/50 font-semibold mb-2 px-3">
              {section.title}
            </p>
            {section.items.map((item, itemIndex) => (
              <Button
                key={itemIndex}
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${item.active
                  ? 'text-sidebar-foreground'
                  : 'text-sidebar-foreground/70'} hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1`}
                onClick={item.onClick}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Usuario" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Usuario Demo</p>
            <p className="text-xs text-sidebar-foreground/60">Administrador</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="flex-1 justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  // Renderizado condicional basado en si es móvil o escritorio
  if (isMobile) {
    return (
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-sidebar text-sidebar-foreground p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
              IS
            </div>
            <span className="text-lg font-semibold">InvSystem</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent />
      </div>
    )
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <SidebarContent />
    </aside>
  )
}
