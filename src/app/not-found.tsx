import { ErrorFallback } from '@/components/ui/error-fallback';

export default function NotFound() {
  return (
    <ErrorFallback
      code={404}
      title="Página no encontrada"
      message="Lo sentimos, la página que estás buscando no existe o ha sido movida a otra ubicación."
    />
  );
}
