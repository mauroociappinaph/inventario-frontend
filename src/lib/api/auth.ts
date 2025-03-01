import api from './api';

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

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
}

// Servicio de autenticación
const authService = {
  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // api.post ya devuelve directamente response.data gracias al interceptor
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      // Guardar el token en localStorage
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  // Registrar un nuevo usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // api.post ya devuelve directamente response.data gracias al interceptor
      const response = await api.post<AuthResponse>('/auth/register', userData);

      // Guardar el token en localStorage si el registro incluye login automático
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }

      return response;
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
  getCurrentUser(): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null; // Para SSR
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};

export default authService;
