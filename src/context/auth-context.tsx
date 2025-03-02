'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User } from '@/lib/api/auth-service';

// Definición del tipo para el contexto
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<void>;
  logout: (redirect?: boolean) => void;
  error: string | null;
  isAdmin: boolean;
}

// Crear el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  isAdmin: false,
});

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Función para cargar el usuario actual desde localStorage o cookies
  const loadUser = async () => {
    try {
      setLoading(true);
      // Verificar si hay un token válido
      if (authService.isAuthenticated()) {
        // Obtener el usuario del almacenamiento local
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);

          // Verificar si el usuario tiene rol de administrador
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
          const userRoles = userData.roles || [];
          setIsAdmin(userRoles.includes('admin'));
        }
      }
    } catch (err) {
      console.error('Error al cargar el usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar el usuario al iniciar
  useEffect(() => {
    loadUser();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login({ email, password });

      // Cargar el usuario con los datos nuevos
      await loadUser();

      return response;
    } catch (err) {
      console.error('Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);

      if (response.user) {
        setUser(response.user);
      } else {
        // Si la respuesta no incluye el usuario, intentamos cargarlo
        loadUser();
      }
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);

      // Extraer mensaje de error más específico si está disponible
      let errorMessage = 'Error al registrar usuario';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = (redirect = true) => {
    authService.logout(false); // No redirigir desde el servicio
    setUser(null);

    // Si se solicita redirección, hacerlo desde el contexto
    if (redirect) {
      // Usar setTimeout para asegurar que el estado se actualice primero
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    error,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
