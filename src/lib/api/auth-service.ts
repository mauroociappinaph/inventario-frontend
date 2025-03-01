import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tipos para los datos de autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  initials?: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Servicio de autenticación
const authService = {
  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
      const data = response.data;

      // Guardar el token en localStorage
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  // Registrar un nuevo usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, userData);
      const data = response.data;

      // Guardar el token en localStorage si el registro incluye login automático
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    // Opcional: redirigir a la página de inicio o login
    window.location.href = '/login';
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false; // Para SSR
    return localStorage.getItem('auth_token') !== null;
  },

  // Obtener el usuario actual
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null; // Para SSR
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Obtener el token de autenticación
  getToken(): string | null {
    if (typeof window === 'undefined') return null; // Para SSR
    return localStorage.getItem('auth_token');
  }
};

export default authService;
