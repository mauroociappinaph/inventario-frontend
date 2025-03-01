"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Alert } from '@/components/ui/alert'

// Definimos los tipos de notificación
export type NotificationType = 'success' | 'warning' | 'error' | 'info'

// Interfaz para una notificación
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  dismissible?: boolean
}

// Interfaz para el contexto
interface NotificationContextType {
  // Métodos para mostrar diferentes tipos de notificaciones
  success: (title: string, message: string, duration?: number) => void
  error: (title: string, message: string, duration?: number) => void
  warning: (title: string, message: string, duration?: number) => void
  info: (title: string, message: string, duration?: number) => void
  // Método genérico para mostrar cualquier tipo de notificación
  notify: (type: NotificationType, title: string, message: string, duration?: number) => void
  // Método para cerrar una notificación
  dismiss: (id: string) => void
  // Estado actual de notificaciones
  notifications: Notification[]
}

// Creamos el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Proveedor del contexto de notificaciones
export const NotificationProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // Estado para almacenar las notificaciones activas
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Función para generar un ID único
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }, [])

  // Método genérico para crear notificaciones
  const notify = useCallback(
    (type: NotificationType, title: string, message: string, duration = 5000) => {
      const id = generateId()
      const newNotification: Notification = {
        id,
        type,
        title,
        message,
        duration,
        dismissible: true,
      }

      setNotifications((prevNotifications) => [...prevNotifications, newNotification])

      // Configuramos un temporizador para eliminar la notificación después de la duración especificada
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }

      return id
    },
    [generateId]
  )

  // Métodos específicos para diferentes tipos de notificaciones
  const success = useCallback(
    (title: string, message: string, duration?: number) => {
      return notify('success', title, message, duration)
    },
    [notify]
  )

  const error = useCallback(
    (title: string, message: string, duration?: number) => {
      return notify('error', title, message, duration)
    },
    [notify]
  )

  const warning = useCallback(
    (title: string, message: string, duration?: number) => {
      return notify('warning', title, message, duration)
    },
    [notify]
  )

  const info = useCallback(
    (title: string, message: string, duration?: number) => {
      return notify('info', title, message, duration)
    },
    [notify]
  )

  // Método para eliminar una notificación
  const dismiss = useCallback((id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    )
  }, [])

  // Renderizamos el componente de notificaciones
  const renderNotifications = () => {
    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            variant={notification.type}
            title={notification.title}
            dismissible={notification.dismissible}
            onDismiss={() => dismiss(notification.id)}
            className="shadow-lg"
          >
            {notification.message}
          </Alert>
        ))}
      </div>
    )
  }

  // Valor del contexto
  const contextValue: NotificationContextType = {
    success,
    error,
    warning,
    info,
    notify,
    dismiss,
    notifications,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {renderNotifications()}
    </NotificationContext.Provider>
  )
}

// Hook personalizado para usar el contexto de notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider')
  }
  return context
}
