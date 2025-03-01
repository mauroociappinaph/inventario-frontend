"use client"

import { useState } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "./ui/button"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  time: string
  read: boolean
}

const sampleNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Stock Bajo",
    message: "El producto Monitor Samsung 24' está por debajo del umbral mínimo (12 unidades)",
    type: "warning",
    time: "hace 10 minutos",
    read: false
  },
  {
    id: "notif-2",
    title: "Pedido Recibido",
    message: "Se ha recibido un nuevo pedido de Laptops HP (30 unidades)",
    type: "success",
    time: "hace 1 hora",
    read: false
  },
  {
    id: "notif-3",
    title: "Inventario Actualizado",
    message: "El inventario ha sido actualizado correctamente",
    type: "info",
    time: "hace 3 horas",
    read: true
  },
  {
    id: "notif-4",
    title: "Error en Sincronización",
    message: "No se pudo sincronizar el inventario con el sistema central",
    type: "error",
    time: "hace 1 día",
    read: true
  }
]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  // Eliminar notificación
  const removeNotification = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notif => notif.id !== id)
    )
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notif => ({ ...notif, read: true }))
    )
  }

  // Obtener color según tipo de notificación
  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "text-blue-500 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300"
      case "warning":
        return "text-amber-500 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300"
      case "success":
        return "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"
      case "error":
        return "text-rose-500 bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
    }
  }

  // Obtener icono según tipo de notificación
  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return (
          <Bell className="h-4 w-4" />
        )
      case "warning":
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case "success":
        return (
          <Check className="h-4 w-4" />
        )
      case "error":
        return (
          <X className="h-4 w-4" />
        )
    }
  }

  // Si no hay notificaciones
  if (notifications.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No hay notificaciones</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {notifications.length > 0 && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">
            {notifications.filter(n => !n.read).length} no leídas
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 hover:bg-muted transition-standard"
            onClick={markAllAsRead}
          >
            Marcar todas como leídas
          </Button>
        </div>
      )}

      <div className="space-y-2 max-h-[250px] overflow-auto pr-1">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-md border ${
              notification.read ? 'bg-muted/20 border-border' : 'bg-card border-border'
            } transition-standard`}
          >
            <div className="flex gap-3">
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                {getTypeIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : ''}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
              </div>

              <div className="flex flex-col gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-muted"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground"
                  onClick={() => removeNotification(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

