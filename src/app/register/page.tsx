'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/lib/api/auth-service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

// Patrones de validación (los mismos que en el backend)
const VALIDATION_PATTERNS = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  phone: /^\+?[0-9]{8,15}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

// Mensajes de error por campo
const ERROR_MESSAGES = {
  name: 'El nombre debe tener entre 2 y 100 caracteres',
  email: 'El email debe tener un formato válido',
  password: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  companyName: 'El nombre de la empresa debe tener entre 2 y 100 caracteres',
  initials: 'Las iniciales deben tener entre 2 y 4 caracteres',
  phone: 'El teléfono debe tener formato +XXXXXXXXXX (entre 8 y 15 dígitos)'
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    initials: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  // Validar el formulario cada vez que cambian los datos
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (formData.name && (formData.name.length < 2 || formData.name.length > 100)) {
      newErrors.name = ERROR_MESSAGES.name;
    }

    // Validar email
    if (formData.email && !VALIDATION_PATTERNS.email.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.email;
    }

    // Validar contraseña
    if (formData.password && !VALIDATION_PATTERNS.password.test(formData.password)) {
      newErrors.password = ERROR_MESSAGES.password;
    }

    // Validar nombre de empresa
    if (formData.companyName && (formData.companyName.length < 2 || formData.companyName.length > 100)) {
      newErrors.companyName = ERROR_MESSAGES.companyName;
    }

    // Validar iniciales (opcional)
    if (formData.initials && (formData.initials.length < 2 || formData.initials.length > 4)) {
      newErrors.initials = ERROR_MESSAGES.initials;
    }

    // Validar teléfono (opcional)
    if (formData.phone && !VALIDATION_PATTERNS.phone.test(formData.phone)) {
      newErrors.phone = ERROR_MESSAGES.phone;
    }

    setErrors(newErrors);

    // Determinar si el formulario es válido
    const requiredFieldsFilled = Boolean(formData.name && formData.email &&
                              formData.password && formData.companyName);
    setIsValid(requiredFieldsFilled && Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar el mensaje de error global cuando el usuario realiza cambios
    setErrorMsg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validar una última vez antes de enviar
    validateForm();
    if (!isValid) {
      const errorMessages = Object.values(errors).join(', ');
      setErrorMsg(`Por favor corrige los siguientes errores: ${errorMessages}`);
      toast.error('Hay errores en el formulario');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Depuración - muestra exactamente qué se está enviando al backend
    console.log('Enviando datos al backend:', JSON.stringify(formData, null, 2));

    try {
      await authService.register(formData);
      toast.success('Registro exitoso');
      router.push('/dashboard'); // Redirigir al dashboard después del registro
    } catch (error) {
      console.error('Error completo:', error);

      if (axios.isAxiosError(error) && error.response) {
        // Mostrar detalles específicos del error del backend
        const serverError = error.response.data;
        console.log('Respuesta del servidor:', serverError);

        let message = 'Error al registrar usuario';

        if (serverError.message) {
          if (Array.isArray(serverError.message)) {
            // Para errores de validación que devuelven un array de mensajes
            message = serverError.message.join(', ');
          } else {
            message = serverError.message;
          }
        }

        setErrorMsg(message);
        toast.error(message);
      } else {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Error al registrar usuario';
        setErrorMsg(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Crear cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Registra tus datos para comenzar a utilizar el sistema
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error de registro:</h3>
                <div className="mt-2 text-sm text-red-700">
                  {errorMsg}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={errors.password ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número.
            </p>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre de la empresa</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Tu Empresa S.A."
              value={formData.companyName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="initials">Iniciales (opcional)</Label>
              <Input
                id="initials"
                name="initials"
                placeholder="TE"
                value={formData.initials}
                onChange={handleChange}
                maxLength={4}
                disabled={isLoading}
                className={errors.initials ? 'border-red-500' : ''}
              />
              {errors.initials && <p className="text-xs text-red-500">{errors.initials}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+12345678900"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.phone ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">
                Formato: +12345678900 (con código de país)
              </p>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Iniciar sesión
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
