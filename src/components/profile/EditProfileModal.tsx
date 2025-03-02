'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Building, Phone, Save, X, Pencil } from 'lucide-react';
import userService, { UserProfile, UserProfileUpdateData } from '@/lib/api/user-service';

interface EditProfileModalProps {
  userProfile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

export function EditProfileModal({ userProfile, onProfileUpdate }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    companyName: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Actualizar los datos del formulario cuando cambia el perfil
  useEffect(() => {
    if (userProfile) {
      setFormData({
        ...userProfile,
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Creamos el objeto con los datos a actualizar
    const updateData: UserProfileUpdateData = {
      name: formData.name,
      email: formData.email,
      companyName: formData.companyName,
      phone: formData.phone,
    };

    try {
      // Llamar al servicio para actualizar el perfil
      const updatedProfile = await userService.updateUserProfile(updateData);

      // Notificar al componente padre sobre la actualización
      onProfileUpdate(updatedProfile);

      toast.success('Perfil actualizado correctamente');
      setOpen(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    // Restaurar datos originales
    if (userProfile) {
      setFormData({
        ...userProfile,
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Pencil className="mr-2 h-4 w-4" />
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                Nombre Completo
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Empresa
              </Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Nombre de tu empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+54 (11) 1234-5678"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={cancelEdit}
              disabled={isSaving}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
