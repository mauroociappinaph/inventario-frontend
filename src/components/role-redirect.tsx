"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import authService from '@/lib/api/auth-service'

interface RoleRedirectProps {
  children: React.ReactNode
  adminOnly?: boolean
}

// Este componente verifica el rol del usuario y redirecciona según corresponda
export function RoleRedirect({ children, adminOnly = false }: RoleRedirectProps) {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Solo realizar la redirección si ya terminó la carga inicial
    if (!loading) {
      // Si no está autenticado, redirigir a login
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      const currentUser = authService.getCurrentUser()
      const userData = currentUser ? JSON.parse(localStorage.getItem('user_data') || '{}') : {}

      // Verificar si el usuario tiene roles almacenados localmente
      // En una implementación real, esto debería venir del token JWT o de una API
      const userRoles = userData.roles || []
      const isAdmin = userRoles.includes('admin')

      // Si la página requiere admin pero el usuario no lo es
      if (adminOnly && !isAdmin) {
        router.push('/user-dashboard')
        return
      }

      // Si la página es para usuarios normales pero el usuario es admin
      if (!adminOnly && isAdmin) {
        router.push('/dashboard')
        return
      }
    }
  }, [isAuthenticated, loading, router, adminOnly])

  // Mientras verifica, no mostrar nada
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Renderizar los hijos solo si el usuario tiene el rol adecuado
  return <>{children}</>
}
