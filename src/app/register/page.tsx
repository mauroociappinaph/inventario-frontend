'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/lib/api/auth-service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import SuccessModal from '@/components/ui/success-modal';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const router = useRouter();

  // Validaciones de contraseña
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === passwordConfirm;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && (hasNumber || hasSpecial);

  const handleRedirectToLogin = () => {
    router.push('/login');
  };

  // Actualizar estado para mostrar u ocultar requisitos de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Mostrar requisitos solo si hay algo escrito en el campo y la contraseña no es válida
    if (newPassword && !isPasswordValid) {
      setShowPasswordRequirements(true);
    } else if (isPasswordValid && !attemptedSubmit) {
      // Si la contraseña es válida y no ha habido intentos de envío fallidos, ocultamos los requisitos
      setShowPasswordRequirements(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setIsLoading(true);
    setError(null);

    try {
      // Verificar si todos los campos requeridos están completos
      if (!name || !email || !password || !companyName) {
        setError('Por favor completa todos los campos obligatorios');
        toast.error('Por favor completa todos los campos obligatorios');
        setIsLoading(false);
        return;
      }

      // Verificar que la contraseña cumpla con los requisitos
      if (!isPasswordValid) {
        setError('La contraseña no cumple con los requisitos mínimos');
        toast.error('La contraseña no cumple con los requisitos mínimos');
        setShowPasswordRequirements(true);
        setIsLoading(false);
        return;
      }

      // Verificar que las contraseñas coincidan
      if (!passwordsMatch) {
        setError('Las contraseñas no coinciden');
        toast.error('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }

      console.log('Iniciando registro de usuario:', { name, email, companyName });

      // Registrar los datos que se envían (sin mostrar la contraseña completa)
      const registerData = {
        name,
        email,
        password: password.substring(0, 2) + '****', // Solo para depuración
        companyName
      };
      console.log('Datos de registro:', registerData);

      await authService.register({
        name,
        email,
        password,
        companyName
      });

      console.log('Registro completado exitosamente');

      // Mostrar notificación de éxito
      toast.success('Registro exitoso. ¡Bienvenido!');

      // Pequeña pausa para asegurar que el estado se actualice antes de la redirección
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error: unknown) {
      console.error('Error completo de registro:', error);
      let errorMessage = 'Error al registrar usuario';

      // Intentar extraer mensaje de error específico
      if (typeof error === 'object' && error !== null) {
        const err = error as any;
        console.log('Estructura del error:', {
          response: err.response?.data,
          status: err.response?.status,
          message: err.message
        });

        if (err.response?.data?.message) {
          if (Array.isArray(err.response.data.message)) {
            errorMessage = err.response.data.message[0];
          } else {
            errorMessage = err.response.data.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      console.error('Mensaje de error final:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="grid min-h-svh place-items-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="space-y-2 text-center mb-6">
            <h1 className="text-4xl font-bold">Crear nueva cuenta</h1>
            <p className="text-muted-foreground">Completa el formulario para registrarte en InvSystem</p>
          </div>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={error && !name ? "border-red-300 dark:border-red-700" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={error && !email ? "border-red-300 dark:border-red-700" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Mi Empresa S.A."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className={error && !companyName ? "border-red-300 dark:border-red-700" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña *
                  {!showPasswordRequirements && !isPasswordValid && password && (
                    <span
                      className="text-xs ml-2 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      onClick={() => setShowPasswordRequirements(true)}
                    >
                      Ver requisitos
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className={error && !isPasswordValid ? "border-red-300 dark:border-red-700" : ""}
                    onFocus={() => {
                      // Mostrar requisitos al hacer focus si la contraseña no es válida
                      if (password && !isPasswordValid) {
                        setShowPasswordRequirements(true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {(showPasswordRequirements || (attemptedSubmit && !isPasswordValid)) && (
                  <div className="space-y-1 mt-2 text-xs">
                    <p className="font-medium text-muted-foreground">La contraseña debe contener:</p>
                    <div className="flex items-center gap-2">
                      {hasMinLength ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={hasMinLength ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        Al menos 6 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUppercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={hasUppercase ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        Al menos una letra mayúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasLowercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={hasLowercase ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        Al menos una letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasNumber || hasSpecial ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={hasNumber || hasSpecial ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        Al menos un número o carácter especial
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    className={error && passwordConfirm && !passwordsMatch ? "border-red-300 dark:border-red-700" : ""}
                  />
                </div>
                {passwordConfirm && !passwordsMatch && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Crear cuenta"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Modal de registro exitoso */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="¡Bienvenido a InvSystem!"
        message={`${name}, tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión con tus credenciales.`}
        redirectText="Ir a iniciar sesión"
        onRedirect={handleRedirectToLogin}
      />
    </>
  );
}
