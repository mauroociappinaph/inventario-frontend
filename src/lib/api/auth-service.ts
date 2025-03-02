import axios from 'axios';
import Cookies from 'js-cookie';

// Configuración base de axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Configurar axios para obtener mejores mensajes de error
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para transformar la respuesta de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en petición API:', error);

    // Extraer el mensaje de error más útil para el usuario
    let errorMessage = 'Error en la petición';

    if (error.response) {
      // El servidor respondió con un código de error
      console.log('Respuesta de error:', error.response.data);

      if (error.response.data.message) {
        if (Array.isArray(error.response.data.message)) {
          // Si el mensaje es un array (validación de class-validator)
          errorMessage = error.response.data.message[0];
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      errorMessage = 'No se recibió respuesta del servidor';
    } else {
      // Algo ocurrió al configurar la petición
      errorMessage = error.message;
    }

    // Crear un error personalizado con mensaje claro
    const customError = {
      name: error.name || 'Error',
      message: errorMessage,
      response: error.response || null,
      request: error.request || null,
    };

    return Promise.reject(customError);
  }
);

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
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  user?: User;
}

// Tiempo de expiración de la cookie en días (7 días por defecto)
const COOKIE_EXPIRY_DAYS = 7;

// Servicio de autenticación
const authService = {
  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Intentando iniciar sesión con:', credentials.email);
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Respuesta login:', response.data);

      this.saveAuthData(response.data);

      return response.data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  saveAuthData(authData: AuthResponse): void {
    // Guardar el token en localStorage y cookies
    if (authData.token) {
      // Guardar en localStorage
      localStorage.setItem('auth_token', authData.token);

      // Si hay datos de usuario, guardarlos también
      if (authData.user) {
        localStorage.setItem('user_data', JSON.stringify(authData.user));
      }

      // Guardar en cookies para que sea accesible por el middleware
      Cookies.set('auth_token', authData.token, {
        expires: COOKIE_EXPIRY_DAYS,
        path: '/',
        sameSite: 'strict'
      });
    }
  },

  // Registrar nuevo usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Intentando registrar usuario:', userData.email);
      const response = await api.post<any>('/auth/register', userData);
      console.log('Respuesta registro:', response.data);

      const data = response.data.data || response.data;

      // Guardar el token en localStorage y cookies
      if (data.token) {
        // Guardar en localStorage
        localStorage.setItem('auth_token', data.token);

        // Si hay datos de usuario, guardarlos también
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }

        // Guardar en cookies
        Cookies.set('auth_token', data.token, {
          expires: COOKIE_EXPIRY_DAYS,
          path: '/',
          sameSite: 'strict'
        });
      }

      return data;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout(redirect = false): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Eliminar también la cookie
    Cookies.remove('auth_token', { path: '/' });

    // Opcional: redirigir a la página de inicio o login, solo si se solicita
    if (redirect) {
      window.location.href = '/login';
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false; // Para SSR

    const localToken = localStorage.getItem('auth_token');
    const cookieToken = Cookies.get('auth_token');

    return localToken !== null || cookieToken !== undefined;
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

    // Intentar obtener primero de localStorage, luego de cookies
    const localToken = localStorage.getItem('auth_token');
    const cookieToken = Cookies.get('auth_token');

    return localToken || cookieToken || null;
  }
};

export default authService;
