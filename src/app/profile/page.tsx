'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/simple-avatar';
import { toast } from 'sonner';
import { User as UserIcon, UserCircle, Mail, Building, Phone, Save, X } from 'lucide-react';
import userService, { UserProfile, UserProfileUpdateData } from '@/lib/api/user-service';
import { ChangePassword } from '@/components/profile/ChangePassword';
import { Preferences } from '@/components/profile/Preferences';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    companyName: '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Cargar datos del perfil del usuario cuando el componente se monta
  useEffect(() => {
    async function loadUserProfile() {
      if (isAuthenticated && user) {
        try {
          setProfileLoading(true);
          // Intentar obtener el perfil completo desde el servicio
          const profile = await userService.getUserProfile();
          setFormData(profile);
        } catch (error) {
          console.error('Error al cargar el perfil:', error);
          // Si hay un error, usar los datos básicos del contexto de autenticación
          if (user) {
            // Crear un perfil básico a partir de los datos disponibles
            setFormData({
              id: user.id,
              name: user.name || 'Usuario',
              email: user.email || '',
              companyName: user.companyName || '',
              phone: '',
              preferences: {
                darkMode: false,
                notifications: true,
                language: 'es',
              }
            });
          } else {
            toast.error('No se pudo cargar el perfil. Intenta iniciar sesión nuevamente.');
          }
        } finally {
          setProfileLoading(false);
        }
      }
    }

    loadUserProfile();
  }, [user, isAuthenticated]);

  // Obtener iniciales para el avatar
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Manejar la actualización del perfil
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setFormData(updatedProfile);
  };

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (loading || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>Necesitas iniciar sesión para ver esta página</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.href = '/login'}>
              Iniciar Sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda - Información general */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder-avatar.jpg" alt={formData.name} />
                <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/70 text-white font-semibold">
                  {getUserInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{formData.name}</CardTitle>
              <CardDescription>{formData.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4 opacity-70" />
                  <span>{formData.companyName}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 opacity-70" />
                    <span>{formData.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Más información o estadísticas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Fecha de registro</span>
                  <span>10/03/2023</span>
                </div>
                <div className="flex justify-between">
                  <span>Último acceso</span>
                  <span>Hoy</span>
                </div>
                <div className="flex justify-between">
                  <span>Productos gestionados</span>
                  <span>145</span>
                </div>
                <div className="flex justify-between">
                  <span>Órdenes procesadas</span>
                  <span>38</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Secciones del perfil */}
        <div className="md:col-span-2">
          <Tabs defaultValue="informacion">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informacion">Información Personal</TabsTrigger>
              <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
            </TabsList>

            <TabsContent value="informacion">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Aquí puedes ver tu información personal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <UserIcon className="mr-2 h-4 w-4 opacity-70" />
                        Nombre Completo
                      </h3>
                      <p className="text-base">{formData.name}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <Mail className="mr-2 h-4 w-4 opacity-70" />
                        Correo Electrónico
                      </h3>
                      <p className="text-base">{formData.email}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <Building className="mr-2 h-4 w-4 opacity-70" />
                        Empresa
                      </h3>
                      <p className="text-base">{formData.companyName || 'No especificado'}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <Phone className="mr-2 h-4 w-4 opacity-70" />
                        Teléfono
                      </h3>
                      <p className="text-base">{formData.phone || 'No especificado'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <EditProfileModal userProfile={formData} onProfileUpdate={handleProfileUpdate} />
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferencias">
              <Preferences userProfile={formData} />
            </TabsContent>
          </Tabs>

          {/* Sección de Seguridad */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Gestiona la seguridad de tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChangePassword />
              <Button variant="outline" className="w-full">Configurar Autenticación de Dos Factores</Button>
              <Button variant="outline" className="text-destructive w-full">Eliminar Cuenta</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
