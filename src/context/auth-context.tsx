'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User } from '@/lib/api/auth-service';

// Definición del tipo para el contexto
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  error: string | null;
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
});

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        }
      }
    } catch (err) {
      console.error('Error al cargar el usuario:', err);
      setError('Error al cargar los datos del usuario');
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
      setLoading(true);
      setError(null);
      const response = await authService.login({ email, password });

      if (response.user) {
        setUser(response.user);
      } else {
        // Si la respuesta no incluye el usuario, intentamos cargarlo
        loadUser();
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);

      // Extraer mensaje de error más específico si está disponible
      let errorMessage = 'Error al iniciar sesión';

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
  const logout = () => {
    authService.logout();
    setUser(null);
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
