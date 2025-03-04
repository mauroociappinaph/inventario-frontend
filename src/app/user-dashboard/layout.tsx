"use client"

import { RoleRedirect } from '@/components/role-redirect'
import { Button } from "@/components/ui/button"
import { ConnectionAlert, ConnectionStatus } from '@/components/ui/ConnectionStatus'
import { ToastContainer } from '@/hooks/useToast'
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Recuperar tema guardado o usar preferencia del sistema
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    setTheme(savedTheme || (prefersDark ? "dark" : "light"))
  }, [])

  useEffect(() => {
    // Aplicar tema
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light")
  }

  return (
    <RoleRedirect adminOnly={false}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Alerta de conexión en la parte superior */}
        <ConnectionAlert />

        {/* Contenedor de notificaciones toast */}
        <ToastContainer />

        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
        </div>

        <main className="pt-4">
          {children}
        </main>

        {/* Estado de conexión y token en la esquina inferior derecha */}
        <ConnectionStatus />
      </div>
    </RoleRedirect>
  )
}
