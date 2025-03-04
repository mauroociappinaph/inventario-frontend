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

// Función para decodificar el token JWT y extraer su información
// No valida la firma, solo extrae los datos
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al parsear token JWT:', error);
    return null;
  }
}

// Servicio de autenticación
const authService = {
  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Intentando iniciar sesión con:', credentials.email);
      const response = await api.post<any>('/auth/login', credentials);
      console.log('Respuesta login:', response.data);

      // Adaptar la estructura de respuesta
      let authData: AuthResponse;

      if (response.data.data && response.data.data.token) {
        // Si la respuesta tiene un estructura como { statusCode, message, data: { token, user } }
        authData = {
          token: response.data.data.token,
          user: response.data.data.user
        };
      } else {
        // Si la respuesta ya tiene el formato esperado
        authData = response.data;
      }
       if (authData.user && authData.user.roles) {
      if (authData.user.roles.includes('usuario')) {
        console.log('El usuario tiene rol "usuario". Iniciando sesión como usuario.');
        // Por ejemplo, redirigir al dashboard de usuario:
        window.location.href = '/user-dashboard';
      } else if (authData.user.roles.includes('admin')) {
        console.log('El usuario tiene rol "admin". Iniciando sesión como administrador.');
        // Por ejemplo, redirigir al dashboard de admin:
        window.location.href = '/dashboard';
        }
      }

      this.saveAuthData(authData);
      return authData;
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
        // Asegurarse de que el usuario tenga un campo 'id' (convertir _id a id si es necesario)
        const userData = authData.user;
        if ((userData as any)._id && !userData.id) {
          (userData as any).id = (userData as any)._id;
        }

        localStorage.setItem('user_data', JSON.stringify(userData));
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

    // Verificar si el token existe
    if (!localToken && !cookieToken) return false;

    // Si existe, verificar si está expirado
    const token = localToken || cookieToken;
    if (token) {
      const isExpired = this.isTokenExpired(token);
      // Si está expirado o está próximo a expirar, renovar automáticamente en segundo plano
      if (isExpired || this.isTokenExpiringSoon(token)) {
        console.log('Token expirado o próximo a expirar, iniciando renovación automática');
        // Intentar renovar automáticamente en segundo plano (sin esperar)
        this.refreshToken().catch(err => {
          console.error('Error al renovar token automáticamente:', err);
          // No hacemos logout aquí para permitir reintento más tarde
        });
      }

      // Consideramos como autenticado incluso si está próximo a expirar
      // porque la renovación ocurrirá en segundo plano
      return !isExpired;
    }

    return false;
  },

  // Verificar si el token JWT está expirado
  isTokenExpired(token: string): boolean {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;

    // La expiración está en segundos, multiplicar por 1000 para obtener milisegundos
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    // Si el token expira en menos de 5 minutos, considerarlo como "a punto de expirar"
    const timeToExpire = expirationTime - currentTime;
    const isExpiredOrAlmostExpired = timeToExpire < 5 * 60 * 1000; // 5 minutos

    if (isExpiredOrAlmostExpired) {
      console.log(`Token expirará en ${timeToExpire / 1000} segundos`);
    }

    return isExpiredOrAlmostExpired;
  },

  // Nuevo método para verificar si el token está próximo a expirar (5 minutos)
  isTokenExpiringSoon(token: string): boolean {
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

    const token = localToken || cookieToken || null;

    // Si el token existe pero está a punto de expirar, intentar renovarlo
    if (token && this.isTokenExpired(token)) {
      console.log('Token próximo a expirar, renovando silenciosamente');
      // Iniciar renovación en background (sin esperar)
      this.refreshToken().catch(err => {
        console.error('Error al renovar token automáticamente:', err);
      });
    }

    return token;
  },

  // Renovar el token JWT
  async refreshToken(): Promise<AuthResponse> {
    if (typeof window === 'undefined') {
      return Promise.reject('No se puede renovar token en el servidor');
    }

    try {
      console.log('Iniciando renovación de token...');

      const currentToken = this.getToken();
      if (!currentToken) {
        console.error('No hay token para renovar');
        return Promise.reject('No hay token disponible para renovar');
      }

      // Realizar la petición al endpoint de renovación
      const response = await axios.get<any>(`${API_URL}/auth/refresh-token`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Respuesta de renovación de token:', response.data);

      // Extraer datos de la respuesta
      let authData: AuthResponse;

      if (response.data.data && response.data.data.token) {
        // Estructura con wrapper
        authData = {
          token: response.data.data.token,
          user: response.data.data.user
        };
      } else {
        // Estructura directa
        authData = response.data;
      }

      // Guardar el nuevo token
      this.saveAuthData(authData);
      console.log('Token renovado y guardado exitosamente');

      return authData;
    } catch (error: unknown) {
      console.error('Error al renovar token:', error);

      // Si hay un error 401, el token ya no es válido para renovar
      if (error instanceof Error && (error as any).response && (error as any).response.status === 401) {
        console.log('Token no válido para renovación');
        // Solo limpiamos el token, pero no redirigimos automáticamente
        // para permitir que el interceptor maneje esto apropiadamente
        this.logout(false);
      }

      return Promise.reject(error);
    }
  }
};

export default authService;
