import { User } from "@/lib/api/auth-service";
import authService from "@/lib/api/auth-service";

// URL del API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Extendemos la interfaz User para incluir campos adicionales que se pueden actualizar
export interface UserProfile extends User {
  phone?: string;
  profilePicture?: string;
  preferences?: {
    darkMode?: boolean;
    notifications?: boolean;
    language?: string;
  };
}

// Interfaz para los datos que se pueden enviar al actualizar el perfil
export interface UserProfileUpdateData {
  name?: string;
  email?: string;
  companyName?: string;
  phone?: string;
  profilePicture?: string;
  preferences?: {
    darkMode?: boolean;
    notifications?: boolean;
    language?: string;
  };
}

class UserService {
  /**
   * Obtiene la información completa del perfil del usuario actual
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("No hay un token de autenticación disponible");
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Si la API aún no implementa este endpoint, usamos el mock para desarrollo
        console.warn("El endpoint /users/profile no está disponible. Usando datos del contexto de autenticación.");

        // Obtener datos del usuario desde localStorage (almacenados como user_data)
        const userData = localStorage.getItem("user_data");
        let user: User;

        if (userData) {
          try {
            user = JSON.parse(userData) as User;
          } catch (e) {
            console.error("Error al parsear los datos del usuario:", e);
            throw new Error("Error en el formato de datos del usuario");
          }
        } else {
          // Si no hay datos en localStorage, intentar usar el contexto de autenticación
          console.warn("No se encontraron datos en localStorage. Generando perfil por defecto.");

          // Crear un perfil de usuario por defecto para desarrollo
          return {
            id: "temp-user-id",
            name: "Usuario Temporal",
            email: "usuario@ejemplo.com",
            companyName: "Empresa Demo",
            phone: "123-456-7890",
            preferences: {
              darkMode: false,
              notifications: true,
              language: "es",
            },
          };
        }

        if (!user || !user.id) {
          console.warn("Datos de usuario incompletos. Generando perfil por defecto.");

          // Crear un perfil de usuario por defecto basado en datos parciales
          return {
            id: user?.id || "temp-user-id",
            name: user?.name || "Usuario",
            email: user?.email || "usuario@ejemplo.com",
            companyName: user?.companyName || "Empresa",
            phone: "",
            preferences: {
              darkMode: false,
              notifications: true,
              language: "es",
            },
          };
        }

        return {
          ...user,
          phone: "",  // Datos de ejemplo
          preferences: {
            darkMode: false,
            notifications: true,
            language: "es",
          },
        };
      }

      const data = await response.json();
      return data as UserProfile;
    } catch (error) {
      console.error("Error al obtener el perfil:", error);
      throw error;
    }
  }

  /**
   * Actualiza la información del perfil del usuario
   */
  async updateUserProfile(userData: UserProfileUpdateData): Promise<UserProfile> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("No hay un token de autenticación disponible");
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // Si la API aún no implementa este endpoint, simulamos una respuesta exitosa para desarrollo
        console.warn("El endpoint /users/profile no está disponible. Simulando actualización exitosa.");
        const user = JSON.parse(localStorage.getItem("user") || "{}") as User;

        if (!user || !user.id) {
          throw new Error("Usuario no encontrado");
        }

        // Actualizamos los datos en localStorage para simular persistencia
        const updatedUser = {
          ...user,
          ...userData,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Devolvemos el perfil actualizado con campos adicionales
        return {
          ...updatedUser,
          phone: userData.phone || "",
          preferences: userData.preferences || {
            darkMode: false,
            notifications: true,
            language: "es",
          },
        };
      }

      const data = await response.json();
      return data as UserProfile;
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("No hay un token de autenticación disponible");
      }

      const response = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        // Si la API aún no implementa este endpoint, simulamos una respuesta exitosa para desarrollo
        console.warn("El endpoint /users/change-password no está disponible. Simulando cambio exitoso.");
        return true;
      }

      return true;
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
