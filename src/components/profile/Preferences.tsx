'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Moon, Sun, Bell, Languages } from 'lucide-react';
import userService, { UserProfile } from '@/lib/api/user-service';

interface PreferencesProps {
  userProfile: UserProfile;
}

// Extendemos la interfaz de preferencias para incluir todas las propiedades que usamos
interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  language: string;
  colorScheme?: string;
  emailNotifications?: boolean;
  stockAlerts?: boolean;
}

export function Preferences({ userProfile }: PreferencesProps) {
  // Valores por defecto para las preferencias
  const defaultPreferences: UserPreferences = {
    darkMode: false,
    notifications: true,
    language: 'es',
    colorScheme: 'system',
    emailNotifications: false,
    stockAlerts: true
  };

  // Inicializamos con las preferencias del usuario o los valores por defecto
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...defaultPreferences,
    ...userProfile.preferences as UserPreferences,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Actualizamos el estado cuando cambian las props
  useEffect(() => {
    setPreferences({
      ...defaultPreferences,
      ...userProfile.preferences as UserPreferences,
    });
  }, [userProfile]);

  const handleSavePreferences = async () => {
    setIsSaving(true);

    try {
      // Llamar al servicio para actualizar las preferencias
      await userService.updateUserProfile({
        preferences,
      });

      toast.success('Preferencias guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      toast.error('Error al guardar las preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  // Función para manejar cambios en las opciones tipo checkbox
  const handleToggleOption = (option: keyof UserPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias</CardTitle>
        <CardDescription>
          Configura tus preferencias personales para la aplicación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Apariencia */}
        <div>
          <h3 className="text-lg font-medium mb-2">Apariencia</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4" />
                <Label htmlFor="dark-mode">Modo Oscuro</Label>
              </div>
              <input
                id="dark-mode"
                type="checkbox"
                checked={preferences.darkMode}
                onChange={() => handleToggleOption('darkMode')}
                className="h-4 w-4"
              />
            </div>

            <div className="space-y-2">
              <Label>Esquema de Color</Label>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="light"
                    name="colorScheme"
                    value="light"
                    checked={preferences.colorScheme === 'light'}
                    onChange={() => setPreferences({...preferences, colorScheme: 'light'})}
                  />
                  <Label htmlFor="light">Claro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="dark"
                    name="colorScheme"
                    value="dark"
                    checked={preferences.colorScheme === 'dark'}
                    onChange={() => setPreferences({...preferences, colorScheme: 'dark'})}
                  />
                  <Label htmlFor="dark">Oscuro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="system"
                    name="colorScheme"
                    value="system"
                    checked={preferences.colorScheme === 'system'}
                    onChange={() => setPreferences({...preferences, colorScheme: 'system'})}
                  />
                  <Label htmlFor="system">Seguir Sistema</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div>
          <h3 className="text-lg font-medium mb-2">Notificaciones</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="notifications">Notificaciones</Label>
              </div>
              <input
                id="notifications"
                type="checkbox"
                checked={preferences.notifications}
                onChange={() => handleToggleOption('notifications')}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Notificaciones por Email</Label>
              <input
                id="email-notifications"
                type="checkbox"
                checked={preferences.emailNotifications || false}
                onChange={() => handleToggleOption('emailNotifications')}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="stock-alerts">Alertas de Stock Bajo</Label>
              <input
                id="stock-alerts"
                type="checkbox"
                checked={preferences.stockAlerts || true}
                onChange={() => handleToggleOption('stockAlerts')}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Idioma */}
        <div>
          <h3 className="text-lg font-medium mb-2">Idioma</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Languages className="h-4 w-4" />
              <Label htmlFor="language">Idioma de la Aplicación</Label>
            </div>
            <Select
              value={preferences.language}
              onValueChange={(value) =>
                setPreferences({ ...preferences, language: value })
              }
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSavePreferences}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
        </Button>
      </CardFooter>
    </Card>
  );
}
